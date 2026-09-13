'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DailySalesStat {
  date: string
  label: string
  total: number
  count: number
}

export interface PaymentMethodStat {
  method: 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER'
  label: string
  total: number
  count: number
  percentage: number
}

export interface TopItemStat {
  id: string
  name: string
  type: 'SERVICE' | 'PRODUCT'
  quantity: number
  totalRevenue: number
}

export interface BarberCommissionStat {
  barberId: string
  barberName: string
  nickname: string | null
  avatarUrl: string | null
  commissionRate: number
  servicesCount: number
  productsCount: number
  totalSalesGenerated: number
  totalCommissionsEarned: number
  commissionsPaid: number
  commissionsPending: number
  pendingIds: string[]
}

export interface ReportsData {
  summary: {
    totalRevenue: number
    ticketCount: number
    averageTicket: number
    totalDiscounts: number
    totalTips: number
    totalCommissionsEarned: number
    totalCommissionsPaid: number
    totalCommissionsPending: number
    netShopProfit: number
  }
  paymentMethods: PaymentMethodStat[]
  dailyTrend: DailySalesStat[]
  topServices: TopItemStat[]
  topProducts: TopItemStat[]
  barberStats: BarberCommissionStat[]
}

export async function getReportsDataAction(
  organizationId: string,
  startDateStr: string,
  endDateStr: string
): Promise<{ data?: ReportsData; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Obtener miembros (barberos) de la organización
    const { data: members, error: membersErr } = await supabase
      .from('organization_members')
      .select('id, full_name, nickname, role, avatar_url, phone, commission_rate')
      .eq('organization_id', organizationId)

    if (membersErr) {
      console.error('Error fetching members:', membersErr)
      return { error: 'Error al consultar miembros del equipo.' }
    }

    // 2. Obtener catálogo de servicios y productos para lookups directos
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .eq('organization_id', organizationId)

    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('organization_id', organizationId)

    const serviceMap = new Map((services || []).map((s) => [s.id, s.name]))
    const productMap = new Map((products || []).map((p) => [p.id, p.name]))

    // 3. Obtener ventas completadas en el rango de fechas
    const { data: sales, error: salesErr } = await supabase
      .from('sales')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'COMPLETED')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: true })

    if (salesErr) {
      console.error('Error fetching sales:', salesErr)
      return { error: 'Error al consultar ventas del período.' }
    }

    const salesList = sales || []
    const saleIds = salesList.map((s) => s.id)

    // 4. Obtener sale_items de las ventas encontradas
    let saleItemsList: any[] = []
    if (saleIds.length > 0) {
      const { data: items, error: itemsErr } = await supabase
        .from('sale_items')
        .select('*')
        .in('sale_id', saleIds)

      if (itemsErr) {
        console.error('Error fetching sale_items:', itemsErr)
      } else {
        saleItemsList = items || []
      }
    }

    // 5. Obtener comisiones en el rango de fechas
    const { data: commissions, error: comErr } = await supabase
      .from('commissions')
      .select('id, barber_id, sale_id, amount, is_paid, paid_at, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)

    if (comErr) {
      console.error('Error fetching commissions:', comErr)
      return { error: 'Error al consultar comisiones del período.' }
    }

    const commList = commissions || []
    const memberList = members || []

    let totalRevenue = 0
    let totalDiscounts = 0
    let totalTips = 0

    const paymentMap: Record<string, { total: number; count: number }> = {
      CASH: { total: 0, count: 0 },
      CARD: { total: 0, count: 0 },
      YAPE: { total: 0, count: 0 },
      PLIN: { total: 0, count: 0 },
      TRANSFER: { total: 0, count: 0 },
    }

    const dailyMap: Record<string, { total: number; count: number }> = {}
    const serviceRankingMap: Record<string, { name: string; quantity: number; total: number }> = {}
    const productRankingMap: Record<string, { name: string; quantity: number; total: number }> = {}

    // Procesar cada venta
    for (const sale of salesList) {
      const saleTotal = Number(sale.total || 0)
      totalRevenue += saleTotal
      totalDiscounts += Number(sale.discount || 0)
      totalTips += Number(sale.tip || 0)

      // Métodos de pago
      const pm = (sale.payment_method || 'CASH').toUpperCase()
      if (paymentMap[pm]) {
        paymentMap[pm].total += saleTotal
        paymentMap[pm].count += 1
      }

      // Tendencia diaria
      const dayKey = sale.created_at ? sale.created_at.substring(0, 10) : 'Sin fecha'
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { total: 0, count: 0 }
      }
      dailyMap[dayKey].total += saleTotal
      dailyMap[dayKey].count += 1
    }

    // Inicializar mapa de barberos
    const barberCommMap: Record<
      string,
      {
        totalSales: number
        earned: number
        paid: number
        pending: number
        pendingIds: string[]
        servicesCount: number
        productsCount: number
      }
    > = {}

    for (const b of memberList) {
      barberCommMap[b.id] = {
        totalSales: 0,
        earned: 0,
        paid: 0,
        pending: 0,
        pendingIds: [],
        servicesCount: 0,
        productsCount: 0,
      }
    }

    // Procesar ítems de las ventas
    for (const item of saleItemsList) {
      const qty = Number(item.quantity || 1)
      const sub = Number(item.subtotal || 0)

      if (item.item_type === 'SERVICE') {
        const sName = (item.service_id && serviceMap.get(item.service_id)) || 'Servicio'
        const sId = item.service_id || sName
        if (!serviceRankingMap[sId]) {
          serviceRankingMap[sId] = { name: sName, quantity: 0, total: 0 }
        }
        serviceRankingMap[sId].quantity += qty
        serviceRankingMap[sId].total += sub
      } else if (item.item_type === 'PRODUCT') {
        const pName = (item.product_id && productMap.get(item.product_id)) || 'Producto'
        const pId = item.product_id || pName
        if (!productRankingMap[pId]) {
          productRankingMap[pId] = { name: pName, quantity: 0, total: 0 }
        }
        productRankingMap[pId].quantity += qty
        productRankingMap[pId].total += sub
      }

      // Desglose de ventas por barbero
      if (item.barber_id && barberCommMap[item.barber_id]) {
        barberCommMap[item.barber_id].totalSales += sub
        if (item.item_type === 'SERVICE') {
          barberCommMap[item.barber_id].servicesCount += qty
        } else {
          barberCommMap[item.barber_id].productsCount += qty
        }
      }
    }

    const ticketCount = salesList.length
    const averageTicket = ticketCount > 0 ? totalRevenue / ticketCount : 0

    // Comisiones acumuladas
    let totalCommissionsEarned = 0
    let totalCommissionsPaid = 0
    let totalCommissionsPending = 0

    // Sumar comisiones reales
    for (const com of commList) {
      const amt = Number(com.amount || 0)
      totalCommissionsEarned += amt

      if (com.is_paid) {
        totalCommissionsPaid += amt
      } else {
        totalCommissionsPending += amt
      }

      if (barberCommMap[com.barber_id]) {
        barberCommMap[com.barber_id].earned += amt
        if (com.is_paid) {
          barberCommMap[com.barber_id].paid += amt
        } else {
          barberCommMap[com.barber_id].pending += amt
          barberCommMap[com.barber_id].pendingIds.push(com.id)
        }
      }
    }

    const netShopProfit = Math.max(0, totalRevenue - totalCommissionsEarned)

    // Formatear Métodos de Pago
    const paymentMethodLabels: Record<string, string> = {
      CASH: 'Efectivo',
      YAPE: 'Yape',
      PLIN: 'Plin',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
    }

    const paymentMethods: PaymentMethodStat[] = (
      ['CASH', 'YAPE', 'PLIN', 'CARD', 'TRANSFER'] as const
    ).map((m) => {
      const stat = paymentMap[m] || { total: 0, count: 0 }
      const percentage = totalRevenue > 0 ? (stat.total / totalRevenue) * 100 : 0
      return {
        method: m,
        label: paymentMethodLabels[m],
        total: stat.total,
        count: stat.count,
        percentage: Number(percentage.toFixed(1)),
      }
    })

    // Formatear Tendencia Diaria
    const dailyTrend: DailySalesStat[] = Object.keys(dailyMap)
      .sort()
      .map((dateStr) => {
        const item = dailyMap[dateStr]
        const d = new Date(`${dateStr}T12:00:00Z`)
        const label = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
        return {
          date: dateStr,
          label,
          total: item.total,
          count: item.count,
        }
      })

    // Formatear Top Servicios
    const topServices: TopItemStat[] = Object.entries(serviceRankingMap)
      .map(([id, info]) => ({
        id,
        name: info.name,
        type: 'SERVICE' as const,
        quantity: info.quantity,
        totalRevenue: info.total,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    // Formatear Top Productos
    const topProducts: TopItemStat[] = Object.entries(productRankingMap)
      .map(([id, info]) => ({
        id,
        name: info.name,
        type: 'PRODUCT' as const,
        quantity: info.quantity,
        totalRevenue: info.total,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    // Formatear Estadísticas por Barbero
    const barberStats: BarberCommissionStat[] = memberList
      .map((m) => {
        const bStat = barberCommMap[m.id] || {
          totalSales: 0,
          earned: 0,
          paid: 0,
          pending: 0,
          pendingIds: [],
          servicesCount: 0,
          productsCount: 0,
        }
        return {
          barberId: m.id,
          barberName: m.full_name,
          nickname: m.nickname,
          avatarUrl: m.avatar_url,
          commissionRate: Number(m.commission_rate || 40),
          servicesCount: bStat.servicesCount,
          productsCount: bStat.productsCount,
          totalSalesGenerated: bStat.totalSales,
          totalCommissionsEarned: bStat.earned,
          commissionsPaid: bStat.paid,
          commissionsPending: bStat.pending,
          pendingIds: bStat.pendingIds,
        }
      })
      .sort((a, b) => b.totalSalesGenerated - a.totalSalesGenerated)

    return {
      data: {
        summary: {
          totalRevenue,
          ticketCount,
          averageTicket,
          totalDiscounts,
          totalTips,
          totalCommissionsEarned,
          totalCommissionsPaid,
          totalCommissionsPending,
          netShopProfit,
        },
        paymentMethods,
        dailyTrend,
        topServices,
        topProducts,
        barberStats,
      },
    }
  } catch (err: any) {
    console.error('getReportsDataAction unexpected error:', err)
    return { error: 'Error inesperado al calcular reportes.' }
  }
}

// Acción para liquidar comisiones de un barbero
export async function settleBarberCommissionsAction({
  organization_id,
  barber_id,
  commission_ids,
  slug,
}: {
  organization_id: string
  barber_id: string
  commission_ids?: string[]
  slug: string
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('commissions')
      .update({
        is_paid: true,
        paid_at: now,
      })
      .eq('organization_id', organization_id)
      .eq('barber_id', barber_id)
      .eq('is_paid', false)

    if (commission_ids && commission_ids.length > 0) {
      query = query.in('id', commission_ids)
    }

    const { error } = await query

    if (error) {
      console.error('Error settling commissions:', error)
      return { error: 'Error al marcar comisiones como pagadas.' }
    }

    revalidatePath(`/app/${slug}/reportes`)
    revalidatePath(`/app/${slug}/barberos`)
    return { success: true }
  } catch (err: any) {
    console.error('settleBarberCommissionsAction unexpected error:', err)
    return { error: 'Error inesperado al liquidar comisiones.' }
  }
}

export interface DetailedSaleRow {
  id: string
  createdAt: string
  clientName: string
  clientPhone: string
  barberName: string
  itemsSummary: string
  paymentMethod: string
  subtotal: number
  discount: number
  tip: number
  total: number
  notes: string | null
}

export interface DetailedCashMovementRow {
  id: string
  createdAt: string
  type: 'EXPENSE' | 'INCOME'
  category: string
  description: string
  barberName: string | null
  performedByName: string | null
  amount: number
}

// Acción para obtener reporte detallado de ventas fila por fila
export async function getDetailedSalesReportAction(
  organizationId: string,
  startDateStr: string,
  endDateStr: string
): Promise<{ data?: DetailedSaleRow[]; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Clientes
    const { data: clients } = await supabase
      .from('clients')
      .select('id, full_name, phone')
      .eq('organization_id', organizationId)
    const clientMap = new Map((clients || []).map((c) => [c.id, c]))

    // 2. Miembros / Barberos
    const { data: members } = await supabase
      .from('organization_members')
      .select('id, full_name, nickname')
      .eq('organization_id', organizationId)
    const memberMap = new Map((members || []).map((m) => [m.id, m.nickname || m.full_name]))

    // 3. Servicios y Productos
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .eq('organization_id', organizationId)
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('organization_id', organizationId)
    const serviceMap = new Map((services || []).map((s) => [s.id, s.name]))
    const productMap = new Map((products || []).map((p) => [p.id, p.name]))

    // 4. Ventas completadas
    const { data: sales, error: salesErr } = await supabase
      .from('sales')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'COMPLETED')
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: false })

    if (salesErr) {
      console.error('Error fetching sales for detailed report:', salesErr)
      return { error: 'Error al consultar ventas detalladas.' }
    }

    const saleIds = (sales || []).map((s) => s.id)
    const itemsBySale = new Map<string, string[]>()
    const barbersBySale = new Map<string, string>()

    if (saleIds.length > 0) {
      const { data: items } = await supabase
        .from('sale_items')
        .select('*')
        .in('sale_id', saleIds)

      for (const item of items || []) {
        const name = item.service_id
          ? serviceMap.get(item.service_id) || 'Servicio'
          : item.product_id
            ? productMap.get(item.product_id) || 'Producto'
            : 'Ítem'
        const desc = `${item.quantity}x ${name}`
        const arr = itemsBySale.get(item.sale_id) || []
        arr.push(desc)
        itemsBySale.set(item.sale_id, arr)

        if (item.barber_id && !barbersBySale.has(item.sale_id)) {
          const bName = memberMap.get(item.barber_id)
          if (bName) barbersBySale.set(item.sale_id, bName)
        }
      }
    }

    const rows: DetailedSaleRow[] = (sales || []).map((s) => {
      const client = s.client_id ? clientMap.get(s.client_id) : null
      const barberName =
        barbersBySale.get(s.id) ||
        (s.sold_by ? memberMap.get(s.sold_by) : null) ||
        'Sin asignar'
      const itemsStr = (itemsBySale.get(s.id) || []).join(', ') || 'Venta general'

      return {
        id: s.id,
        createdAt: s.created_at,
        clientName: client ? client.full_name : 'Cliente Ocasional',
        clientPhone: client?.phone || '-',
        barberName,
        itemsSummary: itemsStr,
        paymentMethod: s.payment_method || 'CASH',
        subtotal: Number(s.subtotal || 0),
        discount: Number(s.discount || 0),
        tip: Number(s.tip || 0),
        total: Number(s.total || 0),
        notes: null,
      }
    })

    return { data: rows }
  } catch (err: any) {
    console.error('getDetailedSalesReportAction unexpected error:', err)
    return { error: 'Error inesperado al generar reporte de ventas detalladas.' }
  }
}

