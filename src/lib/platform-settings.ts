import { createClient } from '@/lib/supabase/server'
import type { PlatformSettings } from '@/types/database.types'

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'default',
  platform_name: 'BarberOS',
  yape_phone: '999 888 777',
  yape_holder: 'BarberOS Oficial',
  yape_qr_url: null,
  plin_phone: '999 888 777',
  bank_name: 'BCP Soles',
  bank_account: '193-98765432-0-12',
  bank_cci: '002-193009876543201211',
  bank_holder: 'BarberOS S.A.C.',
  starter_price: 59,
  pro_price: 99,
  enterprise_price: 179,
  trial_days: 14,
  support_whatsapp: null,
  support_email: null,
  updated_at: new Date().toISOString(),
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_PLATFORM_SETTINGS
    }

    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...data,
      starter_price: Number(data.starter_price ?? DEFAULT_PLATFORM_SETTINGS.starter_price),
      pro_price: Number(data.pro_price ?? DEFAULT_PLATFORM_SETTINGS.pro_price),
      enterprise_price: Number(data.enterprise_price ?? DEFAULT_PLATFORM_SETTINGS.enterprise_price),
      trial_days: Number(data.trial_days ?? DEFAULT_PLATFORM_SETTINGS.trial_days),
    }
  } catch {
    return DEFAULT_PLATFORM_SETTINGS
  }
}
