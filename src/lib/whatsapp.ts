// src/lib/whatsapp.ts

export const DEFAULT_WHATSAPP_TEMPLATES = {
  reminder:
    '👋 Hola {cliente}, te recordamos tu cita para hoy {fecha} a las {hora} con {barbero} en {barberia} para {servicio}. 📍 Dirección: {direccion}. ¡Por favor confírmanos respondiendo a este mensaje! ✂️💈',
  confirmation:
    '💈 ¡Hola {cliente}! Tu cita en {barberia} ha sido confirmada con éxito para el {fecha} a las {hora} con {barbero} ({servicio} - {precio}). 📍 Dirección: {direccion}. Si necesitas reprogramar, por favor avísanos con anticipación. ¡Te esperamos! ✂️',
  reschedule:
    '🔄 Hola {cliente}, te confirmamos que tu cita en {barberia} ha sido reprogramada para el {fecha} a las {hora} con {barbero} ({servicio}). 📍 Dirección: {direccion}. ¡Nos vemos pronto! 💈',
  followup:
    '✂️ ¡Hola {cliente}! Muchas gracias por tu visita hoy a {barberia}. Esperamos que hayas disfrutado tu {servicio} con {barbero}. ¡Nos encantará atenderte pronto de nuevo! 💈⭐️',
}

export const AVAILABLE_WHATSAPP_VARIABLES = [
  { tag: '{cliente}', label: 'Cliente', desc: 'Nombre del cliente' },
  { tag: '{barberia}', label: 'Barbería', desc: 'Nombre del salón' },
  { tag: '{servicio}', label: 'Servicio', desc: 'Nombre del servicio' },
  { tag: '{barbero}', label: 'Barbero', desc: 'Barbero especialista' },
  { tag: '{fecha}', label: 'Fecha', desc: 'Fecha de la cita' },
  { tag: '{hora}', label: 'Hora', desc: 'Hora de inicio' },
  { tag: '{precio}', label: 'Precio', desc: 'Costo del servicio' },
  { tag: '{direccion}', label: 'Dirección', desc: 'Ubicación física' },
]

export interface AppointmentDataForWhatsApp {
  clientName: string
  clientPhone: string
  barberName: string
  serviceName: string
  servicePrice: number
  startTime: string
  barberiaName: string
  barberiaAddress?: string | null
}

/**
 * Reemplaza los placeholders dinámicos de una plantilla por los datos reales de la cita
 */
export function replaceAppointmentVariables(
  template: string,
  data: AppointmentDataForWhatsApp
): string {
  const d = new Date(data.startTime)
  const isToday = new Date().toDateString() === d.toDateString()

  const fechaStr = isToday
    ? 'hoy'
    : d.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

  const horaStr = d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const priceStr = `S/ ${Number(data.servicePrice || 0).toFixed(2)}`
  const direccionStr = data.barberiaAddress || 'Nuestro local principal'

  return template
    .replace(/{cliente}/gi, data.clientName)
    .replace(/{barberia}/gi, data.barberiaName)
    .replace(/{servicio}/gi, data.serviceName)
    .replace(/{barbero}/gi, data.barberName)
    .replace(/{fecha}/gi, fechaStr)
    .replace(/{hora}/gi, horaStr)
    .replace(/{precio}/gi, priceStr)
    .replace(/{direccion}/gi, direccionStr)
}

/**
 * Formatea un número de teléfono y genera el enlace wa.me compatible con web y móvil
 */
export function formatWhatsAppUrl(phone: string, message: string): string {
  let clean = phone.replace(/\D/g, '')

  // Si tiene 9 dígitos (formato estándar de celular en Perú), anteponer código país 51
  if (clean.length === 9) {
    clean = `51${clean}`
  }

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
