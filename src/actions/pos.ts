'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CartItemInput {
  service_id?: string | null
  product_id?: string | null
  name: string
  item_type: 'SERVICE' | 'PRODUCT'
  barber_id?: string | null
  quantity: number
  unit_price: number
  subtotal: number
  commission_percent?: number
}

export interface CreateSaleInput {
  organization_id: string
  shift_id?: string | null
  client_id?: string | null
  client_name?: string
  client_phone?: string
  appointment_id?: string | null
  items: CartItemInput[]
  discount: number
  tip: number
  payment_method: 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED'
  slug: string
  redeem_loyalty_reward?: boolean
  loyalty_reward_description?: string
}

// 1. Abrir Turno de Caja
export async function openCashShiftAction(
  organization_id: string,
  initial_cash: number,
  notes: string | null,
  slug: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Verificar si ya hay un turno abierto
  const { data: existingShift } = await supabase
    .from('cash_shifts')
    .select('id')
    .eq('organization_id', organization_id)
    .eq('status', 'OPEN')
    .single()

  if (existingShift) {
    return { error: 'Ya existe un turno de caja abierto.' }
  }

  const { error } = await supabase.from('cash_shifts').insert({
    organization_id,
    opened_by: user.id,
    initial_cash: Number(initial_cash) || 0,
    status: 'OPEN',
    notes: notes?.trim() || null,
  })

  if (error) {
    console.error('Error opening shift:', error)
    return { error: 'Error al abrir el turno de caja.' }
  }

  revalidatePath(`/app/${slug}/caja`)
  revalidatePath(`/app/${slug}/pos`)
  return { success: true }
}

