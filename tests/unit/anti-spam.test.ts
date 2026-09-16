// tests/unit/anti-spam.test.ts
import { describe, it, expect } from 'vitest'
import { validateHoneypot, validateSubmissionSpeed } from '@/lib/anti-spam'

describe('Mecanismos de Protección Anti-Spam y Anti-Bots', () => {
  describe('validateHoneypot (Trampa de Campo Oculto)', () => {
    it('debe permitir envíos legítimos donde el honeypot está vacío o no está definido', () => {
      expect(validateHoneypot(undefined)).toBe(true)
      expect(validateHoneypot('')).toBe(true)
      expect(validateHoneypot('   ')).toBe(true)
    })

    it('debe rechazar y bloquear envíos donde el bot completó el campo honeypot', () => {
      expect(validateHoneypot('https://spambot-link.ru')).toBe(false)
      expect(validateHoneypot('marketing-spam')).toBe(false)
      expect(validateHoneypot('1')).toBe(false)
      expect(validateHoneypot('john.doe@fake-spammer.com')).toBe(false)
    })
  })

  describe('validateSubmissionSpeed (Time-Gate)', () => {
    it('debe permitir envíos si no se proporcionó timestamp (tolerancia a fallos)', () => {
      expect(validateSubmissionSpeed(undefined)).toBe(true)
    })

    it('debe bloquear envíos completados en tiempo sospechosamente inhumano (< 2.5s)', () => {
      const now = Date.now()

      // Enviado en 300 milisegundos (script automatizado)
      const botLoadedAt = now - 300
      expect(validateSubmissionSpeed(botLoadedAt, 2.5)).toBe(false)

      // Enviado en 1.8 segundos
      const fastScriptLoadedAt = now - 1800
      expect(validateSubmissionSpeed(fastScriptLoadedAt, 2.5)).toBe(false)
    })

    it('debe permitir envíos completados a velocidad humana (>= 2.5s)', () => {
      const now = Date.now()

      // Enviado en 3 segundos (humano veloz)
      const humanFast = now - 3000
      expect(validateSubmissionSpeed(humanFast, 2.5)).toBe(true)

      // Enviado en 15 segundos (humano normal)
      const humanNormal = now - 15000
      expect(validateSubmissionSpeed(humanNormal, 2.5)).toBe(true)
    })
  })

  describe('Lógica de Estados de Aprobación de Barberías', () => {
    function getOrgApprovalStatus(org: { is_active: boolean; settings?: any }) {
      const settings = (typeof org.settings === 'object' && org.settings !== null ? org.settings : {}) as Record<string, any>
      if (!org.is_active && settings.approval_status === 'PENDING') {
        return 'PENDING'
      }
      if (!org.is_active) {
        return 'SUSPENDED'
      }
      return 'APPROVED'
    }

    it('debe catalogar como PENDING una barbería recién registrada con is_active=false y approval_status=PENDING', () => {
      const newOrg = {
        is_active: false,
        settings: {
          approval_status: 'PENDING',
          registered_at: '2026-09-16T00:00:00Z',
        },
      }
      expect(getOrgApprovalStatus(newOrg)).toBe('PENDING')
    })

    it('debe catalogar como APPROVED una barbería aprobada con is_active=true', () => {
      const approvedOrg = {
        is_active: true,
        settings: {
          approval_status: 'APPROVED',
        },
      }
      expect(getOrgApprovalStatus(approvedOrg)).toBe('APPROVED')
    })

    it('debe catalogar como SUSPENDED una barbería suspendida con is_active=false y sin estado pendiente', () => {
      const suspendedOrg = {
        is_active: false,
        settings: {
          approval_status: 'APPROVED',
        },
      }
      expect(getOrgApprovalStatus(suspendedOrg)).toBe('SUSPENDED')
    })
  })
})
