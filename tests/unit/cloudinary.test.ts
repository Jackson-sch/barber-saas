import { describe, it, expect } from 'vitest'
import {
  isCloudinaryConfigured,
  buildCloudinaryUploadUrl,
  resolveCloudinaryFolder,
} from '@/lib/cloudinary'

describe('Cloudinary BYOK Helper', () => {
  it('detecta correctamente si Cloudinary está configurado y activo', () => {
    expect(isCloudinaryConfigured(null)).toBe(false)
    expect(
      isCloudinaryConfigured({
        enabled: false,
        cloud_name: 'mi-cloud',
        upload_preset: 'mi-preset',
      })
    ).toBe(false)
    expect(
      isCloudinaryConfigured({
        enabled: true,
        cloud_name: '',
        upload_preset: 'mi-preset',
      })
    ).toBe(false)
    expect(
      isCloudinaryConfigured({
        enabled: true,
        cloud_name: 'mi-cloud',
        upload_preset: 'mi-preset',
      })
    ).toBe(true)
  })

  it('construye la URL de subida oficial de Cloudinary', () => {
    expect(buildCloudinaryUploadUrl(' barberos-pe ')).toBe(
      'https://api.cloudinary.com/v1_1/barberos-pe/image/upload'
    )
  })

  it('resuelve carpetas base y subcarpetas sin barras duplicadas', () => {
    expect(resolveCloudinaryFolder('/barberos/ibs/', '/vouchers/')).toBe('barberos/ibs/vouchers')
    expect(resolveCloudinaryFolder('', 'branding')).toBe('branding')
    expect(resolveCloudinaryFolder('barberos/ibs', undefined)).toBe('barberos/ibs')
    expect(resolveCloudinaryFolder('', '')).toBeUndefined()
  })
})
