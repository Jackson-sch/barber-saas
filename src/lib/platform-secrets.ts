import crypto from 'node:crypto'
import { Pool } from 'pg'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { buildCloudinaryUploadUrl, resolveCloudinaryFolder } from '@/lib/cloudinary'

export interface PlatformSecretsData {
  cloudinary_enabled: boolean
  cloudinary_cloud_name: string | null
  cloudinary_api_key: string | null
  cloudinary_api_secret: string | null
  cloudinary_upload_preset: string | null
  cloudinary_folder: string | null

  email_provider: 'NONE' | 'RESEND' | 'SMTP'
  email_from_name: string | null
  email_from_address: string | null
  resend_api_key: string | null
  smtp_host: string | null
  smtp_port: number | null
  smtp_user: string | null
  smtp_password: string | null

  whatsapp_provider: 'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY'
  whatsapp_phone_number_id: string | null
  whatsapp_access_token: string | null
  whatsapp_gateway_url: string | null
  whatsapp_admin_notify_phone: string | null

  culqi_public_key: string | null
  culqi_secret_key: string | null
  mercadopago_public_key: string | null
  mercadopago_access_token: string | null

  cron_secret: string | null
  webhook_notify_url: string | null
}

/**
 * Vista segura para enviar al cliente del SuperAdmin:
 * incluye configuraciones no secretas y flags booleanos para las llaves privadas
 * sin exponer secretos en texto plano al navegador.
 */
export interface PlatformSecretsSafeView {
  cloudinary_enabled: boolean
  cloudinary_cloud_name: string
  cloudinary_api_key: string
  has_cloudinary_api_secret: boolean
  cloudinary_upload_preset: string
  cloudinary_folder: string

  email_provider: 'NONE' | 'RESEND' | 'SMTP'
  email_from_name: string
  email_from_address: string
  has_resend_api_key: boolean
  smtp_host: string
  smtp_port: number
  smtp_user: string
  has_smtp_password: boolean

  whatsapp_provider: 'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY'
  whatsapp_phone_number_id: string
  has_whatsapp_access_token: boolean
  whatsapp_gateway_url: string
  whatsapp_admin_notify_phone: string

  culqi_public_key: string
  has_culqi_secret_key: boolean
  mercadopago_public_key: string
  has_mercadopago_access_token: boolean

  has_cron_secret: boolean
  webhook_notify_url: string
}

export const DEFAULT_PLATFORM_SECRETS: PlatformSecretsData = {
  cloudinary_enabled: false,
  cloudinary_cloud_name: null,
  cloudinary_api_key: null,
  cloudinary_api_secret: null,
  cloudinary_upload_preset: null,
  cloudinary_folder: 'barberos-saas',

  email_provider: 'NONE',
  email_from_name: 'BarberOS',
  email_from_address: null,
  resend_api_key: null,
  smtp_host: null,
  smtp_port: 587,
  smtp_user: null,
  smtp_password: null,

  whatsapp_provider: 'NONE',
  whatsapp_phone_number_id: null,
  whatsapp_access_token: null,
  whatsapp_gateway_url: null,
  whatsapp_admin_notify_phone: null,

  culqi_public_key: null,
  culqi_secret_key: null,
  mercadopago_public_key: null,
  mercadopago_access_token: null,

  cron_secret: null,
  webhook_notify_url: null,
}

const globalForPg = globalThis as unknown as { __barberPlatformSecretsPgPool?: Pool }

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) return null

  if (!globalForPg.__barberPlatformSecretsPgPool) {
    globalForPg.__barberPlatformSecretsPgPool = new Pool({
      connectionString,
      max: 3,
      ssl: { rejectUnauthorized: false },
    })
  }
  return globalForPg.__barberPlatformSecretsPgPool
}

