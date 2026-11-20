import type { CloudinarySettings } from '@/types/database.types'

export interface CloudinaryUploadResult {
  url: string
  provider: 'CLOUDINARY' | 'BASE64_FALLBACK'
  publicId?: string
  error?: string
}

export function isCloudinaryConfigured(settings?: CloudinarySettings | null): boolean {
  return Boolean(
    settings?.enabled &&
      settings.cloud_name?.trim().length > 0 &&
      settings.upload_preset?.trim().length > 0
  )
}

export function buildCloudinaryUploadUrl(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName.trim())}/image/upload`
}

export function resolveCloudinaryFolder(
  baseFolder: string | null | undefined,
  subFolder?: string
): string | undefined {
  const cleanBase = baseFolder?.trim().replace(/^\/+|\/+$/g, '') || ''
  const cleanSub = subFolder?.trim().replace(/^\/+|\/+$/g, '') || ''

  if (cleanBase && cleanSub) return `${cleanBase}/${cleanSub}`
  if (cleanBase) return cleanBase
  if (cleanSub) return cleanSub
  return undefined
}

/**
 * Comprime una imagen en el navegador a DataURL JPEG para reducir tamaño
 * tanto para subir a Cloudinary como para el fallback Base64.
 */
export function compressImageToDataUrl(
  file: File,
  maxDim = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(reader.result as string)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(reader.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Sube una imagen al Cloudinary propio de la barbería (vía Unsigned Upload Preset).
 * Si Cloudinary no está habilitado o falla la red, devuelve el fallback comprimido en Base64
 * para que la operación nunca quede bloqueada.
 */
export async function uploadImageWithCloudinary({
  file,
  settings,
  subFolder,
  maxDim = 1200,
}: {
  file: File
  settings?: CloudinarySettings | null
  subFolder?: string
  maxDim?: number
}): Promise<CloudinaryUploadResult> {
  const compressedDataUrl = await compressImageToDataUrl(file, maxDim, 0.82)

  if (!isCloudinaryConfigured(settings) || !settings) {
    return {
      url: compressedDataUrl,
      provider: 'BASE64_FALLBACK',
    }
  }

  try {
    const formData = new FormData()
    formData.append('file', compressedDataUrl)
    formData.append('upload_preset', settings.upload_preset.trim())

    const folder = resolveCloudinaryFolder(settings.folder, subFolder)
    if (folder) {
      formData.append('folder', folder)
    }

    const res = await fetch(buildCloudinaryUploadUrl(settings.cloud_name), {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok || !data.secure_url) {
      const errMsg = data?.error?.message || `Error HTTP ${res.status} al subir a Cloudinary`
      console.warn('[Cloudinary] Upload failed, using fallback:', errMsg)
      return {
        url: compressedDataUrl,
        provider: 'BASE64_FALLBACK',
        error: errMsg,
      }
    }

    return {
      url: data.secure_url as string,
      publicId: data.public_id as string | undefined,
      provider: 'CLOUDINARY',
    }
  } catch (err: any) {
    console.warn('[Cloudinary] Network error, using fallback:', err)
    return {
      url: compressedDataUrl,
      provider: 'BASE64_FALLBACK',
      error: err?.message || 'Error de red al conectar con Cloudinary',
    }
  }
}
