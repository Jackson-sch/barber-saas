'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClientInput {
  id?: string
  organization_id: string
  full_name: string
  phone: string
  email?: string | null
  notes?: string | null
  slug: string
}

export interface ClientPreferencesInput {
  client_id: string
  organization_id: string
  hair_fade_type?: string | null
  hair_guard_number?: string | null
  hair_top_length?: string | null
  beard_style?: string | null
  allergies_notes?: string | null
  favorite_barber_id?: string | null
  slug: string
}

export async function createClientAction(input: ClientInput) {
  const supabase = await createClient()

  if (!input.full_name || !input.phone || !input.organization_id) {
    return { error: 'Nombre y teléfono son obligatorios.' }
  }

  const phoneClean = input.phone.trim().replace(/\s+/g, '')

  // Verificar si ya existe con este teléfono
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('organization_id', input.organization_id)
    .eq('phone', phoneClean)
    .single()

  if (existing) {
    return { error: 'Ya existe un cliente registrado con este número de teléfono.' }
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      organization_id: input.organization_id,
      full_name: input.full_name.trim(),
      phone: phoneClean,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      total_visits: 0,
      total_spent: 0,
    })
    .select('id')
    .single()

  if (error || !client) {
    console.error('Error creating client:', error)
    return { error: 'Error al registrar al cliente.' }
  }

  // Inicializar ficha técnica
  await supabase.from('client_preferences').insert({
    organization_id: input.organization_id,
    client_id: client.id,
  })

  revalidatePath(`/app/${input.slug}/clientes`)
  return { success: true, clientId: client.id }
}

export async function updateClientAction(input: ClientInput) {
  const supabase = await createClient()

  if (!input.id || !input.full_name || !input.phone) {
    return { error: 'Datos incompletos para actualizar el cliente.' }
  }

  const phoneClean = input.phone.trim().replace(/\s+/g, '')

  const { error } = await supabase
    .from('clients')
    .update({
      full_name: input.full_name.trim(),
      phone: phoneClean,
      email: input.email?.trim() || null,
      notes: input.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('organization_id', input.organization_id)

  if (error) {
    console.error('Error updating client:', error)
    return { error: 'Error al actualizar datos del cliente.' }
  }

  revalidatePath(`/app/${input.slug}/clientes`)
  return { success: true }
}

export async function saveClientPreferencesAction(input: ClientPreferencesInput) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('client_preferences')
    .upsert(
      {
        organization_id: input.organization_id,
        client_id: input.client_id,
        hair_fade_type: input.hair_fade_type || null,
        hair_guard_number: input.hair_guard_number || null,
        hair_top_length: input.hair_top_length || null,
        beard_style: input.beard_style || null,
        allergies_notes: input.allergies_notes || null,
        favorite_barber_id: input.favorite_barber_id || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id' }
    )

  if (error) {
    console.error('Error saving preferences:', error)
    return { error: 'Error al guardar la ficha técnica.' }
  }

  revalidatePath(`/app/${input.slug}/clientes`)
  return { success: true }
}

export async function deleteClientAction(id: string, organization_id: string, slug: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: 'No se pudo eliminar el cliente (puede tener citas o ventas registradas).' }
  }

  revalidatePath(`/app/${slug}/clientes`)
  return { success: true }
}
