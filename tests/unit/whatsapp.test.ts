// tests/unit/whatsapp.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  replaceAppointmentVariables,
  formatWhatsAppUrl,
  DEFAULT_WHATSAPP_TEMPLATES,
  type AppointmentDataForWhatsApp,
} from '@/lib/whatsapp'
import {
  normalizePhoneNumber,
  dispatchWhatsAppMessage,
} from '@/lib/whatsapp-dispatch'
import type { WhatsAppNotificationSettings } from '@/types/database.types'

describe('Motor de WhatsApp & Plantillas', () => {
  describe('normalizePhoneNumber', () => {
    it('debe anteponer el código 51 a un número peruano de 9 dígitos', () => {
      expect(normalizePhoneNumber('987654321')).toBe('51987654321')
    })

    it('debe remover espacios, guiones y caracteres no numéricos', () => {
      expect(normalizePhoneNumber('+51 (987) 654-321')).toBe('51987654321')
      expect(normalizePhoneNumber('987 654 321')).toBe('51987654321')
    })

    it('debe mantener intacto un número que ya tiene el código de país (11 dígitos)', () => {
      expect(normalizePhoneNumber('51987654321')).toBe('51987654321')
    })
  })

  describe('replaceAppointmentVariables', () => {
    const mockData: AppointmentDataForWhatsApp = {
      clientName: 'Carlos Mendoza',
      clientPhone: '987654321',
      barberName: 'Mateo El Barbero',
      serviceName: 'Corte Degradado Fade',
      servicePrice: 35.0,
      startTime: '2026-09-15T15:00:00-05:00',
      barberiaName: 'Imperium Barber Club',
      barberiaAddress: 'Av. Larco 450, Miraflores',
    }

    it('debe sustituir todos los placeholders en una plantilla personalizada', () => {
      const template = 'Hola {cliente}, tu cita de {servicio} con {barbero} en {barberia} cuesta {precio}. Dirección: {direccion}'
      const result = replaceAppointmentVariables(template, mockData)

      expect(result).toContain('Carlos Mendoza')
      expect(result).toContain('Corte Degradado Fade')
      expect(result).toContain('Mateo El Barbero')
      expect(result).toContain('Imperium Barber Club')
      expect(result).toContain('S/ 35.00')
      expect(result).toContain('Av. Larco 450, Miraflores')
    })

    it('debe usar "Nuestro local principal" si la barbería no tiene dirección registrada', () => {
      const template = 'Ubicación: {direccion}'
      const result = replaceAppointmentVariables(template, {
        ...mockData,
        barberiaAddress: null,
      })
      expect(result).toBe('Ubicación: Nuestro local principal')
    })

    it('debe soportar la plantilla por defecto de confirmación', () => {
      const result = replaceAppointmentVariables(DEFAULT_WHATSAPP_TEMPLATES.confirmation, mockData)
      expect(result).toContain('Carlos Mendoza')
      expect(result).toContain('Imperium Barber Club')
      expect(result).toContain('confirmada con éxito')
    })
  })

  describe('formatWhatsAppUrl', () => {
    it('debe generar una URL wa.me válida codificada en UTF-8', () => {
      const url = formatWhatsAppUrl('987654321', '¡Hola Carlos! Tu cita está lista ✂️')
      expect(url.startsWith('https://wa.me/51987654321?text=')).toBe(true)
      expect(url).toContain('%C2%A1Hola%20Carlos') // "¡Hola Carlos"
    })
  })

  describe('dispatchWhatsAppMessage (Motor Híbrido)', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('debe operar en modo MANUAL y retornar enlace wa.me cuando provider es MANUAL o nulo', async () => {
      const result = await dispatchWhatsAppMessage({
        toPhone: '987654321',
        message: 'Recordatorio de cita',
        settings: null,
      })

      expect(result.success).toBe(true)
      expect(result.mode).toBe('MANUAL')
      expect(result.fallbackUrl).toContain('https://wa.me/51987654321')
    })

    it('debe retornar error con fallbackUrl en modo META_CLOUD_API si faltan credenciales', async () => {
      const settings: WhatsAppNotificationSettings = {
        provider: 'META_CLOUD_API',
        phoneNumberId: '',
        accessToken: '',
      }

      const result = await dispatchWhatsAppMessage({
        toPhone: '987654321',
        message: 'Mensaje de prueba',
        settings,
      })

      expect(result.success).toBe(false)
      expect(result.mode).toBe('MANUAL')
      expect(result.error).toContain('Faltan credenciales')
      expect(result.fallbackUrl).toContain('https://wa.me/51987654321')
    })

    it('debe enviar mensaje exitosamente vía Meta Cloud API cuando las credenciales son válidas', async () => {
      const settings: WhatsAppNotificationSettings = {
        provider: 'META_CLOUD_API',
        phoneNumberId: '1092837465',
        accessToken: 'EAAG_fake_token_valid',
      }

      // Mock de fetch exitoso
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '51987654321', wa_id: '51987654321' }],
          messages: [{ id: 'wamid.HBgLMTIzNDU2' }],
        }),
      } as any)

      const result = await dispatchWhatsAppMessage({
        toPhone: '987654321',
        message: 'Tu turno está listo',
        settings,
      })

      expect(result.success).toBe(true)
      expect(result.mode).toBe('API')
      expect(result.messageId).toBe('wamid.HBgLMTIzNDU2')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v20.0/1092837465/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer EAAG_fake_token_valid',
          }),
        })
      )
    })

    it('debe activar el fallback manual si Meta Cloud API devuelve error HTTP 401 o token expirado', async () => {
      const settings: WhatsAppNotificationSettings = {
        provider: 'META_CLOUD_API',
        phoneNumberId: '1092837465',
        accessToken: 'expired_token',
      }

      // Mock de fetch fallido
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Session has expired or token is invalid.',
            type: 'OAuthException',
            code: 190,
          },
        }),
      } as any)

      const result = await dispatchWhatsAppMessage({
        toPhone: '987654321',
        message: 'Hola cliente',
        settings,
      })

      expect(result.success).toBe(false)
      expect(result.mode).toBe('MANUAL')
      expect(result.error).toContain('Session has expired')
      expect(result.fallbackUrl).toContain('https://wa.me/51987654321')
    })

    it('debe soportar CUSTOM_GATEWAY y fallar con fallback si el webhook falla o no responde', async () => {
      const settings: WhatsAppNotificationSettings = {
        provider: 'CUSTOM_GATEWAY',
        webhookUrl: 'https://gateway.example.com/api/send',
      }

      global.fetch = vi.fn().mockRejectedValue(new Error('Conexión rehusada al gateway'))

      const result = await dispatchWhatsAppMessage({
        toPhone: '987654321',
        message: 'Aviso urgente',
        settings,
      })

      expect(result.success).toBe(false)
      expect(result.mode).toBe('MANUAL')
      expect(result.error).toContain('Conexión rehusada')
      expect(result.fallbackUrl).toContain('https://wa.me/51987654321')
    })
  })
})
