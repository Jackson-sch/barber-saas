'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDayUtcRange, getLocalDateString } from '@/lib/utils'
import { getOrganizationSecretsServer } from '@/lib/organization-secrets'

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
  voucherUrl?: string | null
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


  const [y, m, d] = date.split('-').map(Number)
  const dayOfWeek = new Date(y, m - 1, d).getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  // 1. Obtener horario del barbero y configuración de la organización en paralelo
  const [{ data: schedule }, { data: org }] = await Promise.all([
    supabase
      .from('barber_schedules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('member_id', barberId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle(),
    supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .maybeSingle(),
  ])

  if (schedule && !schedule.is_working) {
    return {
      isWorking: false,
      message: 'El especialista seleccionado no atiende en este día de la semana.',
      slots: [],
    }
  }

  const settings = (org?.settings as Record<string, any>) || {}
  const configuredInterval = Number(settings.slot_interval)
  const stepMinutes =
    !isNaN(configuredInterval) && configuredInterval >= 15 && configuredInterval <= 120
      ? configuredInterval
      : 40

  // Horario base de atención
  let startHourStr = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : '09:00'
  let endHourStr = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : '20:00'
  const lunchStartStr = schedule?.lunch_start ? String(schedule.lunch_start).slice(0, 5) : null
  const lunchEndStr = schedule?.lunch_end ? String(schedule.lunch_end).slice(0, 5) : null

  // Si no hay horario particular para el barbero, usar el de la organización
  if (!schedule) {
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

  // 3. Generar slots según el intervalo configurado
  const [startH, startM] = startHourStr.split(':').map(Number)
  const [endH, endM] = endHourStr.split(':').map(Number)
  const startTotalMinutes = (isNaN(startH) ? 9 : startH) * 60 + (isNaN(startM) ? 0 : startM)
  const endTotalMinutes = (isNaN(endH) ? 20 : endH) * 60 + (isNaN(endM) ? 0 : endM)

  const nowLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  const isToday = date === getLocalDateString(new Date(), 'America/Lima')
  const currentTotalMinutes = nowLima.getHours() * 60 + nowLima.getMinutes()

  const slots: SlotAvailability[] = []

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


  // 1. Obtener datos del servicio para calcular duración y precio (validando que pertenezca al tenant)
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('price, duration_minutes, name')
    .eq('id', serviceId)
    .eq('organization_id', organizationId)
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

  // 3. Verificar o crear cliente (normalizando teléfono y sin incrementar total_visits hasta que se complete/cobre el servicio)
  const phoneClean = clientPhone.trim().replace(/\s+/g, '')
  let clientId: string | null = null
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('phone', phoneClean)
    .maybeSingle()

  if (existingClient) {
    clientId = existingClient.id
    // Actualizar nombre/email si han cambiado
    await supabase
      .from('clients')
      .update({
        full_name: clientName.trim(),
        email: clientEmail?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
      .eq('organization_id', organizationId)
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        organization_id: organizationId,
        full_name: clientName.trim(),
        phone: phoneClean,
        email: clientEmail?.trim() || null,
        total_visits: 0,
        total_spent: 0,
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
      voucher_url: params.voucherUrl || null,
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
    voucherUrl: params.voucherUrl || null,
  }
}

export interface CulqiBookingChargeParams {
  organizationId: string
  tokenId: string
  email: string
  clientName: string
  clientPhone: string
  serviceId: string
  barberId: string
  startTime: string
  notes?: string
}

/**
 * Procesa un pago con tarjeta o Yape vía Culqi y confirma la cita online.
 */
export async function createCulqiBookingChargeAction(params: CulqiBookingChargeParams) {
  const supabase = await createClient()

  // 1. Obtener la barbería y su llave secreta de Culqi
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, slug, settings')
    .eq('id', params.organizationId)
    .single()

  if (orgErr || !org) {
    return { error: 'Barbería no encontrada.' }
  }

  const orgSettings = (org.settings as Record<string, any>) || {}
  const culqi = orgSettings.culqi_settings
  const secrets = await getOrganizationSecretsServer(params.organizationId)
  const culqiSecretKey = (secrets.culqi_secret_key || culqi?.secret_key || '').trim()

  if (!culqi?.enabled || !culqiSecretKey) {
    return { error: 'Esta barbería no tiene habilitada la pasarela Culqi.' }
  }

  // 2. Obtener datos del servicio para calcular el monto exacto y duración (validando que pertenezca al tenant)
  const { data: service, error: srvErr } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('id', params.serviceId)
    .eq('organization_id', params.organizationId)
    .single()

  if (srvErr || !service) {
    return { error: 'Servicio no encontrado.' }
  }

  // 2.5 Validar disponibilidad del horario ANTES de cobrar la tarjeta en Culqi
  const duration = service.duration_minutes || 30
  const start = new Date(params.startTime)
  const end = new Date(start.getTime() + duration * 60 * 1000)

  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('organization_id', params.organizationId)
    .eq('barber_id', params.barberId)
    .neq('status', 'CANCELLED')
    .neq('status', 'NO_SHOW')
    .lt('start_time', end.toISOString())
    .gt('end_time', start.toISOString())
    .limit(1)

  if (conflict && conflict.length > 0) {
    return {
      error:
        'El horario seleccionado acaba de ser reservado por otro cliente. No se ha realizado ningún cargo a tu tarjeta; por favor selecciona otro horario.',
    }
  }

  const amountCents = Math.round(Number(service.price) * 100)
  const clientEmail = params.email?.trim() || `${params.clientPhone.replace(/\D/g, '')}@barberos.app`

  // 3. Llamar a la API de Culqi para procesar el cargo
  try {
    const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${culqiSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCents,
        currency_code: 'PEN',
        email: clientEmail,
        source_id: params.tokenId,
        description: `Cita: ${service.name} - ${org.name}`,
        antifraud_details: {
          first_name: params.clientName.split(' ')[0] || 'Cliente',
          last_name: params.clientName.split(' ').slice(1).join(' ') || 'General',
          phone_number: params.clientPhone.replace(/\D/g, ''),
        },
      }),
    })

    const chargeData = await culqiRes.json()

    if (!culqiRes.ok) {
      console.error('Culqi charge failed:', chargeData)
      return {
        error:
          chargeData.user_message ||
          chargeData.message ||
          'El pago fue rechazado por la pasarela o banco emisor. Por favor intenta nuevamente.',
      }
    }

    // 4. Crear la cita con nota de pago online verificado
    const bookingRes = await createPublicBookingAction({
      organizationId: params.organizationId,
      organizationSlug: org.slug,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      clientEmail: clientEmail,
      serviceId: params.serviceId,
      barberId: params.barberId,
      startTime: params.startTime,
      notes: `${params.notes || ''} [PAGADO ONLINE CULQI: Cargo ID ${chargeData.id}]`.trim(),
    })

    if (bookingRes.error) {
      return { error: bookingRes.error }
    }

    return {
      success: true,
      chargeId: chargeData.id,
      appointmentId: bookingRes.appointmentId,
      serviceName: bookingRes.serviceName,
      startTime: bookingRes.startTime,
      isPaidOnline: true,
    }
  } catch (err: any) {
    console.error('Error creating Culqi charge:', err)
    return {
      error: 'Error de comunicación con la pasarela Culqi. Intenta nuevamente.',
    }
  }
}

