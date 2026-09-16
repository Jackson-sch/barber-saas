'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SubmitVoucherInput {
  organization_id: string
  plan_tier: string
  amount: number
  months_paid: number
  payment_method: 'YAPE' | 'PLIN' | 'TRANSFER' | 'OTHER'
  voucher_url: string
  reference_code?: string | null
  notes?: string | null
  slug: string
}

// 1. Enviar comprobante de pago por parte del tenant
export async function submitSubscriptionPaymentAction(input: SubmitVoucherInput) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }


  if (!input.voucher_url || !input.amount || !input.organization_id) {
    return { error: 'Comprobante y monto son obligatorios.' }
  }

  const { error } = await supabase.from('subscription_payments').insert({
    organization_id: input.organization_id,
    plan_tier: input.plan_tier,
    amount: Number(input.amount),
    months_paid: Number(input.months_paid) || 1,
    payment_method: input.payment_method,
    voucher_url: input.voucher_url,
    reference_code: input.reference_code?.trim() || null,
    notes: input.notes?.trim() || null,
    status: 'PENDING',
  })

  if (error) {
    console.error('Error submitting payment:', error)
    return { error: 'Error al enviar el comprobante.' }
  }

  revalidatePath(`/app/${input.slug}/suscripcion`)
  return { success: true }
}

// 2. Aprobar comprobante por parte del SuperAdmin
export async function approvePaymentAction(paymentId: string, rejectionReason?: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar que sea superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    return { error: 'Acceso denegado: solo para súper administradores.' }
  }

  // Obtener el pago
  const { data: payment, error: pErr } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (pErr || !payment) {
    return { error: 'Pago no encontrado.' }
  }

  // Actualizar estado del pago a APPROVED
  await supabase
    .from('subscription_payments')
    .update({
      status: 'APPROVED',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', paymentId)

  // Obtener suscripción actual de la organización
  const { data: currentSub } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', payment.organization_id)
    .single()

  // Calcular nueva fecha de fin: si aún no venció, sumar meses al end date actual, sino desde hoy
  const baseDate =
    currentSub?.current_period_end && new Date(currentSub.current_period_end) > new Date()
      ? new Date(currentSub.current_period_end)
      : new Date()

  const monthsToAdd = Number(payment.months_paid) || 1
  const newEndDate = new Date(baseDate.setMonth(baseDate.getMonth() + monthsToAdd))

  if (currentSub) {
    await supabase
      .from('organization_subscriptions')
      .update({
        plan_tier: payment.plan_tier as any,
        status: 'ACTIVE',
        current_period_end: newEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', payment.organization_id)
  } else {
    await supabase.from('organization_subscriptions').insert({
      organization_id: payment.organization_id,
      plan_tier: payment.plan_tier as any,
      status: 'ACTIVE',
      current_period_start: new Date().toISOString(),
      current_period_end: newEndDate.toISOString(),
    })
  }

  // Activar la organización en caso estuviese suspendida
  await supabase
    .from('organizations')
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.organization_id)

  revalidatePath('/admin')
  revalidatePath('/admin/pagos')
  revalidatePath('/admin/barberias')
  return { success: true }
}

// 3. Rechazar comprobante por parte del SuperAdmin
export async function rejectPaymentAction(paymentId: string, reason: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    return { error: 'Acceso denegado: solo para súper administradores.' }
  }

  const { error } = await supabase
    .from('subscription_payments')
    .update({
      status: 'REJECTED',
      rejection_reason: reason.trim() || 'Comprobante no válido o no coincide con los registros bancarios.',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', paymentId)

  if (error) {
    return { error: 'Error al rechazar el comprobante.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/pagos')
  return { success: true }
}

// 4. Activar o Suspender barbería desde SuperAdmin
export async function toggleOrganizationStatusAction(orgId: string, is_active: boolean) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    return { error: 'Acceso denegado.' }
  }

  const { error } = await supabase
    .from('organizations')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', orgId)

  if (error) return { error: 'No se pudo cambiar el estado.' }

  revalidatePath('/admin/barberias')
  return { success: true }
}

// 5. Aprobar Barbería Pendiente desde SuperAdmin
export async function approveOrganizationAction(orgId: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    return { error: 'Acceso denegado: solo para súper administradores.' }
  }

  // Obtener la organización actual y sus settings
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, settings')
    .eq('id', orgId)
    .single()

  if (orgErr || !org) {
    return { error: 'No se encontró la barbería a aprobar.' }
  }

  const currentSettings = (typeof org.settings === 'object' && org.settings !== null ? org.settings : {}) as Record<string, any>
  const updatedSettings = {
    ...currentSettings,
    approval_status: 'APPROVED',
    approved_at: new Date().toISOString(),
    approved_by: user.id,
  }

  // Activar la organización
  const { error: updateErr } = await supabase
    .from('organizations')
    .update({
      is_active: true,
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)

  if (updateErr) {
    return { error: 'Error al actualizar el estado de la barbería.' }
  }

  // Iniciar el período de prueba de 14 días a partir de hoy
  const now = new Date()
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  await supabase
    .from('organization_subscriptions')
    .update({
      status: 'TRIAL',
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('organization_id', orgId)

  revalidatePath('/admin')
  revalidatePath('/admin/barberias')
  return { success: true, message: `Barbería "${org.name}" aprobada y activada con éxito.` }
}

