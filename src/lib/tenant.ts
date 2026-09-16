import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { Organization, OrganizationSubscription, OrganizationMember, Profile } from '@/types/database.types'

export type TenantWithSubscription = Organization & {
  subscription: OrganizationSubscription | null
}

export async function getTenantBySlug(slug: string): Promise<TenantWithSubscription | null> {
  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !org) {
    return null
  }

  const organization = org as unknown as Organization

  const { data: subscription } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', organization.id)
    .single()

  return {
    ...organization,
    subscription: subscription ? (subscription as unknown as OrganizationSubscription) : null,
  }
}

export async function requireTenant(slug: string): Promise<TenantWithSubscription> {
  const org = await getTenantBySlug(slug)

  if (!org) {
    notFound()
  }

  return org
}

export async function getTenantAuthContext(slug: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/app/${slug}/dashboard`)
  }

  const org = await requireTenant(slug)

  // Obtener la membresía del usuario en este tenant de forma segura
  const { data: member } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Verificar si el usuario tiene privilegios globales de superadmin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileData ? (profileData as unknown as Pick<Profile, 'is_super_admin'>) : null
  const isSuperAdmin = profile?.is_super_admin ?? false

  if (!member && !isSuperAdmin) {
    redirect(`/login?error=unauthorized`)
  }

  // Si la organización no está activa y el usuario no es superadmin, denegar acceso
  if (!org.is_active && !isSuperAdmin) {
    const orgSettings = (typeof org.settings === 'object' && org.settings !== null ? org.settings : {}) as Record<string, any>
    if (orgSettings.approval_status === 'PENDING') {
      redirect(`/login?error=pending_approval`)
    }
    redirect(`/login?error=suspended`)
  }

  // Si el usuario es SuperAdmin pero no tiene membresía explícita en esta barbería,
  // se le otorga un rol efectivo de OWNER para permitirle administrarla y probarla al 100%.
  const effectiveMember: OrganizationMember = (member as unknown as OrganizationMember) || {
    id: `superadmin-${user.id}`,
    organization_id: org.id,
    user_id: user.id,
    branch_id: null,
    role: 'OWNER',
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Súper Administrador',
    nickname: 'SuperAdmin',
    phone: null,
    avatar_url: null,
    specialties: [],
    commission_rate: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    user,
    org,
    member: effectiveMember,
    isSuperAdmin,
  }
}