// 2. Cerrar Turno de Caja (Arqueo)
export async function closeCashShiftAction(
  shift_id: string,
  organization_id: string,
  final_cash: number,
  notes: string | null,
  slug: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Obtener el turno actual
  const { data: shift, error: shiftErr } = await supabase
    .from('cash_shifts')
    .select('*')
    .eq('id', shift_id)
    .eq('organization_id', organization_id)
    .single()

  if (shiftErr || !shift) {
    return { error: 'Turno de caja no encontrado.' }
  }

  // Calcular ventas en efectivo realizadas en este turno
  const { data: cashSales } = await supabase
    .from('sales')
    .select('total')
    .eq('shift_id', shift_id)
    .eq('payment_method', 'CASH')
    .eq('status', 'COMPLETED')

  const totalCashSales = (cashSales || []).reduce((acc, curr) => acc + Number(curr.total || 0), 0)

  // Calcular movimientos manuales de caja (ingresos y egresos)
  const { data: movements } = await supabase
    .from('cash_movements')
    .select('type, amount')
    .eq('shift_id', shift_id)

  const totalManualIncomes = (movements || [])
    .filter((m) => m.type === 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  const totalExpenses = (movements || [])
    .filter((m) => m.type === 'EXPENSE')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  const expectedCash =
    Number(shift.initial_cash || 0) + totalCashSales + totalManualIncomes - totalExpenses
  const difference = Number(final_cash) - expectedCash

  const { error } = await supabase
    .from('cash_shifts')
    .update({
      closed_by: user.id,
      closed_at: new Date().toISOString(),
      final_cash: Number(final_cash),
      expected_cash: expectedCash,
      difference: difference,
      status: 'CLOSED',
      notes: notes?.trim() || shift.notes,
    })
    .eq('id', shift_id)
    .eq('organization_id', organization_id)

  if (error) {
    console.error('Error closing shift:', error)
    return { error: 'Error al cerrar el turno de caja.' }
  }

  revalidatePath(`/app/${slug}/caja`)
  revalidatePath(`/app/${slug}/pos`)
  return { success: true }
}

// 3. Registrar Venta (POS)
export async function createSaleAction(input: CreateSaleInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!input.items || input.items.length === 0) {
    return { error: 'El carrito de venta no puede estar vacío.' }
  }

  // 1. Validar estrictamente que exista un turno de caja abierto
  const { data: openShift, error: shiftErr } = await supabase
    .from('cash_shifts')
    .select('id')
    .eq('organization_id', input.organization_id)
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (shiftErr || !openShift) {
    return {
      error: 'La caja está cerrada. Debes abrir un turno de caja con fondo inicial antes de realizar un cobro.',
    }
  }

  // 2. Cliente: si no tiene client_id pero se pasó teléfono, buscar o crear
  let clientId = input.client_id || null
  if (!clientId && input.client_phone?.trim()) {
    const phoneClean = input.client_phone.trim().replace(/\s+/g, '')
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', input.organization_id)
      .eq('phone', phoneClean)
      .single()

    if (existingClient) {
      clientId = existingClient.id
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          organization_id: input.organization_id,
          full_name: input.client_name?.trim() || 'Cliente Casual',
          phone: phoneClean,
        })
        .select('id')
        .single()
      if (newClient) clientId = newClient.id
    }
  }

  // 3. Calcular totales
  const subtotal = input.items.reduce((acc, it) => acc + Number(it.subtotal || 0), 0)
  const discount = Number(input.discount) || 0
  const tip = Number(input.tip) || 0
  const total = Math.max(0, subtotal - discount) + tip

  // 4. Crear Registro de Venta vinculado al turno abierto verificado
  const { data: sale, error: saleErr } = await supabase
    .from('sales')
    .insert({
      organization_id: input.organization_id,
      shift_id: openShift.id,
      client_id: clientId,
      appointment_id: input.appointment_id || null,
      sold_by: user?.id || null,
      subtotal,
      discount,
      tip,
      total,
      payment_method: input.payment_method,
      status: 'COMPLETED',
    })
    .select('id')
    .single()

  if (saleErr || !sale) {
    console.error('Error creating sale:', saleErr)
    return { error: 'Error al registrar la venta.' }
  }

  // 4. Crear Detalles de Venta e Insertar Comisiones
  for (const it of input.items) {
    const commissionPercent = Number(it.commission_percent ?? 40)
    const commissionAmount = it.barber_id ? (Number(it.subtotal) * commissionPercent) / 100 : 0

    await supabase.from('sale_items').insert({
      sale_id: sale.id,
      item_type: it.item_type,
      service_id: it.service_id || null,
      product_id: it.product_id || null,
      barber_id: it.barber_id || null,
      quantity: it.quantity,
      unit_price: it.unit_price,
      subtotal: it.subtotal,
      commission_amount: commissionAmount,
    })

    // Si tiene barbero asignado y generó comisión, registrar en commissions
    if (it.barber_id && commissionAmount > 0) {
      await supabase.from('commissions').insert({
        organization_id: input.organization_id,
        barber_id: it.barber_id,
        sale_id: sale.id,
        amount: commissionAmount,
        is_paid: false,
      })
    }

    // Descontar stock físico si el ítem es un producto
    if (it.item_type === 'PRODUCT' && it.product_id) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock')
        .eq('id', it.product_id)
        .eq('organization_id', input.organization_id)
        .single()

      if (prod) {
        const remainingStock = Math.max(0, (prod.stock || 0) - it.quantity)
        await supabase
          .from('products')
          .update({
            stock: remainingStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', it.product_id)
          .eq('organization_id', input.organization_id)
      }
    }
  }

  // 5. Si la venta vino de una cita, marcarla como COMPLETED
  if (input.appointment_id) {
    await supabase
      .from('appointments')
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.appointment_id)
      .eq('organization_id', input.organization_id)
  }

  // 6. Actualizar fidelización, visitas y gasto del cliente
  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('total_visits, total_spent, loyalty_points')
      .eq('id', clientId)
      .single()

    if (client) {
      // Consultar configuración del programa de fidelización
      const { data: orgData } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', input.organization_id)
        .single()

      const loyaltyProgram = (orgData?.settings as any)?.loyalty_program
      const isLoyaltyEnabled = loyaltyProgram?.enabled === true

      let currentPoints = client.loyalty_points || 0
      let pointsDelta = 0
      let actionType: 'EARN_VISIT' | 'EARN_POINTS' = 'EARN_VISIT'

      if (isLoyaltyEnabled) {
        if (loyaltyProgram.program_type === 'POINTS') {
          actionType = 'EARN_POINTS'
          const ptsPerPen = Number(loyaltyProgram.points_per_pen || 1)
          pointsDelta = Math.floor(total * ptsPerPen)
        } else {
          // Por visitas / sellos
          actionType = 'EARN_VISIT'
          pointsDelta = 1
        }

        // Si se canjeó un premio en esta venta
        if (input.redeem_loyalty_reward) {
          const costToRedeem =
            loyaltyProgram.program_type === 'POINTS'
              ? Number(loyaltyProgram.target_points || 100)
              : Number(loyaltyProgram.target_visits || 8)

          currentPoints = Math.max(0, currentPoints - costToRedeem)

          await supabase.from('loyalty_logs').insert({
            organization_id: input.organization_id,
            client_id: clientId,
            sale_id: sale.id,
            type: 'REDEEM_REWARD',
            points_delta: -costToRedeem,
            reward_description:
              input.loyalty_reward_description ||
              (loyaltyProgram.reward_title
                ? `Canje de premio: ${loyaltyProgram.reward_title}`
                : 'Canje de premio de fidelización'),
          })
        }

        // Registrar acumulación ganada
        if (pointsDelta > 0) {
          currentPoints += pointsDelta
          await supabase.from('loyalty_logs').insert({
            organization_id: input.organization_id,
            client_id: clientId,
            sale_id: sale.id,
            type: actionType,
            points_delta: pointsDelta,
            reward_description:
              actionType === 'EARN_VISIT'
                ? '+1 sello por visita completada'
                : `+${pointsDelta} puntos por consumo`,
          })
        }
      }

      await supabase
        .from('clients')
        .update({
          total_visits: (client.total_visits || 0) + 1,
          total_spent: Number(client.total_spent || 0) + total,
          loyalty_points: currentPoints,
          last_visit_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
    }
  }

  revalidatePath(`/app/${input.slug}/pos`)
  revalidatePath(`/app/${input.slug}/caja`)
  revalidatePath(`/app/${input.slug}/clientes`)
  revalidatePath(`/app/${input.slug}/agenda`)
  revalidatePath(`/app/${input.slug}/dashboard`)
  revalidatePath(`/app/${input.slug}/inventario`)

  return { success: true, saleId: sale.id }
}
