'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateAppointmentInput {
  organization_id: string
  client_name: string
  client_phone: string
  client_email?: string | null
  barber_id: string
  service_id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  notes?: string | null
  source?: 'ONLINE' | 'WALK_IN' | 'PHONE' | 'WHATSAPP'
  slug: string
}

export async function createAppointmentAction(input: CreateAppointmentInput) {
  const supabase = await createClient()

  if (!input.client_name || !input.client_phone || !input.barber_id || !input.service_id || !input.date || !input.time) {
    return { error: 'Por favor completa todos los campos obligatorios.' }
  }

  // 1. Obtener precio y duración del servicio
  const { data: service, error: svcError } = await supabase
    .from('services')
    .select('price, duration_minutes')
    .eq('id', input.service_id)
    .single()

  if (svcError || !service) {
    return { error: 'El servicio seleccionado no existe o no está disponible.' }
  }

  // 2. Buscar o crear cliente
  const phoneClean = input.client_phone.trim().replace(/\s+/g, '')
  let clientId: string

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, total_visits')
    .eq('organization_id', input.organization_id)
    .eq('phone', phoneClean)
    .single()

  if (existingClient) {
    clientId = existingClient.id
    // Actualizar nombre y email si se provee
    await supabase
      .from('clients')
      .update({
        full_name: input.client_name.trim(),
        email: input.client_email?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)
  } else {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({
        organization_id: input.organization_id,
        full_name: input.client_name.trim(),
        phone: phoneClean,
        email: input.client_email?.trim() || null,
        total_visits: 0,
        total_spent: 0,
      })
      .select('id')
      .single()

    if (clientErr || !newClient) {
      console.error('Error creating client for appointment:', clientErr)
      return { error: 'No se pudo registrar la ficha del cliente.' }
    }
    clientId = newClient.id

    // Crear ficha técnica inicial vacía
    await supabase.from('client_preferences').insert({
      organization_id: input.organization_id,
      client_id: clientId,
      favorite_barber_id: input.barber_id,
    })
  }

  // 3. Calcular start_time y end_time
  const startDateTime = new Date(`${input.date}T${input.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60 * 1000)

  // 4. Insertar cita
  const { error: appErr } = await supabase.from('appointments').insert({
    organization_id: input.organization_id,
    client_id: clientId,
    barber_id: input.barber_id,
    service_id: input.service_id,
    start_time: startDateTime.toISOString(),
    end_time: endDateTime.toISOString(),
    status: 'CONFIRMED',
    source: input.source || 'WALK_IN',
    notes: input.notes?.trim() || null,
    total_price: Number(service.price),
  })

  if (appErr) {
    console.error('Error creating appointment:', appErr)
    return { error: 'Error al programar la cita.' }
  }

  revalidatePath(`/app/${input.slug}/agenda`)
  revalidatePath(`/app/${input.slug}/dashboard`)
  return { success: true }
}

export async function updateAppointmentStatusAction(
  id: string,
  organization_id: string,
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
  slug: string
) {
  const supabase = await createClient()

  // Si pasa a COMPLETED, actualizar estadísticas del cliente
  if (status === 'COMPLETED') {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('client_id, total_price')
      .eq('id', id)
      .single()

    if (appointment?.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('total_visits, total_spent')
        .eq('id', appointment.client_id)
        .single()

      if (client) {
        await supabase
          .from('clients')
          .update({
            total_visits: (client.total_visits || 0) + 1,
            total_spent: Number(client.total_spent || 0) + Number(appointment.total_price || 0),
            last_visit_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointment.client_id)
      }
    }
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    console.error('Error updating appointment status:', error)
    return { error: 'No se pudo actualizar el estado de la cita.' }
  }

  revalidatePath(`/app/${slug}/agenda`)
  revalidatePath(`/app/${slug}/dashboard`)
  return { success: true }
}

export async function rescheduleAppointmentAction(
  id: string,
  organization_id: string,
  date: string,
  time: string,
  barber_id: string,
  slug: string
) {
  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('service_id, services(duration_minutes)')
    .eq('id', id)
    .single()

  if (!appointment) {
    return { error: 'Cita no encontrada.' }
  }

  const duration = (appointment.services as unknown as { duration_minutes: number })?.duration_minutes || 30
  const startDateTime = new Date(`${date}T${time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000)

  const { error } = await supabase
    .from('appointments')
    .update({
      barber_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    return { error: 'Error al reprogramar la cita.' }
  }

  revalidatePath(`/app/${slug}/agenda`)
  revalidatePath(`/app/${slug}/dashboard`)
  return { success: true }
}
