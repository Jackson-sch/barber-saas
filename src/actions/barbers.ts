'use server'

import { verifyOrgAccess } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export interface BarberInput {
  id?: string
  organization_id: string
  branch_id?: string | null
  role?: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'BARBER'
  full_name: string
  nickname?: string | null
  phone?: string | null
  avatar_url?: string | null
  specialties?: string[]
  commission_rate: number
  is_active?: boolean
  slug: string
}

export interface DayScheduleInput {
  day_of_week: number
  start_time: string
  end_time: string
  lunch_start?: string | null
  lunch_end?: string | null
  is_working: boolean
}

export async function createBarberAction(input: BarberInput) {
  if (!input.full_name || !input.organization_id) {
    return { error: 'El nombre completo es obligatorio.' }
  }

  const access = await verifyOrgAccess(input.organization_id, ['OWNER', 'ADMIN'])
  if (!access.authorized) return { error: access.error || 'No autorizado' }
  const { supabase } = access

  // Validar límite de miembros activos según el plan de suscripción
  const [{ data: sub }, { count: activeCount }] = await Promise.all([
    supabase
      .from('organization_subscriptions')
      .select('plan_tier')
      .eq('organization_id', input.organization_id)
      .maybeSingle(),
    supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', input.organization_id)
      .eq('is_active', true),
  ])

  const planTier = sub?.plan_tier || 'TRIAL'
  const maxBarbersByPlan: Record<string, number> = {
    STARTER: 3,
    TRIAL: 8,
    PRO: 8,
    ENTERPRISE: 999,
  }
  const limit = maxBarbersByPlan[planTier] ?? 8
  if ((activeCount ?? 0) >= limit) {
    return {
      error: `Tu plan actual (${planTier}) permite hasta ${limit} barberos activos. Actualiza tu suscripción para agregar más especialistas.`,
    }
  }

  const { data: member, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: input.organization_id,
      branch_id: input.branch_id || null,
      role: input.role || 'BARBER',
      full_name: input.full_name.trim(),
      nickname: input.nickname?.trim() || null,
      phone: input.phone?.trim() || null,
      avatar_url: input.avatar_url || null,
      specialties: input.specialties || [],
      commission_rate: Number(input.commission_rate ?? 40),
      is_active: input.is_active ?? true,
    })
    .select('id')
    .single()

  if (error || !member) {
    console.error('Error creating barber:', error)
    return { error: 'Error al registrar al barbero.' }
  }

  // Crear horarios por defecto de Lunes a Sábado (1 al 6)
  const defaultSchedules = [1, 2, 3, 4, 5, 6].map((day) => ({
    organization_id: input.organization_id,
    member_id: member.id,
    day_of_week: day,
    start_time: '09:00:00',
    end_time: '20:00:00',
    lunch_start: '13:00:00' as string | null,
    lunch_end: '14:00:00' as string | null,
    is_working: true,
  }))

  // Domingo no laborable
  defaultSchedules.push({
    organization_id: input.organization_id,
    member_id: member.id,
    day_of_week: 0,
    start_time: '10:00:00',
    end_time: '18:00:00',
    lunch_start: null,
    lunch_end: null,
    is_working: false,
  })

  await supabase.from('barber_schedules').insert(defaultSchedules)

  revalidatePath(`/app/${input.slug}/barberos`)
  revalidatePath(`/reservar/${input.slug}`)
  return { success: true }
}

