// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPrice,
  formatMinutes,
  slugify,
  formatDateTime,
  formatDateOnly,
  getLocalDateString,
  getDayUtcRange,
} from '@/lib/utils'

describe('Utilidades del Sistema - src/lib/utils.ts', () => {
  describe('cn (Tailwind Merge + Clsx)', () => {
    it('debe fusionar clases condicionales correctamente', () => {
      const isVisible = true
      const isDisabled = false
      const result = cn('base-class', isVisible && 'is-visible', isDisabled && 'is-disabled')
      expect(result).toBe('base-class is-visible')
    })

    it('debe resolver conflictos de Tailwind priorizando la última clase', () => {
      const result = cn('p-4 text-red-500', 'p-6 text-blue-500')
      expect(result).toBe('p-6 text-blue-500')
    })
  })

  describe('formatPrice', () => {
    it('debe formatear montos en Soles Peruanos (PEN) por defecto', () => {
      const formatted = formatPrice(45.5)
      // En es-PE típicamente produce "S/\xa045.50" o "PEN\xa045.50"
      expect(formatted).toMatch(/45\.50/)
      expect(formatted).toMatch(/S\/|PEN/)
    })

    it('debe formatear ceros correctamente', () => {
      const formatted = formatPrice(0)
      expect(formatted).toMatch(/0\.00/)
    })

    it('debe formatear montos grandes con separadores de miles', () => {
      const formatted = formatPrice(1500)
      expect(formatted).toMatch(/1.*500\.00/)
    })

    it('debe soportar monedas alternativas como USD', () => {
      const formatted = formatPrice(25, 'USD')
      expect(formatted).toMatch(/25\.00/)
      expect(formatted).toMatch(/\$|USD/)
    })
  })

  describe('formatMinutes', () => {
    it('debe mostrar solo minutos si es menor a 60', () => {
      expect(formatMinutes(35)).toBe('35 min')
      expect(formatMinutes(0)).toBe('0 min')
      expect(formatMinutes(59)).toBe('59 min')
    })

    it('debe mostrar horas exactas si no hay minutos restantes', () => {
      expect(formatMinutes(60)).toBe('1h')
      expect(formatMinutes(120)).toBe('2h')
    })

    it('debe mostrar horas y minutos cuando corresponde', () => {
      expect(formatMinutes(75)).toBe('1h 15m')
      expect(formatMinutes(90)).toBe('1h 30m')
      expect(formatMinutes(145)).toBe('2h 25m')
    })
  })

  describe('slugify', () => {
    it('debe convertir texto a minúsculas y reemplazar espacios por guiones', () => {
      expect(slugify('Barberia Elegante')).toBe('barberia-elegante')
    })

    it('debe remover tildes y diacríticos', () => {
      expect(slugify('Corte Clásico & Barba Súper')).toBe('corte-clasico-barba-super')
      expect(slugify('Niño & Papá')).toBe('nino-papa')
    })

    it('debe eliminar caracteres especiales y colapsar guiones múltiples', () => {
      expect(slugify('¡¡Oferta 2026!! -- Corte VIP')).toBe('oferta-2026-corte-vip')
      expect(slugify('   Espacios   múltiples   ')).toBe('espacios-multiples')
    })
  })

  describe('formatDateTime & formatDateOnly', () => {
    it('debe retornar cadena vacía para valores nulos o inválidos', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
      expect(formatDateTime('fecha-invalida')).toBe('')
      expect(formatDateOnly(null)).toBe('')
      expect(formatDateOnly('invalido')).toBe('')
    })

    it('debe formatear fecha y hora correctamente en es-PE', () => {
      // 2026-05-18T15:30:00Z
      const date = new Date(2026, 4, 18, 15, 30) // Mayo es mes 4 indexado en 0
      const formatted = formatDateTime(date)
      expect(formatted).toBe('18 may, 15:30')
    })

    it('debe formatear solo fecha con año', () => {
      const date = new Date(2026, 8, 15) // Septiembre es mes 8
      const formatted = formatDateOnly(date)
      expect(formatted).toBe('15 set 2026')
    })
  })

  describe('getDayUtcRange', () => {
    it('debe generar rangos ISO UTC considerando el offset horario (-05:00 Perú)', () => {
      const { startOfDay, endOfDay } = getDayUtcRange('2026-09-15', '-05:00')
      // 2026-09-15 00:00:00-05:00 equivale a 2026-09-15T05:00:00.000Z
      expect(startOfDay).toBe('2026-09-15T05:00:00.000Z')
      // 2026-09-15 23:59:59.999-05:00 equivale a 2026-09-16T04:59:59.999Z
      expect(endOfDay).toBe('2026-09-16T04:59:59.999Z')
    })
  })

  describe('getLocalDateString', () => {
    it('debe retornar formato YYYY-MM-DD en la zona horaria indicada', () => {
      const date = new Date('2026-09-15T12:00:00Z')
      const localStr = getLocalDateString(date, 'America/Lima')
      expect(localStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(localStr).toBe('2026-09-15')
    })
  })
})
