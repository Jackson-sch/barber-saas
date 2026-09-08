import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import SubscriptionClient from '@/components/subscription/SubscriptionClient'
import type { OrganizationSubscription, SubscriptionPayment } from '@/types/database.types'

interface SuscripcionPageProps {
  params: Promise<{ slug: string }>
}

export default async function SuscripcionPage({ params }: SuscripcionPageProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // 1. Obtener Suscripción actual
  const { data: subscription } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', org.id)
    .single()

  // 2. Obtener Historial de pagos/vouchers enviados
  const { data: payments } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('organization_id', org.id)
    .order('submitted_at', { ascending: false })

  return (
    <SubscriptionClient
      org={org}
      subscription={subscription as unknown as OrganizationSubscription | null}
      payments={(payments || []) as unknown as SubscriptionPayment[]}
      slug={slug}
    />
  )
}
