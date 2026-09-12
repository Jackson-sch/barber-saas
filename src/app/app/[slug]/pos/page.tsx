import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import PosClient from '@/components/pos/PosClient'
import type { Service, ServiceCategory, OrganizationMember, CashShift, Client, Product } from '@/types/database.types'

interface PosPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ appointmentId?: string }>
}

export default async function PosPage({ params, searchParams }: PosPageProps) {
  const { slug } = await params
  const { appointmentId } = await searchParams
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener Servicios activos
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  // 2. Obtener Categorías
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .eq('organization_id', org.id)
    .order('order_index', { ascending: true })

  // 3. Obtener Barberos activos
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // 4. Obtener Clientes registrados
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('organization_id', org.id)
    .order('full_name', { ascending: true })
    .limit(100)

  // 5. Obtener Productos para reventa activos
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .eq('is_internal_use', false)
    .order('name', { ascending: true })

  // 6. Obtener Turno de Caja actual abierto
  const { data: currentShift } = await supabase
    .from('cash_shifts')
    .select('*')
    .eq('organization_id', org.id)
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  // 7. Si vino una cita pre-cargada para cobrar
  let preloadAppointment = null
  if (appointmentId) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        barber_id,
        service_id,
        client:clients(full_name, phone)
      `)
      .eq('id', appointmentId)
      .eq('organization_id', org.id)
      .single()

    if (appointment) {
      const client = appointment.client as unknown as { full_name: string; phone: string } | null
      preloadAppointment = {
        id: appointment.id,
        client_id: appointment.client_id,
        barber_id: appointment.barber_id,
        service_id: appointment.service_id,
        client_name: client?.full_name,
        client_phone: client?.phone,
      }
    }
  }

  return (
    <PosClient
      services={(services || []) as unknown as Service[]}
      categories={(categories || []) as unknown as ServiceCategory[]}
      barbers={(barbers || []) as unknown as OrganizationMember[]}
      clients={(clients || []) as unknown as Client[]}
      products={(products || []) as unknown as Product[]}
      currentShift={currentShift as unknown as CashShift | null}
      organizationId={org.id}
      organizationInfo={{
        name: org.name,
        address: org.address,
        phone: org.phone,
        city: org.city,
      }}
      slug={slug}
      preloadAppointment={preloadAppointment}
    />
  )
}
