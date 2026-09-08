import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import BarbersClient from '@/components/barbers/BarbersClient'
import type { OrganizationMember, BarberSchedule } from '@/types/database.types'

interface BarberosPageProps {
  params: Promise<{ slug: string }>
}

export default async function BarberosPage({ params }: BarberosPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener miembros
  const { data: members } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .order('created_at', { ascending: true })

  // 2. Obtener horarios de todos los miembros del tenant
  const { data: schedules } = await supabase
    .from('barber_schedules')
    .select('*')
    .eq('organization_id', org.id)

  return (
    <BarbersClient
      initialMembers={(members || []) as unknown as OrganizationMember[]}
      schedules={(schedules || []) as unknown as BarberSchedule[]}
      organizationId={org.id}
      slug={slug}
    />
  )
}
