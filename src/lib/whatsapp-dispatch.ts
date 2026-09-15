// src/lib/whatsapp-dispatch.ts
import { formatWhatsAppUrl } from './whatsapp'
import type { WhatsAppNotificationSettings } from '@/types/database.types'

export interface WhatsAppDispatchParams {
  toPhone: string
  message: string
  templateType?: 'reminder' | 'confirmation' | 'reschedule' | 'followup' | 'custom'
  settings?: WhatsAppNotificationSettings | null
}

export interface WhatsAppDispatchResult {
  success: boolean
  mode: 'API' | 'GATEWAY' | 'MANUAL'
  fallbackUrl: string
  messageId?: string
  error?: string
}

/**
 * Limpia y normaliza el número telefónico asegurando el código de país (51 para Perú si tiene 9 dígitos)
 */
export function normalizePhoneNumber(phone: string): string {
  let clean = phone.replace(/\D/g, '')
  if (clean.length === 9) {
    clean = `51${clean}`
  }
  return clean
}

/**
 * Envia un mensaje de WhatsApp según la configuración híbrida del salón:
 * 1. Si está configurado META_CLOUD_API y tiene keys válidas -> Intenta Meta Graph API
 * 2. Si está configurado CUSTOM_GATEWAY y tiene webhookUrl -> Envía POST al gateway
 * 3. Si falla la API o está en modo MANUAL -> Devuelve éxito con fallbackUrl a wa.me
 */
export async function dispatchWhatsAppMessage({
  toPhone,
  message,
  templateType = 'custom',
  settings,
}: WhatsAppDispatchParams): Promise<WhatsAppDispatchResult> {
  const cleanPhone = normalizePhoneNumber(toPhone)
  const manualUrl = formatWhatsAppUrl(toPhone, message)

  const provider = settings?.provider || 'MANUAL'

  // Caso 1: Modo Manual explícito o sin credenciales
  if (provider === 'MANUAL') {
    return {
      success: true,
      mode: 'MANUAL',
      fallbackUrl: manualUrl,
    }
  }

  // Caso 2: Meta WhatsApp Cloud API
  if (provider === 'META_CLOUD_API') {
    const phoneNumberId = settings?.phoneNumberId?.trim()
    const accessToken = settings?.accessToken?.trim()

    if (!phoneNumberId || !accessToken) {
      return {
        success: false,
        mode: 'MANUAL',
        fallbackUrl: manualUrl,
        error: 'Faltan credenciales de Meta Cloud API (Phone Number ID o Token)',
      }
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: message,
            },
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || result.error) {
        const errMsg =
          result.error?.message ||
          result.error?.error_data?.details ||
          `Error HTTP ${response.status} de Meta API`
        console.warn('Meta WhatsApp API dispatch failed:', errMsg)
        return {
          success: false,
          mode: 'MANUAL',
          fallbackUrl: manualUrl,
          error: errMsg,
        }
      }

      const messageId = result.messages?.[0]?.id || 'ok'
      return {
        success: true,
        mode: 'API',
        messageId,
        fallbackUrl: manualUrl,
      }
    } catch (err: any) {
      console.error('Exception in Meta WhatsApp API dispatch:', err)
      return {
        success: false,
        mode: 'MANUAL',
        fallbackUrl: manualUrl,
        error: err.message || 'Error de conexión con Meta WhatsApp API',
      }
    }
  }

  // Caso 3: Custom Gateway / Webhook
  if (provider === 'CUSTOM_GATEWAY') {
    const webhookUrl = settings?.webhookUrl?.trim()
    if (!webhookUrl) {
      return {
        success: false,
        mode: 'MANUAL',
        fallbackUrl: manualUrl,
        error: 'No se configuró la URL del Webhook o Gateway',
      }
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (settings?.webhookBearerToken) {
        headers['Authorization'] = `Bearer ${settings.webhookBearerToken.trim()}`
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: cleanPhone,
          message,
          templateType,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        return {
          success: false,
          mode: 'MANUAL',
          fallbackUrl: manualUrl,
          error: `Error HTTP ${response.status} en Gateway: ${text.slice(0, 100)}`,
        }
      }

      return {
        success: true,
        mode: 'GATEWAY',
        fallbackUrl: manualUrl,
      }
    } catch (err: any) {
      console.error('Exception in Gateway dispatch:', err)
      return {
        success: false,
        mode: 'MANUAL',
        fallbackUrl: manualUrl,
        error: err.message || 'Fallo de conexión con Gateway personalizado',
      }
    }
  }

  return {
    success: true,
    mode: 'MANUAL',
    fallbackUrl: manualUrl,
  }
}
