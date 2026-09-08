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

  // Obtener la membresía del usuario en este tenant
  const { data: member } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  // Si no es miembro y tampoco es superadmin, denegar acceso
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  const profile = profileData ? (profileData as unknown as Pick<Profile, 'is_super_admin'>) : null
  const isSuperAdmin = profile?.is_super_admin ?? false

  if (!member && !isSuperAdmin) {
    redirect(`/login?error=unauthorized`)
  }

  // Si la organización está suspendida y el usuario no es superadmin, denegar acceso
  if (!org.is_active && !isSuperAdmin) {
    redirect(`/login?error=suspended`)
  }

  return {
    user,
    org,
    member: member ? (member as unknown as OrganizationMember) : null,
    isSuperAdmin,
  }
}