// Acción para obtener reporte de movimientos de caja y egresos
export async function getCashMovementsReportAction(
  organizationId: string,
  startDateStr: string,
  endDateStr: string
): Promise<{ data?: DetailedCashMovementRow[]; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Miembros / Barberos
    const { data: members } = await supabase
      .from('organization_members')
      .select('id, full_name, nickname')
      .eq('organization_id', organizationId)
    const memberMap = new Map((members || []).map((m) => [m.id, m.nickname || m.full_name]))

    // 2. Movimientos de caja
    const { data: movements, error: movErr } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr)
      .order('created_at', { ascending: false })

    if (movErr) {
      console.error('Error fetching cash movements for report:', movErr)
      return { error: 'Error al consultar movimientos de caja.' }
    }

    const rows: DetailedCashMovementRow[] = (movements || []).map((m) => ({
      id: m.id,
      createdAt: m.created_at,
      type: m.type as 'EXPENSE' | 'INCOME',
      category: m.category,
      description: m.description,
      barberName: m.barber_id ? memberMap.get(m.barber_id) || null : null,
      performedByName: 'Administración',
      amount: Number(m.amount || 0),
    }))

    return { data: rows }
  } catch (err: any) {
    console.error('getCashMovementsReportAction unexpected error:', err)
    return { error: 'Error inesperado al generar reporte de movimientos de caja.' }
  }
}