function normalizePlatformSecrets(row: Record<string, any> | null | undefined): PlatformSecretsData {
  if (!row) return DEFAULT_PLATFORM_SECRETS

  const emailProvider =
    row.email_provider === 'RESEND' || row.email_provider === 'SMTP' ? row.email_provider : 'NONE'
  const whatsappProvider =
    row.whatsapp_provider === 'META_CLOUD' || row.whatsapp_provider === 'CUSTOM_GATEWAY'
      ? row.whatsapp_provider
      : 'NONE'

  return {
    cloudinary_enabled: Boolean(row.cloudinary_enabled),
    cloudinary_cloud_name: row.cloudinary_cloud_name ?? null,
    cloudinary_api_key: row.cloudinary_api_key ?? null,
    cloudinary_api_secret: row.cloudinary_api_secret ?? null,
    cloudinary_upload_preset: row.cloudinary_upload_preset ?? null,
    cloudinary_folder: row.cloudinary_folder ?? 'barberos-saas',

    email_provider: emailProvider,
    email_from_name: row.email_from_name ?? 'BarberOS',
    email_from_address: row.email_from_address ?? null,
    resend_api_key: row.resend_api_key ?? null,
    smtp_host: row.smtp_host ?? null,
    smtp_port: row.smtp_port ? Number(row.smtp_port) : 587,
    smtp_user: row.smtp_user ?? null,
    smtp_password: row.smtp_password ?? null,

    whatsapp_provider: whatsappProvider,
    whatsapp_phone_number_id: row.whatsapp_phone_number_id ?? null,
    whatsapp_access_token: row.whatsapp_access_token ?? null,
    whatsapp_gateway_url: row.whatsapp_gateway_url ?? null,
    whatsapp_admin_notify_phone: row.whatsapp_admin_notify_phone ?? null,

    culqi_public_key: row.culqi_public_key ?? null,
    culqi_secret_key: row.culqi_secret_key ?? null,
    mercadopago_public_key: row.mercadopago_public_key ?? null,
    mercadopago_access_token: row.mercadopago_access_token ?? null,

    cron_secret: row.cron_secret ?? null,
    webhook_notify_url: row.webhook_notify_url ?? null,
  }
}

export function toPlatformSecretsSafeView(secrets: PlatformSecretsData): PlatformSecretsSafeView {
  return {
    cloudinary_enabled: secrets.cloudinary_enabled,
    cloudinary_cloud_name: secrets.cloudinary_cloud_name || '',
    cloudinary_api_key: secrets.cloudinary_api_key || '',
    has_cloudinary_api_secret: Boolean(secrets.cloudinary_api_secret?.trim()),
    cloudinary_upload_preset: secrets.cloudinary_upload_preset || '',
    cloudinary_folder: secrets.cloudinary_folder || 'barberos-saas',

    email_provider: secrets.email_provider,
    email_from_name: secrets.email_from_name || 'BarberOS',
    email_from_address: secrets.email_from_address || '',
    has_resend_api_key: Boolean(secrets.resend_api_key?.trim()),
    smtp_host: secrets.smtp_host || '',
    smtp_port: secrets.smtp_port || 587,
    smtp_user: secrets.smtp_user || '',
    has_smtp_password: Boolean(secrets.smtp_password?.trim()),

    whatsapp_provider: secrets.whatsapp_provider,
    whatsapp_phone_number_id: secrets.whatsapp_phone_number_id || '',
    has_whatsapp_access_token: Boolean(secrets.whatsapp_access_token?.trim()),
    whatsapp_gateway_url: secrets.whatsapp_gateway_url || '',
    whatsapp_admin_notify_phone: secrets.whatsapp_admin_notify_phone || '',

    culqi_public_key: secrets.culqi_public_key || '',
    has_culqi_secret_key: Boolean(secrets.culqi_secret_key?.trim()),
    mercadopago_public_key: secrets.mercadopago_public_key || '',
    has_mercadopago_access_token: Boolean(secrets.mercadopago_access_token?.trim()),

    has_cron_secret: Boolean(secrets.cron_secret?.trim()),
    webhook_notify_url: secrets.webhook_notify_url || '',
  }
}

