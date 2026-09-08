import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import ClientsClient, { type ClientWithPreferences } from '@/components/clients/ClientsClient'
import type { OrganizationMember } from '@/types/database.types'

interface ClientesPageProps {
  params: Promise<{ slug: string }>
}

export default async function ClientesPage({ params }: ClientesPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener Clientes con sus preferencias (ficha técnica)
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      preferences:client_preferences(*)
    `)
    .eq('organization_id', org.id)
    .order('full_name', { ascending: true })

  // 2. Obtener Barberos activos para el selector de barbero preferido
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // Aplanar la preferencia (si viene como array o single)
  const formattedClients = (clients || []).map((c: any) => ({
    ...c,
    preferences: Array.isArray(c.preferences) ? c.preferences[0] || null : c.preferences || null,
  }))

  return (
    <ClientsClient
      initialClients={formattedClients as unknown as ClientWithPreferences[]}
      barbers={(barbers || []) as unknown as OrganizationMember[]}
      organizationId={org.id}
      slug={slug}
    />
  )
}
