import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { getPlatformSettings } from '@/lib/platform-settings'
import SubscriptionClient from '@/components/subscription/SubscriptionClient'
import type { OrganizationSubscription, SubscriptionPayment } from '@/types/database.types'

interface SuscripcionPageProps {
  params: Promise<{ slug: string }>
}

export default async function SuscripcionPage({ params }: SuscripcionPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug, { allowWhenExpired: true })
  const supabase = await createClient()

  // 1. Obtener Suscripción actual, historial de pagos y configuración global de cobros
  const [{ data: subscription }, { data: payments }, platformSettings] = await Promise.all([
    supabase
      .from('organization_subscriptions')
      .select('*')
      .eq('organization_id', org.id)
      .single(),
    supabase
      .from('subscription_payments')
      .select('*')
      .eq('organization_id', org.id)
      .order('submitted_at', { ascending: false }),
    getPlatformSettings(),
  ])

  return (
    <SubscriptionClient
      org={org}
      subscription={subscription as unknown as OrganizationSubscription | null}
      payments={(payments || []) as unknown as SubscriptionPayment[]}
      platformSettings={platformSettings}
      slug={slug}
    />
  )
}
