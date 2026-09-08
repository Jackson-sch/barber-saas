import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import CajaClient from '@/components/pos/CajaClient'
import type { CashShift } from '@/types/database.types'

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

  // 2. Si hay turno abierto, obtener las ventas registradas en él
  let currentShiftSales: any[] = []
  if (openShift) {
    const { data: sales } = await supabase
      .from('sales')
      .select(`
        *,
        client:clients(full_name)
      `)
      .eq('organization_id', org.id)
      .eq('shift_id', openShift.id)
      .order('created_at', { ascending: false })

    currentShiftSales = sales || []
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
      pastShifts={(pastShifts || []) as unknown as CashShift[]}
      organizationId={org.id}
      slug={slug}
    />
  )
}
