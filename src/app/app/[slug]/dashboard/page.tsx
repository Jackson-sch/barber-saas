import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import DashboardClient, {
  type DashboardAppointment,
  type DashboardSaleSummary,
} from '@/components/dashboard/DashboardClient'
import type { OrganizationMember, CashShift, Product } from '@/types/database.types'

interface DashboardProps {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: DashboardProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // Rango del día de hoy (local / medianoche a medianoche)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowIso = tomorrow.toISOString()

  // 1. Citas de hoy con cliente, barbero y servicio
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(full_name, phone),
      barber:organization_members(id, full_name, nickname, avatar_url),
      service:services(name, price, duration_minutes)
    `)
    .eq('organization_id', org.id)
    .gte('start_time', todayIso)
    .lt('start_time', tomorrowIso)
    .order('start_time', { ascending: true })

  // 2. Ventas de hoy
  const { data: todaySales } = await supabase
    .from('sales')
    .select('id, total, payment_method')
    .eq('organization_id', org.id)
    .gte('created_at', todayIso)

  const sales = (todaySales as Array<{ id: string; total: number; payment_method: string }>) || []
  const salesTotal = sales.reduce((acc, curr) => acc + Number(curr.total || 0), 0)
  const cashTotal = sales
    .filter((s) => s.payment_method === 'CASH')
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0)
  const digitalTotal = sales
    .filter(
      (s) =>
        s.payment_method === 'YAPE' ||
        s.payment_method === 'PLIN' ||
        s.payment_method === 'TRANSFER'
    )
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0)
  const cardTotal = sales
    .filter((s) => s.payment_method === 'CARD')
    .reduce((acc, curr) => acc + Number(curr.total || 0), 0)

  const salesSummary: DashboardSaleSummary = {
    total: salesTotal,
    count: sales.length,
    cashTotal,
    digitalTotal,
    cardTotal,
  }

  // 3. Cantidad de clientes registrados en el CRM
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)

  // 4. Barberos activos del salón
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // 5. Turno de caja actual abierto
  const { data: currentShift } = await supabase
    .from('cash_shifts')
    .select('*')
    .eq('organization_id', org.id)
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 6. Productos con stock crítico
  const { data: criticalProducts } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .filter('stock', 'lte', 'min_stock')
    .order('stock', { ascending: true })
    .limit(5)

  return (
    <DashboardClient
      org={org}
      slug={slug}
      appointments={(todayAppointments || []) as unknown as DashboardAppointment[]}
      salesSummary={salesSummary}
      clientsCount={clientsCount ?? 0}
      barbers={(barbers || []) as OrganizationMember[]}
      currentShift={currentShift as CashShift | null}
      criticalProducts={(criticalProducts || []) as Product[]}
    />
  )
}
