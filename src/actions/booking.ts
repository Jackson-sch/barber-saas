'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDayUtcRange, getLocalDateString } from '@/lib/utils'

interface CreateBookingParams {
  organizationId: string
  organizationSlug?: string
  branchId?: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceId: string
  barberId: string
  startTime: string // ISO string
  notes?: string
}

export interface SlotAvailability {
  time: string // "10:20"
  available: boolean
  reason?: 'BOOKED' | 'LUNCH' | 'PAST' | 'OUTSIDE_HOURS'
}

export interface BarberAvailabilityResponse {
  isWorking: boolean
  message?: string
  slots: SlotAvailability[]
}

export async function getBarberAvailabilityAction(params: {
  organizationId: string
  barberId: string
  date: string // YYYY-MM-DD
  durationMinutes?: number
}): Promise<BarberAvailabilityResponse> {
  const { organizationId, barberId, date, durationMinutes = 35 } = params
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }


  const [y, m, d] = date.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  // 1. Obtener horario del barbero en ese día de la semana
  const { data: schedule } = await supabase
    .from('barber_schedules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('member_id', barberId)
    .eq('day_of_week', dayOfWeek)
    .maybeSingle()

  if (schedule && !schedule.is_working) {
    return {
      isWorking: false,
      message: 'El especialista seleccionado no atiende en este día de la semana.',
      slots: [],
    }
  }

  // Horario base de atención
  let startHourStr = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : '09:00'
  let endHourStr = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : '20:00'
  const lunchStartStr = schedule?.lunch_start ? String(schedule.lunch_start).slice(0, 5) : null
  const lunchEndStr = schedule?.lunch_end ? String(schedule.lunch_end).slice(0, 5) : null

  // Si no hay horario particular para el barbero, consultar el de la organización
  if (!schedule) {
    const { data: org } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .single()
    const settings = (org?.settings as Record<string, any>) || {}
    if (settings.opening_time) startHourStr = String(settings.opening_time).slice(0, 5)
    if (settings.closing_time) endHourStr = String(settings.closing_time).slice(0, 5)
  }

  // 2. Obtener citas agendadas para ese barbero en ese día
  const { startOfDay, endOfDay } = getDayUtcRange(date, '-05:00')
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('organization_id', organizationId)
    .eq('barber_id', barberId)
    .neq('status', 'CANCELLED')
    .neq('status', 'NO_SHOW')
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)

  // 3. Generar slots cada 40 min
  const [startH, startM] = startHourStr.split(':').map(Number)
  const [endH, endM] = endHourStr.split(':').map(Number)
  const startTotalMinutes = (isNaN(startH) ? 9 : startH) * 60 + (isNaN(startM) ? 0 : startM)
  const endTotalMinutes = (isNaN(endH) ? 20 : endH) * 60 + (isNaN(endM) ? 0 : endM)

  const nowLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  const isToday = date === getLocalDateString(new Date(), 'America/Lima')
  const currentTotalMinutes = nowLima.getHours() * 60 + nowLima.getMinutes()

  const slots: SlotAvailability[] = []
  const stepMinutes = 40

  for (let min = startTotalMinutes; min + 25 <= endTotalMinutes; min += stepMinutes) {
    const slotH = String(Math.floor(min / 60)).padStart(2, '0')
    const slotM = String(min % 60).padStart(2, '0')
    const timeStr = `${slotH}:${slotM}`

    const slotStartMs = new Date(`${date}T${timeStr}:00-05:00`).getTime()
    const slotEndMs = slotStartMs + durationMinutes * 60 * 1000

    let available = true
    let reason: SlotAvailability['reason'] = undefined

    // Regla 1: Si es hoy y la hora ya pasó (con margen de 10 min)
    if (isToday && min <= currentTotalMinutes + 10) {
      available = false
      reason = 'PAST'
    }

    // Regla 2: Horario de almuerzo / break
    if (available && lunchStartStr && lunchEndStr) {
      const lunchStartMs = new Date(`${date}T${lunchStartStr}:00-05:00`).getTime()
      const lunchEndMs = new Date(`${date}T${lunchEndStr}:00-05:00`).getTime()
      if (slotStartMs < lunchEndMs && slotEndMs > lunchStartMs) {
        available = false
        reason = 'LUNCH'
      }
    }

    // Regla 3: Colisión con otra cita existente
    if (available && existingAppointments && existingAppointments.length > 0) {
      for (const app of existingAppointments) {
        const appStartMs = new Date(app.start_time).getTime()
        const appEndMs = new Date(app.end_time).getTime()
        if (slotStartMs < appEndMs && slotEndMs > appStartMs) {
          available = false
          reason = 'BOOKED'
          break
        }
      }
    }

    slots.push({ time: timeStr, available, reason })
  }

  return {
    isWorking: true,
    slots,
  }
}

