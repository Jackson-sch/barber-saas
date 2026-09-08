import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import {
  Calendar,
  CreditCard,
  Users,
  UserCheck,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Scissors,
  Wallet,
  TrendingUp,
  Share2,
} from 'lucide-react'

interface DashboardProps {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: DashboardProps) {
  const { slug } = await params
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // Hoy en UTC / Local
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // 1. Citas de hoy
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(full_name, phone),
      barber:organization_members(full_name),
      service:services(name, price)
    `)
    .eq('organization_id', org.id)
    .gte('start_time', todayIso)
    .order('start_time', { ascending: true })

  // 2. Ventas de hoy
  const { data: todaySales } = await supabase
    .from('sales')
    .select('total')
    .eq('organization_id', org.id)
    .gte('created_at', todayIso)

  const totalEarningsToday = (todaySales as any[])?.reduce((acc, curr) => acc + Number(curr.total || 0), 0) ?? 0

  // 3. Cantidad de clientes
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)

  // 4. Cantidad de barberos activos
  const { count: barbersCount } = await supabase
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .eq('is_active', true)

  const appointmentsList = todayAppointments || []

  return (
    <div className="space-y-8">
      {/* Header Operativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider">
              Centro de Operaciones
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-neutral-400 font-mono">Salón en Vivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {org.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Métricas de facturación y agenda en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/app/${slug}/agenda`}
            className="py-2.5 px-4 rounded-xl bg-[#12131A] border border-white/10 hover:bg-[#1A1D2B] text-neutral-200 text-xs font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Ver Agenda</span>
          </Link>
          <Link
            href={`/app/${slug}/pos`}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar POS</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards - Monospace figures and hairline borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Hoy */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Ingresos de Hoy
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {formatPrice(totalEarningsToday)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400">●</span> Recaudación acumulada
          </p>
        </div>

        {/* Citas Hoy */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Citas Agendadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-tight">
              {appointmentsList.length}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-mono">
            Turnos registrados hoy
          </p>
        </div>

        {/* Clientes Registrados */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Base de Clientes
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {clientsCount ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-mono">
            Historial con ficha técnica
          </p>
        </div>

        {/* Barberos Activos */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Staff en Turno
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {barbersCount ?? 1}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-mono">
            Especialistas disponibles
          </p>
        </div>
      </div>

      {/* Próximas Citas y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Citas de hoy */}
        <div className="lg:col-span-2 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-white text-base">Timeline de Citas de Hoy</h2>
            </div>
            <Link
              href={`/app/${slug}/agenda`}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium transition flex items-center gap-1"
            >
              <span>Abrir Agenda</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointmentsList.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-white/10 rounded-2xl">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-300 font-medium">No hay citas registradas para hoy aún</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Comparte tu enlace de reservas público o registra un turno manual para comenzar el día.
              </p>
              <Link
                href={`/app/${slug}/agenda`}
                className="inline-flex items-center gap-1.5 mt-4 py-2 px-3.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-neutral-300 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Agendar Cita Manual</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointmentsList.slice(0, 6).map((app: any) => {
                const startTime = new Date(app.start_time).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const isCompleted = app.status === 'completada'
                const isCancelled = app.status === 'cancelada'
                return (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 text-center py-1.5 px-2 rounded-lg bg-neutral-900/80 border border-white/10">
                        <span className="text-xs font-mono font-bold text-amber-400">{startTime}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{app.client?.full_name || 'Cliente sin nombre'}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {app.service?.name} <span className="text-neutral-600">•</span> Barbero: {app.barber?.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white">
                        {formatPrice(Number(app.total_price))}
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isCancelled
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Acceso Rápido y Link Público */}
        <div className="space-y-6">
          {/* Tarjeta Enlace Público */}
          <div className="bg-gradient-to-br from-amber-500/10 via-[#0D0E15] to-[#0A0B10] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">Tu Portal de Reservas</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">Permite que tus clientes agenden 24/7</h3>
            <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed">
              Comparte este enlace en Instagram, Google Maps y WhatsApp para recibir citas automáticamente.
            </p>
            <div className="p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-neutral-300 break-all font-mono select-all mb-3 text-center">
              /reservar/{slug}
            </div>
            <Link
              href={`/reservar/${slug}`}
              target="_blank"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/15"
            >
              <span>Abrir Portal Online</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5">
            <h3 className="font-semibold text-white text-xs uppercase font-mono tracking-wider mb-3 text-neutral-400">
              Atajos de Gestión
            </h3>
            <div className="space-y-2">
              <Link
                href={`/app/${slug}/clientes`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-300 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition" />
                  <span>Fichas Técnicas de Clientes</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>
              <Link
                href={`/app/${slug}/servicios`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-300 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Scissors className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition" />
                  <span>Servicios y Tarifario</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>
              <Link
                href={`/app/${slug}/caja`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-300 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition" />
                  <span>Arqueo y Cierre de Caja</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
