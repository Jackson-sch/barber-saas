import { createClient } from '@/lib/supabase/server'
import AdminBarberiasClient, { type OrgWithSubscription } from '@/components/admin/AdminBarberiasClient'

export default async function AdminBarberiasPage() {
  const supabase = await createClient()

  const { data: orgs } = await supabase
    .from('organizations')
    .select(`
      *,
      subscription:organization_subscriptions(*)
    `)
    .order('created_at', { ascending: false })

  const formatted = (orgs || []).map((o: any) => ({
    ...o,
    subscription: Array.isArray(o.subscription) ? o.subscription[0] || null : o.subscription || null,
  }))

  return <AdminBarberiasClient initialOrgs={formatted as unknown as OrgWithSubscription[]} />
}
