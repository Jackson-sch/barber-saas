import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import CajaClient from '@/components/pos/CajaClient'
import type { CashShift, CashMovement, OrganizationMember } from '@/types/database.types'

interface CajaPageProps {
  params: Promise<{ slug: string }>
}

export default async function CajaPage({ params }: CajaPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener turno actualmente ABIERTO
  const { data: openShift } = await supabase
    .from('cash_shifts')
    .select('*')
    .eq('organization_id', org.id)
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  // 1.1 Obtener barberos activos para asignación de adelantos
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)

  // 1.2 Movimientos de caja (gastos/ingresos) del turno actual
  let currentShiftMovements: CashMovement[] = []
  if (openShift) {
    const { data: movements } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('shift_id', openShift.id)
      .order('created_at', { ascending: false })
    currentShiftMovements = (movements || []) as CashMovement[]
  }

  // 2. Si hay turno abierto, obtener las ventas registradas con sus ítems
  let currentShiftSales: any[] = []
  if (openShift) {
    const { data: sales } = await supabase
      .from('sales')
      .select(`
        *,
        client:clients(full_name, phone)
      `)
      .eq('organization_id', org.id)
      .eq('shift_id', openShift.id)
      .order('created_at', { ascending: false })

    const salesList = sales || []
    if (salesList.length > 0) {
      const saleIds = salesList.map((s) => s.id)
      const { data: items } = await supabase
        .from('sale_items')
        .select(`
          id,
          sale_id,
          item_type,
          service_id,
          product_id,
          barber_id,
          quantity,
          unit_price,
          subtotal
        `)
        .in('sale_id', saleIds)

      // Lookups directos para nombres de servicios, productos y barberos
      const { data: services } = await supabase
        .from('services')
        .select('id, name')
        .eq('organization_id', org.id)
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .eq('organization_id', org.id)
      const { data: members } = await supabase
        .from('organization_members')
        .select('id, full_name, nickname')
        .eq('organization_id', org.id)

      const serviceMap = new Map((services || []).map((s) => [s.id, s.name]))
      const productMap = new Map((products || []).map((p) => [p.id, p.name]))
      const barberMap = new Map(
        (members || []).map((m) => [m.id, m.nickname || m.full_name])
      )

      const itemsBySale: Record<string, any[]> = {}
      for (const it of items || []) {
        const itName =
          it.item_type === 'SERVICE'
            ? (it.service_id && serviceMap.get(it.service_id)) || 'Servicio'
            : (it.product_id && productMap.get(it.product_id)) || 'Producto'

        const barberName = it.barber_id ? barberMap.get(it.barber_id) || null : null

        if (!itemsBySale[it.sale_id]) itemsBySale[it.sale_id] = []
        itemsBySale[it.sale_id].push({
          name: itName,
          quantity: it.quantity,
          unit_price: Number(it.unit_price),
          subtotal: Number(it.subtotal),
          barberName,
        })
      }

      currentShiftSales = salesList.map((s) => ({
        ...s,
        items: itemsBySale[s.id] || [],
      }))
    }
  }

  // 3. Obtener últimos turnos CERRADOS para el historial
  const { data: pastShifts } = await supabase
    .from('cash_shifts')
    .select('*')
    .eq('organization_id', org.id)
    .eq('status', 'CLOSED')
    .order('closed_at', { ascending: false })
    .limit(10)

  return (
    <CajaClient
      currentShift={openShift as unknown as CashShift | null}
      currentShiftSales={currentShiftSales}
      currentShiftMovements={currentShiftMovements}
      barbers={(barbers || []) as OrganizationMember[]}
      pastShifts={(pastShifts || []) as unknown as CashShift[]}
      organizationId={org.id}
      organizationInfo={{
        name: org.name,
        address: org.address,
        phone: org.phone,
        city: org.city,
        logoUrl: org.logo_url,
      }}
      slug={slug}
    />
  )
}