export async function createPublicBookingAction(params: CreateBookingParams) {
  const {
    organizationId,
    organizationSlug,
    branchId,
    clientName,
    clientPhone,
    clientEmail,
    serviceId,
    barberId,
    startTime,
    notes,
  } = params

  if (!organizationId || !clientName || !clientPhone || !serviceId || !barberId || !startTime) {
    return { error: 'Por favor completa todos los datos requeridos para la reserva' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }


  // 1. Obtener datos del servicio para calcular duración y precio
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('price, duration_minutes, name')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return { error: 'Servicio no encontrado o no disponible' }
  }

  const duration = service.duration_minutes || 30
  const start = new Date(startTime)
  const end = new Date(start.getTime() + duration * 60 * 1000)

  // 2. Validación de prevención de doble reserva (Anti Double-Booking)
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('barber_id', barberId)
    .neq('status', 'CANCELLED')
    .neq('status', 'NO_SHOW')
    .lt('start_time', end.toISOString())
    .gt('end_time', start.toISOString())
    .limit(1)

  if (conflict && conflict.length > 0) {
    return {
      error: 'El horario seleccionado ya ha sido reservado para este especialista. Por favor elige otro turno.',
    }
  }

  // 3. Verificar o crear cliente
  let clientId: string | null = null
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, total_visits')
    .eq('organization_id', organizationId)
    .eq('phone', clientPhone)
    .single()

  if (existingClient) {
    clientId = existingClient.id
    // Actualizar nombre/email si han cambiado
    await supabase
      .from('clients')
      .update({
        full_name: clientName,
        email: clientEmail || null,
        total_visits: (existingClient.total_visits || 0) + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', clientId)
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        organization_id: organizationId,
        full_name: clientName,
        phone: clientPhone,
        email: clientEmail || null,
        total_visits: 1,
        last_visit_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      return { error: 'Error al registrar la información del cliente' }
    }
    clientId = newClient.id

    // Crear ficha de preferencias inicial para el cliente
    await supabase.from('client_preferences').insert({
      client_id: clientId,
      organization_id: organizationId,
      favorite_barber_id: barberId,
    })
  }

  // 4. Crear la Cita
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      organization_id: organizationId,
      branch_id: branchId || null,
      client_id: clientId,
      barber_id: barberId,
      service_id: serviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'CONFIRMED',
      source: 'ONLINE',
      total_price: Number(service.price),
      notes: notes || null,
    })
    .select('id')
    .single()

  if (appointmentError || !appointment) {
    return { error: 'Error al agendar la cita. Inténtalo nuevamente.' }
  }

  // 5. Revalidar el panel administrativo en tiempo real
  let targetSlug = organizationSlug
  if (!targetSlug) {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single()
    targetSlug = orgData?.slug
  }

  if (targetSlug) {
    revalidatePath(`/app/${targetSlug}/agenda`)
    revalidatePath(`/app/${targetSlug}/dashboard`)
    revalidatePath(`/app/${targetSlug}/pos`)
  }

  return {
    success: true,
    appointmentId: appointment.id,
    serviceName: service.name,
    startTime: start.toISOString(),
  }
}
