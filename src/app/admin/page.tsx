import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import {
  Building2,
  CreditCard,
  Sparkles,
  Users,
  ArrowUpRight,
  Clock,
  ShieldAlert,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Total Organizaciones
  const { count: totalOrgs } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })

  // 2. Suscripciones Activas
  const { count: activeSubs } = await supabase
    .from('organization_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')

  // 3. Vouchers Pendientes de Revisión
  const { data: pendingPayments, count: pendingCount } = await supabase
    .from('subscription_payments')
    .select('*', { count: 'exact' })
    .eq('status', 'PENDING')
    .order('submitted_at', { ascending: false })

  // 4. Total Recaudado por Suscripciones
  const { data: approvedPayments } = await supabase
    .from('subscription_payments')
    .select('amount')
    .eq('status', 'APPROVED')

  const totalRevenue = (approvedPayments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0)

  // 5. Últimas barberías registradas
  const { data: recentOrgs } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      phone,
      email,
      is_active,
      created_at,
      subscription:organization_subscriptions(plan_tier, status, current_period_end)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Panel de Control Súper Administrador
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Supervisión global de la plataforma BarberOS, métricas de suscripción y facturación.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Barberías
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{totalOrgs ?? 0}</p>
          <span className="text-xs text-neutral-500 mt-1 block">Tenants registrados en total</span>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Planes de Pago Activos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">{activeSubs ?? 0}</p>
          <span className="text-xs text-neutral-500 mt-1 block">Suscripciones vigentes</span>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Pagos Pendientes
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-3">{pendingCount ?? 0}</p>
          <Link
            href="/admin/pagos"
            className="text-xs text-amber-400 hover:underline mt-1 inline-flex items-center gap-1"
          >
            <span>Revisar vouchers</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Recaudación SaaS
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{formatPrice(totalRevenue)}</p>
          <span className="text-xs text-neutral-500 mt-1 block">Ingresos acumulados aprobados</span>
        </div>
      </div>

      {/* Pagos Pendientes Banner */}
      {(pendingCount ?? 0) > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                Hay {pendingCount} comprobante(s) de pago esperando tu revisión
              </h4>
              <p className="text-xs text-neutral-300">
                Aprueba los pagos para que los barberos mantengan sus cuentas activas.
              </p>
            </div>
          </div>

          <Link
            href="/admin/pagos"
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition"
          >
            Ir a Bandeja de Pagos
          </Link>
        </div>
      )}

      {/* Últimas Barberías Registradas */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">Últimas Barberías Registradas</h3>
          <Link
            href="/admin/barberias"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Ver todas las barberías</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="pb-3">Barbería</th>
                <th className="pb-3">Slug</th>
                <th className="pb-3">Contacto</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {(recentOrgs || []).map((org: any) => {
                const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription
                return (
                  <tr key={org.id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                    <td className="py-3 font-semibold text-white">{org.name}</td>
                    <td className="py-3 font-mono text-amber-400">{org.slug}</td>
                    <td className="py-3 text-neutral-400">{org.phone || org.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 border border-neutral-800">
                        {sub?.plan_tier || 'TRIAL'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          org.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {org.is_active ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/reservar/${org.slug}`}
                        target="_blank"
                        className="text-xs text-neutral-400 hover:text-white transition inline-flex items-center gap-1"
                      >
                        <span>Ver Portal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
