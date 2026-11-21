import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: string = "PEN"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']
  const month = months[d.getMonth()]
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month}, ${hours}:${minutes}`
}

export function formatDateOnly(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function getLocalDateString(date: Date = new Date(), timeZone: string = 'America/Lima'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getDayUtcRange(dateStr: string, timezoneOffset: string = '-05:00') {
  const offset = timezoneOffset.startsWith('+') || timezoneOffset.startsWith('-') ? timezoneOffset : '-05:00'
  const startOfDay = new Date(`${dateStr}T00:00:00.000${offset}`).toISOString()
  const endOfDay = new Date(`${dateStr}T23:59:59.999${offset}`).toISOString()
  return { startOfDay, endOfDay }
}

/**
 * Formatea una hora de forma 100% determinista entre SSR (Node.js) y el navegador,
 * evitando diferencias de espacios NBSP/ICU en `toLocaleTimeString('es-PE')`.
 */
export function formatTimeOnly(
  dateInput: string | Date | null | undefined,
  timeZone: string = 'America/Lima'
): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value ?? '').toUpperCase()
  const periodLabel = dayPeriod === 'AM' ? 'a. m.' : dayPeriod === 'PM' ? 'p. m.' : dayPeriod

  return `${hour}:${minute} ${periodLabel}`.trim()
}

export type AppointmentPaymentStatus = 'PAID_ONLINE' | 'VOUCHER_ATTACHED' | 'UNPAID'

export interface AppointmentPaymentState {
  status: AppointmentPaymentStatus
  label: string
  isPrepaid: boolean
}

/**
 * Determina si una cita ya fue pagada por adelantado (Culqi online o voucher Yape/Plin adjunto).
 */
export function getAppointmentPaymentState(app: {
  notes?: string | null
  voucher_url?: string | null
}): AppointmentPaymentState {
  if (app.notes && app.notes.includes('[PAGADO ONLINE CULQI')) {
    return {
      status: 'PAID_ONLINE',
      label: 'Pagado Online',
      isPrepaid: true,
    }
  }
  if (app.voucher_url && app.voucher_url.trim().length > 0) {
    return {
      status: 'VOUCHER_ATTACHED',
      label: 'Voucher Adjunto',
      isPrepaid: true,
    }
  }
  return {
    status: 'UNPAID',
    label: 'Pendiente de cobro',
    isPrepaid: false,
  }
}

/**
 * Normaliza nombres y apellidos en formato Capitalizado (Title Case),
 * evitando que se muestren todo en minúsculas o todo en mayúsculas.
 */
export function formatPersonName(name: string | null | undefined): string {
  if (!name) return ''
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return ''
      return (
        word.charAt(0).toLocaleUpperCase('es-PE') +
        word.slice(1).toLocaleLowerCase('es-PE')
      )
    })
    .join(' ')
}


