'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyOrgAccess } from '@/lib/tenant'
import { getOrganizationSecretsServer } from '@/lib/organization-secrets'
import {
  dispatchWhatsAppMessage,
  type WhatsAppDispatchResult,
} from '@/lib/whatsapp-dispatch'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import type { WhatsAppNotificationSettings } from '@/types/database.types'

interface SendWhatsAppParams {
  organizationId: string
  toPhone: string
  message: string
  templateType?: 'reminder' | 'confirmation' | 'reschedule' | 'followup' | 'custom'
}

/**
 * Server action para enviar mensajes de WhatsApp de forma híbrida:
 * Obtiene la configuración guardada de la organización en la BD y despacha.
 */
export async function sendWhatsAppHybridAction({
  organizationId,
  toPhone,
  message,
  templateType = 'custom',
}: SendWhatsAppParams): Promise<WhatsAppDispatchResult> {
  try {
    const access = await verifyOrgAccess(organizationId)
    if (!access.authorized) {
      return {
        success: false,
        mode: 'MANUAL',
        fallbackUrl: formatWhatsAppUrl(toPhone, message),
        error: access.error || 'No autorizado',
      }
    }
    const { supabase } = access


    // 1. Obtener settings de la organización
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .select('settings, name')
      .eq('id', organizationId)
      .single()

    if (orgErr || !org) {
      console.warn('Could not fetch org settings for WhatsApp dispatch:', orgErr)
      return dispatchWhatsAppMessage({
        toPhone,
        message,
        templateType,
        settings: null,
      })
    }

    const orgSettings = (org.settings as any) || {}
    const rawWaSettings: WhatsAppNotificationSettings | undefined =
      orgSettings.whatsapp_notifications ||
      orgSettings.whatsapp_settings ||
      orgSettings.whatsappSettings

    const secrets = await getOrganizationSecretsServer(organizationId)
    const waSettings: WhatsAppNotificationSettings | undefined = rawWaSettings
      ? {
          ...rawWaSettings,
          accessToken: secrets.whatsapp_access_token || rawWaSettings.accessToken,
          webhookBearerToken: secrets.whatsapp_webhook_token || rawWaSettings.webhookBearerToken,
        }
      : undefined

    return await dispatchWhatsAppMessage({
      toPhone,
      message,
      templateType,
      settings: waSettings,
    })
  } catch (err: any) {
    console.error('Error in sendWhatsAppHybridAction:', err)
    return dispatchWhatsAppMessage({
      toPhone,
      message,
      templateType,
      settings: null,
    })
  }
}

interface TestCredentialsParams {
  testPhone: string
  settings: WhatsAppNotificationSettings
  organizationName?: string
}

/**
 * Prueba en vivo de las credenciales de WhatsApp antes de guardar
 */
export async function testWhatsAppCredentialsAction({
  testPhone,
  settings,
  organizationName = 'BarberOS',
}: TestCredentialsParams): Promise<WhatsAppDispatchResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    return {
      success: false,
      mode: 'MANUAL',
      fallbackUrl: formatWhatsAppUrl(testPhone, ''),
      error: 'No autorizado',
    }
  }

  const testMessage = `💈 ¡Hola! Este es un mensaje de prueba exitoso enviado desde ${organizationName} a través del sistema BarberOS. ✂️ Si recibiste esto, tu conexión de WhatsApp está 100% activa.`

  return await dispatchWhatsAppMessage({
    toPhone: testPhone,
    message: testMessage,
    templateType: 'custom',
    settings,
  })
}
