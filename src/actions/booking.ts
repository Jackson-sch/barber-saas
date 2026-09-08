'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CreateBookingParams {
  organizationId: string
  branchId?: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceId: string
  barberId: string
  startTime: string // ISO string
  notes?: string
}

export async function createPublicBookingAction(params: CreateBookingParams) {
  const {
    organizationId,
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

  // 2. Verificar o crear cliente
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

  // 3. Crear la Cita
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

  return {
    success: true,
    appointmentId: appointment.id,
    serviceName: service.name,
    startTime: start.toISOString(),
  }
}
