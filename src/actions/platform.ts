'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface UpdatePlatformSettingsInput {
  platform_name: string
  yape_phone?: string | null
  yape_holder?: string | null
  yape_qr_url?: string | null
  plin_phone?: string | null
  bank_name?: string | null
  bank_account?: string | null
  bank_cci?: string | null
  bank_holder?: string | null
  starter_price: number
  pro_price: number
  enterprise_price: number
  trial_days: number
  support_whatsapp?: string | null
  support_email?: string | null
}

export async function updatePlatformSettingsAction(input: UpdatePlatformSettingsInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado.' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_super_admin) {
      return { error: 'Acceso denegado: solo para súper administradores.' }
    }

    const payload = {
      id: 'default',
      platform_name: input.platform_name.trim() || 'BarberOS',
      yape_phone: input.yape_phone?.trim() || null,
      yape_holder: input.yape_holder?.trim() || null,
      yape_qr_url: input.yape_qr_url?.trim() || null,
      plin_phone: input.plin_phone?.trim() || null,
      bank_name: input.bank_name?.trim() || 'BCP Soles',
      bank_account: input.bank_account?.trim() || null,
      bank_cci: input.bank_cci?.trim() || null,
      bank_holder: input.bank_holder?.trim() || null,
      starter_price: Math.max(1, Number(input.starter_price) || 59),
      pro_price: Math.max(1, Number(input.pro_price) || 99),
      enterprise_price: Math.max(1, Number(input.enterprise_price) || 179),
      trial_days: Math.max(1, Math.min(365, parseInt(String(input.trial_days), 10) || 14)),
      support_whatsapp: input.support_whatsapp?.trim() || null,
      support_email: input.support_email?.trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('platform_settings')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error('Error updating platform settings:', error)
      return {
        error:
          'No se pudo guardar en base de datos. Asegúrate de haber ejecutado el schema.sql actualizado (tabla platform_settings).',
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/configuracion')
    revalidatePath('/app', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('updatePlatformSettingsAction error:', err)
    return { error: err?.message || 'Error inesperado al guardar configuración.' }
  }
}
