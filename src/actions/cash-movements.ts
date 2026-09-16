'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface RecordCashMovementInput {
  organization_id: string
  shift_id: string
  type: 'EXPENSE' | 'INCOME'
  category: string
  amount: number
  description: string
  barber_id?: string | null
  slug: string
}

export async function recordCashMovementAction(input: RecordCashMovementInput) {
  try {
    const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado.' }

    if (!input.amount || input.amount <= 0) {
      return { error: 'El monto debe ser mayor a 0.' }
    }

    if (!input.description?.trim()) {
      return { error: 'Debes indicar una descripción o motivo del movimiento.' }
    }

    // Verificar que el turno esté abierto
    const { data: shift, error: shiftErr } = await supabase
      .from('cash_shifts')
      .select('id, status')
      .eq('id', input.shift_id)
      .eq('organization_id', input.organization_id)
      .single()

    if (shiftErr || !shift || shift.status !== 'OPEN') {
      return { error: 'El turno de caja no está abierto o no es válido.' }
    }

    const { error: insertErr } = await supabase.from('cash_movements').insert({
      organization_id: input.organization_id,
      shift_id: input.shift_id,
      type: input.type,
      category: input.category,
      amount: Number(input.amount),
      description: input.description.trim(),
      barber_id: input.barber_id || null,
      performed_by: user.id,
    })

    if (insertErr) {
      console.error('Error inserting cash movement:', insertErr)
      return { error: 'Error al registrar el movimiento de caja.' }
    }

    revalidatePath(`/app/${input.slug}/caja`)
    revalidatePath(`/app/${input.slug}/pos`)
    return { success: true }
  } catch (err: any) {
    console.error('recordCashMovementAction unexpected error:', err)
    return { error: 'Error inesperado al registrar el movimiento.' }
  }
}
