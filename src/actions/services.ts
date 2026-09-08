'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ServiceInput {
  id?: string
  organization_id: string
  category_id?: string | null
  name: string
  description?: string | null
  price: number
  duration_minutes: number
  commission_percent?: number
  is_active?: boolean
  slug: string
}

export async function createServiceAction(input: ServiceInput) {
  const supabase = await createClient()

  if (!input.name || !input.price || !input.organization_id) {
    return { error: 'Nombre y precio son obligatorios.' }
  }

  const { error } = await supabase.from('services').insert({
    organization_id: input.organization_id,
    category_id: input.category_id || null,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price: Number(input.price),
    duration_minutes: Number(input.duration_minutes) || 30,
    commission_percent: Number(input.commission_percent ?? 40),
    is_active: input.is_active ?? true,
  })

  if (error) {
    console.error('Error creating service:', error)
    return { error: 'Error al registrar el servicio.' }
  }

  revalidatePath(`/app/${input.slug}/servicios`)
  revalidatePath(`/reservar/${input.slug}`)
  return { success: true }
}

export async function updateServiceAction(input: ServiceInput) {
  const supabase = await createClient()

  if (!input.id || !input.name || !input.price || !input.organization_id) {
    return { error: 'Datos incompletos para actualizar.' }
  }

  const { error } = await supabase
    .from('services')
    .update({
      category_id: input.category_id || null,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: Number(input.price),
      duration_minutes: Number(input.duration_minutes) || 30,
      commission_percent: Number(input.commission_percent ?? 40),
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('organization_id', input.organization_id)

  if (error) {
    console.error('Error updating service:', error)
    return { error: 'Error al actualizar el servicio.' }
  }

  revalidatePath(`/app/${input.slug}/servicios`)
  revalidatePath(`/reservar/${input.slug}`)
  return { success: true }
}

export async function toggleServiceStatusAction(id: string, organization_id: string, is_active: boolean, slug: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    return { error: 'No se pudo actualizar el estado.' }
  }

  revalidatePath(`/app/${slug}/servicios`)
  revalidatePath(`/reservar/${slug}`)
  return { success: true }
}

export async function deleteServiceAction(id: string, organization_id: string, slug: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: 'No se pudo eliminar el servicio (posiblemente esté vinculado a citas o ventas).' }
  }

  revalidatePath(`/app/${slug}/servicios`)
  revalidatePath(`/reservar/${slug}`)
  return { success: true }
}

export async function createCategoryAction(organization_id: string, name: string, slug: string) {
  const supabase = await createClient()

  if (!name.trim()) {
    return { error: 'El nombre de la categoría es obligatorio.' }
  }

  const { error } = await supabase.from('service_categories').insert({
    organization_id,
    name: name.trim(),
  })

  if (error) {
    console.error('Error creating category:', error)
    return { error: 'Error al crear la categoría.' }
  }

  revalidatePath(`/app/${slug}/servicios`)
  return { success: true }
}

export async function deleteCategoryAction(id: string, organization_id: string, slug: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    return { error: 'No se pudo eliminar la categoría.' }
  }

  revalidatePath(`/app/${slug}/servicios`)
  return { success: true }
}