/**
 * Lee los secretos globales de la plataforma exclusivamente en el servidor.
 * 1. Intenta vía Supabase (funciona cuando el usuario autenticado es SuperAdmin).
 * 2. Si el flujo es iniciado por un tenant (ej. subir comprobante de pago al Cloudinary de la plataforma),
 *    usa el pool directo de PostgreSQL en el servidor sin exponer las llaves al cliente.
 */
export async function getPlatformSecretsServer(): Promise<PlatformSecretsData> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_secrets')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (!error && data) {
      return normalizePlatformSecrets(data)
    }
  } catch {
    // Fallback al pool PostgreSQL en servidor
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceRoleKey && supabaseUrl) {
    try {
      const adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await adminClient
        .from('platform_secrets')
        .select('*')
        .eq('id', 'default')
        .maybeSingle()

      if (!error && data) {
        return normalizePlatformSecrets(data)
      }
    } catch {
      // Fallback al pool PostgreSQL
    }
  }

  const pool = getPgPool()
  if (pool) {
    try {
      const res = await pool.query(`SELECT * FROM public.platform_secrets WHERE id = 'default' LIMIT 1`)
      if (res.rows[0]) {
        return normalizePlatformSecrets(res.rows[0])
      }
    } catch (err: any) {
      if (err?.code !== '42P01') {
        console.warn('[platform-secrets] Error querying PostgreSQL:', err?.message || err)
      }
    }
  } else if (!serviceRoleKey) {
    console.warn(
      '[platform-secrets] Ni SUPABASE_SERVICE_ROLE_KEY ni DATABASE_URL/DIRECT_URL están configurados en este entorno; un usuario cliente no puede leer platform_secrets.'
    )
  }

  return DEFAULT_PLATFORM_SECRETS
}

/**
 * Sube una imagen (DataURL o URL) al Cloudinary global de la plataforma (SuperAdmin).
 * Soporta subida firmada (api_key + api_secret, recomendada) o unsigned (upload_preset).
 * Si no está configurado o falla, devuelve null para permitir fallback seguro.
 */
export async function uploadImageToPlatformCloudinary(
  imageDataUrl: string,
  subFolder = 'vouchers'
): Promise<{ url: string; publicId?: string } | null> {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    return null
  }

  const secrets = await getPlatformSecretsServer()
  const cloudName = secrets.cloudinary_cloud_name?.trim()
  if (!secrets.cloudinary_enabled || !cloudName) {
    return null
  }

  const folder = resolveCloudinaryFolder(secrets.cloudinary_folder, subFolder)
  const formData = new FormData()
  formData.append('file', imageDataUrl)

  const apiKey = secrets.cloudinary_api_key?.trim()
  const apiSecret = secrets.cloudinary_api_secret?.trim()
  const uploadPreset = secrets.cloudinary_upload_preset?.trim()

  if (apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign: Record<string, string | number> = { timestamp }
    if (folder) {
      paramsToSign.folder = folder
    }

    const serialized = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&')

    const signature = crypto
      .createHash('sha1')
      .update(`${serialized}${apiSecret}`)
      .digest('hex')

    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    if (folder) {
      formData.append('folder', folder)
    }
  } else if (uploadPreset) {
    formData.append('upload_preset', uploadPreset)
    if (folder) {
      formData.append('folder', folder)
    }
  } else {
    return null
  }

  try {
    const res = await fetch(buildCloudinaryUploadUrl(cloudName), {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok || !data?.secure_url) {
      console.warn('[Platform Cloudinary] Upload failed:', data?.error?.message || res.status)
      return null
    }

    return {
      url: data.secure_url as string,
      publicId: data.public_id as string | undefined,
    }
  } catch (err) {
    console.warn('[Platform Cloudinary] Network error:', err)
    return null
  }
}
