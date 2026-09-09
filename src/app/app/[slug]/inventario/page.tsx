import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import InventoryClient from '@/components/inventory/InventoryClient'
import type { Product } from '@/types/database.types'

interface InventarioPageProps {
  params: Promise<{ slug: string }>
}

export default async function InventarioPage({ params }: InventarioPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <InventoryClient
      initialProducts={(products || []) as unknown as Product[]}
      organizationId={org.id}
      slug={slug}
    />
  )
}
