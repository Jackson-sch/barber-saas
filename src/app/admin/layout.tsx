import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    redirect('/login?error=unauthorized')
  }

  // Contadores en tiempo real para badges de la barra lateral / móvil
  const [{ count: pendingPaymentsCount }, { data: inactiveOrgs }] = await Promise.all([
    supabase
      .from('subscription_payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('organizations')
      .select('id, settings')
      .eq('is_active', false),
  ])

  const pendingOrgsCount = (inactiveOrgs || []).filter((o) => {
    const s = (typeof o.settings === 'object' && o.settings !== null ? o.settings : {}) as Record<
      string,
      any
    >
    return s.approval_status === 'PENDING'
  }).length

  return (
    <div className="min-h-screen bg-[#07080C] text-neutral-100 flex flex-col md:flex-row">
      <AdminSidebar
        userEmail={user.email || 'admin@barberos.app'}
        pendingPaymentsCount={pendingPaymentsCount ?? 0}
        pendingOrgsCount={pendingOrgsCount}
      />

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
