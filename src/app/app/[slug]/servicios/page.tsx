import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import ServicesClient from '@/components/services/ServicesClient'
import type { Service, ServiceCategory } from '@/types/database.types'

interface ServiciosPageProps {
  params: Promise<{ slug: string }>
}

export default async function ServiciosPage({ params }: ServiciosPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener categorías
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .eq('organization_id', org.id)
    .order('order_index', { ascending: true })

  // 2. Obtener servicios
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('organization_id', org.id)
    .order('name', { ascending: true })

  return (
    <ServicesClient
      initialServices={(services || []) as unknown as Service[]}
      categories={(categories || []) as unknown as ServiceCategory[]}
      organizationId={org.id}
      slug={slug}
    />
  )
}