export async function updateBarberAction(input: BarberInput) {
  if (!input.id || !input.full_name || !input.organization_id) {
    return { error: 'Datos incompletos para actualizar.' }
  }

  const access = await verifyOrgAccess(input.organization_id, ['OWNER', 'ADMIN'])
  if (!access.authorized) return { error: access.error || 'No autorizado' }
  const { supabase } = access

  // Consultar el miembro objetivo y cuántos miembros activos hay en la barbería
  const [{ data: targetMember }, { count: activeCount }] = await Promise.all([
    supabase
      .from('organization_members')
      .select('id, role, is_active, user_id')
      .eq('id', input.id)
      .eq('organization_id', input.organization_id)
      .maybeSingle(),
    supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', input.organization_id)
      .eq('is_active', true),
  ])

  if (!targetMember) {
    return { error: 'Miembro del equipo no encontrado.' }
  }

  const isTargetOwner = targetMember.role === 'OWNER'
  const isSoleActiveMember = (activeCount ?? 0) <= 1 && targetMember.is_active

  // Impedir que el dueño o el único barbero activo se desactive
  if (input.is_active === false && (isTargetOwner || isSoleActiveMember)) {
    return {
      error: isTargetOwner
        ? 'El dueño de la barbería no puede desactivarse.'
        : 'No puedes desactivar al único barbero activo de la barbería.',
    }
  }

  const finalRole = isTargetOwner ? 'OWNER' : input.role || 'BARBER'
  const finalIsActive = isTargetOwner ? true : (input.is_active ?? true)

  const { error } = await supabase
    .from('organization_members')
    .update({
      role: finalRole,
      full_name: input.full_name.trim(),
      nickname: input.nickname?.trim() || null,
      phone: input.phone?.trim() || null,
      avatar_url: input.avatar_url || null,
      specialties: input.specialties || [],
      commission_rate: Number(input.commission_rate ?? 40),
      is_active: finalIsActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('organization_id', input.organization_id)

  if (error) {
    console.error('Error updating barber:', error)
    return { error: 'Error al actualizar al miembro del equipo.' }
  }

  revalidatePath(`/app/${input.slug}/barberos`)
  revalidatePath(`/reservar/${input.slug}`)
  return { success: true }
}

export async function toggleBarberStatusAction(id: string, organization_id: string, is_active: boolean, slug: string) {
  const access = await verifyOrgAccess(organization_id, ['OWNER', 'ADMIN'])
  if (!access.authorized) return { error: access.error || 'No autorizado' }
  const { supabase } = access

  if (!is_active) {
    const [{ data: targetMember }, { count: activeCount }] = await Promise.all([
      supabase
        .from('organization_members')
        .select('id, role, is_active')
        .eq('id', id)
        .eq('organization_id', organization_id)
        .maybeSingle(),
      supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organization_id)
        .eq('is_active', true),
    ])

    if (targetMember?.role === 'OWNER') {
      return { error: 'El dueño de la barbería debe permanecer siempre activo.' }
    }

    if ((activeCount ?? 0) <= 1 && targetMember?.is_active) {
      return { error: 'No puedes desactivar al único barbero activo del salón.' }
    }
  }


  const { error } = await supabase
    .from('organization_members')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', organization_id)

  if (error) {
    return { error: 'No se pudo actualizar el estado del barbero.' }
  }

  revalidatePath(`/app/${slug}/barberos`)
  revalidatePath(`/reservar/${slug}`)
  return { success: true }
}

export async function saveBarberSchedulesAction(
  organization_id: string,
  member_id: string,
  schedules: DayScheduleInput[],
  slug: string
) {
  const access = await verifyOrgAccess(organization_id, ['OWNER', 'ADMIN'])
  if (!access.authorized) return { error: access.error || 'No autorizado' }
  const { supabase } = access


  for (const s of schedules) {
    const { error } = await supabase
      .from('barber_schedules')
      .upsert(
        {
          organization_id,
          member_id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          lunch_start: s.lunch_start || null,
          lunch_end: s.lunch_end || null,
          is_working: s.is_working,
        },
        { onConflict: 'member_id, day_of_week' }
      )

    if (error) {
      console.error('Error saving schedule:', error)
      return { error: 'Error al guardar uno de los horarios.' }
    }
  }

  revalidatePath(`/app/${slug}/barberos`)
  revalidatePath(`/reservar/${slug}`)
  return { success: true }
}
