import { getTenantAuthContext } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { getReportsDataAction } from '@/actions/reports'
import ReportsClient from '@/components/reports/ReportsClient'

interface ReportsPageProps {
  params: Promise<{ slug: string }>
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { slug } = await params
  const { org, member, isSuperAdmin } = await getTenantAuthContext(slug)

  // Solo propietarios o Súper Administrador tienen acceso a finanzas y liquidaciones
  const isOwner = member?.role === 'OWNER' || isSuperAdmin
  if (!isOwner) {
    redirect(`/app/${slug}/dashboard`)
  }

  // Rango inicial: desde el primer día del mes actual hasta hoy
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const initialStartDate = startOfMonth.toISOString().slice(0, 10)
  const initialEndDate = now.toISOString().slice(0, 10)

  const fullStart = `${initialStartDate}T00:00:00.000Z`
  const fullEnd = `${initialEndDate}T23:59:59.999Z`

  const { data: initialReports } = await getReportsDataAction(
    org.id,
    fullStart,
    fullEnd
  )

  const fallbackData = {
    summary: {
      totalRevenue: 0,
      ticketCount: 0,
      averageTicket: 0,
      totalDiscounts: 0,
      totalTips: 0,
      totalCommissionsEarned: 0,
      totalCommissionsPaid: 0,
      totalCommissionsPending: 0,
      netShopProfit: 0,
    },
    paymentMethods: [],
    dailyTrend: [],
    topServices: [],
    topProducts: [],
    barberStats: [],
  }

  return (
    <ReportsClient
      initialData={initialReports || fallbackData}
      organizationId={org.id}
      slug={slug}
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
    />
  )
}
