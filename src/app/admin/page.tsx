import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDateOnly } from '@/lib/utils'
import Link from 'next/link'
import {
  Building2,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  Settings,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalOrgs },
    { count: activeSubs },
    { count: pendingCount },
    { data: approvedPayments },
    { data: recentOrgs },
  ] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase
      .from('organization_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
    supabase
      .from('subscription_payments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase.from('subscription_payments').select('amount').eq('status', 'APPROVED'),
    supabase
      .from('organizations')
      .select(
        `
        id,
        name,
        slug,
        phone,
        email,
        city,
        is_active,
        settings,
        created_at,
        subscription:organization_subscriptions(plan_tier, status, current_period_end)
      `
      )
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const totalRevenue = (approvedPayments || []).reduce((acc, p) => acc + Number(p.amount || 0), 0)
  const pendingOrgs = (recentOrgs || []).filter((o: any) => {
    const s = (typeof o.settings === 'object' && o.settings !== null ? o.settings : {}) as Record<
      string,
      any
    >
    return !o.is_active && s.approval_status === 'PENDING'
  }).length

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-[#0D0E15] to-[#0D0E15] border border-amber-500/25 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Centro de Comando SaaS
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            Panel de Control Súper Administrador
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Supervisión global de barberías (tenants), facturación recurrente y aprobaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/pagos"
            className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bandeja de Pagos</span>
            {(pendingCount ?? 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-black text-amber-400 text-[10px] font-extrabold tabular-nums">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/barberias"
            className="py-2 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Directorio Barberías</span>
          </Link>
          <Link
            href="/admin/configuracion"
            className="py-2 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-neutral-200 font-semibold text-xs transition inline-flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-400" />
            <span>Configuración</span>
          </Link>
        </div>
      </div>

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Total Barberías
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {totalOrgs ?? 0}
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              Tenants registrados
            </span>
          </div>
        </div>

        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Planes Activos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
              {activeSubs ?? 0}
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              Suscripciones al día
            </span>
          </div>
        </div>

        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Por Aprobar
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
              {pendingCount ?? 0}
            </p>
            <Link
              href="/admin/pagos"
              className="text-[11px] text-amber-400 hover:underline mt-0.5 inline-flex items-center gap-1 font-medium"
            >
              <span>Revisar vouchers</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Recaudado SaaS
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl sm:text-2xl font-black text-white tabular-nums truncate">
              {formatPrice(totalRevenue)}
            </p>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              Pagos aprobados
            </span>
          </div>
        </div>
      </div>

      {/* Alertas Accionables */}
      {((pendingCount ?? 0) > 0 || pendingOrgs > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(pendingCount ?? 0) > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {pendingCount} comprobante(s) esperando validación
                  </h4>
                  <p className="text-[11px] text-neutral-300">
                    Verifica el voucher de pago para extender la vigencia del salón.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/pagos"
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition text-center shrink-0"
              >
                Revisar Pagos
              </Link>
            </div>
          )}

          {pendingOrgs > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {pendingOrgs} barbería(s) nueva(s) por aprobar
                  </h4>
                  <p className="text-[11px] text-neutral-300">
                    Autoriza el ingreso para activar su período de prueba.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/barberias"
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition text-center shrink-0"
              >
                Ver Solicitudes
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Últimas Barberías Registradas (Responsive Cards en Móvil / Tabla en Escritorio) */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Últimas Barberías Registradas
            </h3>
            <p className="text-[11px] text-neutral-400">
              Actividad reciente de tenants e historial de alta.
            </p>
          </div>
          <Link
            href="/admin/barberias"
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-amber-400 inline-flex items-center gap-1 transition shrink-0"
          >
            <span>Ver todas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Vista Móvil (Tarjetas) */}
        <div className="space-y-3 md:hidden">
          {(recentOrgs || []).map((org: any) => {
            const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription
            const s = (
              typeof org.settings === 'object' && org.settings !== null ? org.settings : {}
            ) as Record<string, any>
            const isPending = !org.is_active && s.approval_status === 'PENDING'

            return (
              <div
                key={org.id}
                className="p-3.5 rounded-xl bg-neutral-950/90 border border-white/[0.06] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{org.name}</p>
                    <span className="text-[11px] font-mono text-amber-400">/{org.slug}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0D0E15] border border-white/[0.08] text-neutral-300">
                      {sub?.plan_tier || 'TRIAL'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : org.is_active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isPending ? 'Pendiente' : org.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/[0.05]">
                  <span className="truncate">{org.phone || org.email || 'Sin contacto'}</span>
                  <Link
                    href={`/reservar/${org.slug}`}
                    target="_blank"
                    className="text-amber-400 font-semibold inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Vista Escritorio (Tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="pb-3 pr-4 whitespace-nowrap">Barbería</th>
                <th className="pb-3 px-3 whitespace-nowrap">Slug</th>
                <th className="pb-3 px-3 whitespace-nowrap">Contacto</th>
                <th className="pb-3 px-3 whitespace-nowrap">Plan</th>
                <th className="pb-3 px-3 whitespace-nowrap">Alta</th>
                <th className="pb-3 px-3 whitespace-nowrap">Estado</th>
                <th className="pb-3 pl-3 text-right whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {(recentOrgs || []).map((org: any) => {
                const sub = Array.isArray(org.subscription) ? org.subscription[0] : org.subscription
                const s = (
                  typeof org.settings === 'object' && org.settings !== null ? org.settings : {}
                ) as Record<string, any>
                const isPending = !org.is_active && s.approval_status === 'PENDING'

                return (
                  <tr key={org.id} className="text-neutral-300 hover:bg-white/[0.02] transition">
                    <td className="py-3 pr-4 font-bold text-white whitespace-nowrap">
                      {org.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400 whitespace-nowrap">
                      /{org.slug}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">
                      {org.phone || org.email || '—'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 border border-white/[0.08]">
                        {sub?.plan_tier || 'TRIAL'}
                      </span>
                    </td>
                    <td
                      className="py-3 px-3 font-mono text-neutral-400 whitespace-nowrap"
                      suppressHydrationWarning
                    >
                      {formatDateOnly(org.created_at)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPending
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : org.is_active
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {isPending ? 'Pendiente' : org.is_active ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <Link
                        href={`/reservar/${org.slug}`}
                        target="_blank"
                        className="text-xs text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Ver Portal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
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
