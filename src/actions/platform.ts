'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getPlatformSecretsServer,
  toPlatformSecretsSafeView,
  uploadImageToPlatformCloudinary,
  type PlatformSecretsSafeView,
} from '@/lib/platform-secrets'
import { revalidatePath } from 'next/cache'

export interface UpdatePlatformSettingsInput {
  platform_name: string
  yape_phone?: string | null
  yape_holder?: string | null
  yape_qr_url?: string | null
  plin_phone?: string | null
  bank_name?: string | null
  bank_account?: string | null
  bank_cci?: string | null
  bank_holder?: string | null
  starter_price: number
  pro_price: number
  enterprise_price: number
  trial_days: number
  support_whatsapp?: string | null
  support_email?: string | null
}

export async function updatePlatformSettingsAction(input: UpdatePlatformSettingsInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado.' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_super_admin) {
      return { error: 'Acceso denegado: solo para súper administradores.' }
    }

    let finalQrUrl = input.yape_qr_url?.trim() || null
    if (finalQrUrl && finalQrUrl.startsWith('data:image/')) {
      const uploadedQr = await uploadImageToPlatformCloudinary(finalQrUrl, 'platform-qr')
      if (uploadedQr?.url) {
        finalQrUrl = uploadedQr.url
      }
    }

    const payload = {
      id: 'default',
      platform_name: input.platform_name.trim() || 'BarberOS',
      yape_phone: input.yape_phone?.trim() || null,
      yape_holder: input.yape_holder?.trim() || null,
      yape_qr_url: finalQrUrl,
      plin_phone: input.plin_phone?.trim() || null,
      bank_name: input.bank_name?.trim() || 'BCP Soles',
      bank_account: input.bank_account?.trim() || null,
      bank_cci: input.bank_cci?.trim() || null,
      bank_holder: input.bank_holder?.trim() || null,
      starter_price: Math.max(1, Number(input.starter_price) || 59),
      pro_price: Math.max(1, Number(input.pro_price) || 99),
      enterprise_price: Math.max(1, Number(input.enterprise_price) || 179),
      trial_days: Math.max(1, Math.min(365, parseInt(String(input.trial_days), 10) || 14)),
      support_whatsapp: input.support_whatsapp?.trim() || null,
      support_email: input.support_email?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('platform_settings')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error('Error updating platform settings:', error)
      return {
        error:
          'No se pudo guardar en base de datos. Asegúrate de haber ejecutado el schema.sql actualizado (tabla platform_settings).',
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/configuracion')
    revalidatePath('/app', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('updatePlatformSettingsAction error:', err)
    return { error: err?.message || 'Error inesperado al guardar configuración.' }
  }
}

export interface UpdatePlatformSecretsInput {
  cloudinary_enabled: boolean
  cloudinary_cloud_name?: string | null
  cloudinary_api_key?: string | null
  cloudinary_api_secret?: string | null
  clear_cloudinary_api_secret?: boolean
  cloudinary_upload_preset?: string | null
  cloudinary_folder?: string | null

  email_provider: 'NONE' | 'RESEND' | 'SMTP'
  email_from_name?: string | null
  email_from_address?: string | null
  resend_api_key?: string | null
  clear_resend_api_key?: boolean
  smtp_host?: string | null
  smtp_port?: number | null
  smtp_user?: string | null
  smtp_password?: string | null
  clear_smtp_password?: boolean

  whatsapp_provider: 'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY'
  whatsapp_phone_number_id?: string | null
  whatsapp_access_token?: string | null
  clear_whatsapp_access_token?: boolean
  whatsapp_gateway_url?: string | null
  whatsapp_admin_notify_phone?: string | null

  culqi_public_key?: string | null
  culqi_secret_key?: string | null
  clear_culqi_secret_key?: boolean
  mercadopago_public_key?: string | null
  mercadopago_access_token?: string | null
  clear_mercadopago_access_token?: boolean

  cron_secret?: string | null
  clear_cron_secret?: boolean
  webhook_notify_url?: string | null
}

function resolveSecretValue(
  newValue: string | null | undefined,
  existingValue: string | null,
  clear?: boolean
): string | null {
  if (clear) return null
  const trimmed = newValue?.trim()
  if (trimmed && trimmed.length > 0) return trimmed
  return existingValue
}

export async function updatePlatformSecretsAction(
  input: UpdatePlatformSecretsInput
): Promise<{ success?: boolean; error?: string; secretsView?: PlatformSecretsSafeView }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado.' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_super_admin) {
      return { error: 'Acceso denegado: solo para súper administradores.' }
    }

    const existing = await getPlatformSecretsServer()

    const payload = {
      id: 'default',
      cloudinary_enabled: Boolean(input.cloudinary_enabled),
      cloudinary_cloud_name: input.cloudinary_cloud_name?.trim() || null,
      cloudinary_api_key: input.cloudinary_api_key?.trim() || null,
      cloudinary_api_secret: resolveSecretValue(
        input.cloudinary_api_secret,
        existing.cloudinary_api_secret,
        input.clear_cloudinary_api_secret
      ),
      cloudinary_upload_preset: input.cloudinary_upload_preset?.trim() || null,
      cloudinary_folder: input.cloudinary_folder?.trim() || 'barberos-saas',

      email_provider: input.email_provider || 'NONE',
      email_from_name: input.email_from_name?.trim() || 'BarberOS',
      email_from_address: input.email_from_address?.trim() || null,
      resend_api_key: resolveSecretValue(
        input.resend_api_key,
        existing.resend_api_key,
        input.clear_resend_api_key
      ),
      smtp_host: input.smtp_host?.trim() || null,
      smtp_port: Number(input.smtp_port) || 587,
      smtp_user: input.smtp_user?.trim() || null,
      smtp_password: resolveSecretValue(
        input.smtp_password,
        existing.smtp_password,
        input.clear_smtp_password
      ),

      whatsapp_provider: input.whatsapp_provider || 'NONE',
      whatsapp_phone_number_id: input.whatsapp_phone_number_id?.trim() || null,
      whatsapp_access_token: resolveSecretValue(
        input.whatsapp_access_token,
        existing.whatsapp_access_token,
        input.clear_whatsapp_access_token
      ),
      whatsapp_gateway_url: input.whatsapp_gateway_url?.trim() || null,
      whatsapp_admin_notify_phone: input.whatsapp_admin_notify_phone?.trim() || null,

      culqi_public_key: input.culqi_public_key?.trim() || null,
      culqi_secret_key: resolveSecretValue(
        input.culqi_secret_key,
        existing.culqi_secret_key,
        input.clear_culqi_secret_key
      ),
      mercadopago_public_key: input.mercadopago_public_key?.trim() || null,
      mercadopago_access_token: resolveSecretValue(
        input.mercadopago_access_token,
        existing.mercadopago_access_token,
        input.clear_mercadopago_access_token
      ),

      cron_secret: resolveSecretValue(input.cron_secret, existing.cron_secret, input.clear_cron_secret),
      webhook_notify_url: input.webhook_notify_url?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('platform_secrets')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error('Error updating platform secrets:', error)
      return {
        error:
          'No se pudieron guardar las integraciones. Asegúrate de haber ejecutado el schema.sql actualizado (tabla platform_secrets).',
      }
    }

    const updated = await getPlatformSecretsServer()
    revalidatePath('/admin/configuracion')
    return { success: true, secretsView: toPlatformSecretsSafeView(updated) }
  } catch (err: any) {
    console.error('updatePlatformSecretsAction error:', err)
    return { error: err?.message || 'Error inesperado al guardar credenciales.' }
  }
}
