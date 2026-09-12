'use client'

import { useState, useEffect } from 'react'
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
  Copy,
  Check,
  Package,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  Shield,
  Activity,
  DollarSign,
  CircleDot,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import type {
  Organization,
  OrganizationMember,
  CashShift,
  Product,
  Appointment,
} from '@/types/database.types'

export interface DashboardAppointment extends Appointment {
  client?: { full_name: string; phone: string } | null
  barber?: { id: string; full_name: string; nickname: string | null; avatar_url: string | null } | null
  service?: { name: string; price: number; duration_minutes: number } | null
}

export interface DashboardSaleSummary {
  total: number
  count: number
  cashTotal: number
  digitalTotal: number
  cardTotal: number
}

interface DashboardClientProps {
  org: Organization & { subscription?: any }
  slug: string
  appointments: DashboardAppointment[]
  salesSummary: DashboardSaleSummary
  clientsCount: number
  barbers: OrganizationMember[]
  currentShift: CashShift | null
  criticalProducts: Product[]
}

type AppointmentFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export default function DashboardClient({
  org,
  slug,
  appointments,
  salesSummary,
  clientsCount,
  barbers,
  currentShift,
  criticalProducts,
}: DashboardClientProps) {
  const [filter, setFilter] = useState<AppointmentFilter>('ALL')
  const [copiedLink, setCopiedLink] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDateStr, setCurrentDateStr] = useState<string>('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Reloj local en vivo
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      )
      setCurrentDateStr(
        now.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Copiar link de reservas
  async function handleCopyPortalLink() {
    const fullUrl = `${window.location.origin}/reservar/${slug}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedLink(true)
      addToast('success', 'Enlace copiado al portapapeles. ¡Listo para compartir!')
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      addToast('error', 'No se pudo copiar el enlace automáticamente.')
    }
  }

  // Filtrado de citas
  const filteredAppointments = appointments.filter((app) => {
    const st = (app.status || '').toUpperCase()
    if (filter === 'PENDING') return st === 'PENDING' || st === 'CONFIRMED' || st === 'PENDIENTE'
    if (filter === 'IN_PROGRESS') return st === 'IN_PROGRESS' || st === 'EN_PROGRESO'
    if (filter === 'COMPLETED') return st === 'COMPLETED' || st === 'COMPLETADA'
    return true
  })

  // Métricas derivadas
  const completedAppointments = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'COMPLETED' || (a.status || '').toUpperCase() === 'COMPLETADA'
  ).length
  const inProgressAppointments = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'IN_PROGRESS' || (a.status || '').toUpperCase() === 'EN_PROGRESO'
  ).length
  const pendingAppointments = appointments.length - completedAppointments - inProgressAppointments

  // Ticket promedio
  const averageTicket = salesSummary.count > 0 ? salesSummary.total / salesSummary.count : 0

  return (
    <div className="space-y-8">
      {/* 1. Header Operativo - Command Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>SISTEMA EN VIVO</span>
            </div>

            {currentDateStr && (
              <span className="text-xs text-neutral-400 capitalize font-medium">
                {currentDateStr} •{' '}
                <strong className="font-mono text-neutral-200">{currentTime}</strong>
              </span>
            )}

            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-amber-400 font-bold uppercase">
              {org.subscription?.plan_tier || 'PLAN PRO'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {org.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Monitor operativo de facturación, sillas de barberos y citas del día.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleCopyPortalLink}
            className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-neutral-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
            title="Copiar enlace de reservas públicas"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Link Reservas</span>
              </>
            )}
          </button>

          <Link
            href={`/app/${slug}/agenda`}
            className="py-2.5 px-4 rounded-xl bg-[#12131A] border border-white/10 hover:bg-[#1A1D2B] text-neutral-200 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Agenda</span>
          </Link>

          <Link
            href={`/app/${slug}/pos`}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar POS</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Matrix (4 Tarjetas Principales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Facturación Hoy */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Ingresos de Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
              {formatPrice(salesSummary.total)}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>{salesSummary.count} ticket{salesSummary.count !== 1 ? 's' : ''} emitido{salesSummary.count !== 1 ? 's' : ''}</span>
            <span className="text-neutral-300">Prom: {formatPrice(averageTicket)}</span>
          </div>
        </div>

        {/* KPI 2: Citas Agendadas Hoy */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Agenda de Hoy
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-tight">
              {appointments.length}
            </span>
            <span className="text-xs text-neutral-400 font-mono">turnos</span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span className="text-emerald-400">✓ {completedAppointments} listos</span>
            <span className="text-neutral-300">⏳ {pendingAppointments} pendientes</span>
          </div>
        </div>

        {/* KPI 3: Estado de Caja en Mostrador */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              Caja del Turno
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                currentShift
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
                currentShift ? 'text-white' : 'text-neutral-500'
              }`}
            >
              {currentShift ? formatPrice(salesSummary.cashTotal + Number(currentShift.initial_cash || 0)) : 'Cerrada'}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
            {currentShift ? (
              <>
                <span className="text-emerald-400 font-medium">● Turno Activo</span>
                <Link
                  href={`/app/${slug}/caja`}
                  className="text-neutral-400 hover:text-white transition flex items-center gap-1"
                >
                  <span>Arqueo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <span className="text-red-400">Requiere apertura</span>
                <Link
                  href={`/app/${slug}/pos`}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                >
                  <span>Abrir caja</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* KPI 4: Equipo & Alertas Operativas */}
        <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
              {criticalProducts.length > 0 ? 'Alerta de Inventario' : 'Staff de Barberos'}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                criticalProducts.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              {criticalProducts.length > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="mt-3">
            {criticalProducts.length > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-tight">
                  {criticalProducts.length}
                </span>
                <span className="text-xs text-neutral-400 font-mono">ítems críticos</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                  {barbers.length}
                </span>
                <span className="text-xs text-neutral-400 font-mono">activos</span>
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            {criticalProducts.length > 0 ? (
              <>
                <span className="text-amber-400/90 truncate max-w-[130px]">
                  {criticalProducts[0].name}
                </span>
                <Link
                  href={`/app/${slug}/inventario`}
                  className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                >
                  <span>Reponer</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <>
                <span>{clientsCount} clientes en CRM</span>
                <Link
                  href={`/app/${slug}/barberos`}
                  className="text-neutral-400 hover:text-white transition flex items-center gap-1"
                >
                  <span>Equipo</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Radar de Sillas de Trabajo (Live Floor Status) */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base tracking-tight">
                Radar de Sillas & Estaciones en Vivo
              </h2>
              <p className="text-xs text-neutral-400">
                Ocupación y disponibilidad del equipo en el salón ahora mismo
              </p>
            </div>
          </div>

          <Link
            href={`/app/${slug}/barberos`}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Configurar Sillas & Horarios</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {barbers.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No hay barberos registrados en el equipo. Registra a tu primer especialista en la sección Barberos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {barbers.map((barber, index) => {
              // Citas de este barbero hoy
              const barberTodayApps = appointments.filter((a) => a.barber_id === barber.id)
              const currentApp = barberTodayApps.find(
                (a) =>
                  (a.status || '').toUpperCase() === 'IN_PROGRESS' ||
                  (a.status || '').toUpperCase() === 'EN_PROGRESO'
              )
              const nextApp = barberTodayApps.find(
                (a) =>
                  (a.status || '').toUpperCase() === 'PENDING' ||
                  (a.status || '').toUpperCase() === 'CONFIRMED'
              )

              const isOccupied = !!currentApp
              const isReady = !isOccupied

              return (
                <div
                  key={barber.id}
                  className="bg-[#090A0E] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-4 flex flex-col justify-between transition group"
                >
                  <div>
                    {/* Silla header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono font-bold text-neutral-300 flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-white tracking-tight">
                          {barber.nickname || barber.full_name}
                        </span>
                      </div>

                      {isOccupied ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>EN CORTE</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>DISPONIBLE</span>
                        </span>
                      )}
                    </div>

                    {/* Contenido de la silla */}
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs space-y-1 mt-1">
                      {isOccupied && currentApp ? (
                        <>
                          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                            <span>Atendiendo a:</span>
                            <span className="font-semibold text-white truncate max-w-[140px]">
                              {currentApp.client?.full_name || 'Cliente'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Servicio:</span>
                            <span className="text-amber-400 font-medium">
                              {currentApp.service?.name}
                            </span>
                          </div>
                        </>
                      ) : nextApp ? (
                        <>
                          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                            <span>Próxima cita:</span>
                            <span className="font-mono font-semibold text-neutral-200">
                              {new Date(nextApp.start_time).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500">Cliente:</span>
                            <span className="text-white truncate max-w-[140px]">
                              {nextApp.client?.full_name || 'Cliente'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="py-1 text-center text-neutral-500 text-[11px]">
                          Sin citas pendientes asignadas hoy
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer de la silla */}
                  <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{barberTodayApps.length} turno{barberTodayApps.length !== 1 ? 's' : ''} hoy</span>
                    <span className="text-neutral-500 font-mono">
                      Comisión: {barber.commission_rate}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Layout 2 Columnas: Timeline de Citas (Izq) + Control & Canales (Der) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline Citas (8 cols) */}
        <div className="lg:col-span-8 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white text-base">Timeline de Turnos de Hoy</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#090A0E] p-1 rounded-xl border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Todas ({appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'PENDING'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pendientes ({pendingAppointments})
              </button>
              <button
                type="button"
                onClick={() => setFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === 'COMPLETED'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Listas ({completedAppointments})
              </button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-white/10 rounded-2xl">
              <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-neutral-300 font-medium">No hay citas en esta categoría</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Comparte tu portal de reservas o registra un nuevo turno desde la agenda.
              </p>
              <Link
                href={`/app/${slug}/agenda`}
                className="inline-flex items-center gap-1.5 mt-4 py-2 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-neutral-200 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Abrir Agenda Completa</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((app) => {
                const startTime = new Date(app.start_time).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const isCompleted =
                  (app.status || '').toUpperCase() === 'COMPLETED' ||
                  (app.status || '').toUpperCase() === 'COMPLETADA'
                const isInProgress =
                  (app.status || '').toUpperCase() === 'IN_PROGRESS' ||
                  (app.status || '').toUpperCase() === 'EN_PROGRESO'

                const cleanPhone = app.client?.phone ? app.client.phone.replace(/[^0-9]/g, '') : ''
                const waMessage = encodeURIComponent(
                  `¡Hola ${app.client?.full_name || ''}! Te saludamos de ${org.name}. Te recordamos tu cita de ${app.service?.name || 'Corte'} hoy a las ${startTime}. ¿Confirmas tu asistencia?`
                )
                const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.07] hover:border-white/[0.15] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-16 text-center py-2 px-2.5 rounded-xl bg-neutral-900/90 border border-white/10 shrink-0">
                        <span className="text-sm font-mono font-bold text-amber-400 block leading-none">
                          {startTime}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                          {app.service?.duration_minutes || 30} min
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white truncate">
                            {app.client?.full_name || 'Cliente sin nombre'}
                          </h4>

                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                              COMPLETADA
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/25 animate-pulse">
                              EN CURSO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold border border-blue-500/20">
                              CONFIRMADA
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-neutral-200 font-medium">{app.service?.name}</span>
                          <span className="text-neutral-600">•</span>
                          <span>Especialista: <strong className="text-neutral-300 font-normal">{app.barber?.full_name}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-mono font-extrabold text-white block">
                          {formatPrice(Number(app.total_price))}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cleanPhone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 transition cursor-pointer"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {!isCompleted && (
                          <Link
                            href={`/app/${slug}/pos?appointmentId=${app.id}`}
                            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-1 shadow-md shadow-amber-500/20"
                            title="Cobrar en caja POS"
                          >
                            <span>Cobrar</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Canales & Atajos Operativos (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tarjeta Enlace Público con Copy Inmediato */}
          <div className="bg-gradient-to-br from-amber-500/10 via-[#0D0E15] to-[#0A0B10] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Portal de Reservas 24/7
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">Tu Enlace de Citas Online</h3>
            <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed">
              Comparte este enlace directo en la biografía de Instagram, TikTok o código QR en el mostrador.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-neutral-300 font-mono truncate select-all">
                /reservar/{slug}
              </div>
              <button
                type="button"
                onClick={handleCopyPortalLink}
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
                title="Copiar URL completa"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <Link
              href={`/reservar/${slug}`}
              target="_blank"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/15"
            >
              <span>Abrir Portal de Cliente</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Atajos del Sistema */}
          <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider text-neutral-400">
              Accesos Directos del Sistema
            </h3>

            <div className="space-y-2">
              <Link
                href={`/app/${slug}/pos`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-amber-500/40 text-xs text-neutral-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block text-white">Terminal POS & Cobros</span>
                    <span className="text-[10px] text-neutral-500">Cortes, productos y propinas</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition" />
              </Link>

              <Link
                href={`/app/${slug}/inventario`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block text-white">Control de Inventario</span>
                    <span className="text-[10px] text-neutral-500">Stock físico y productos</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>

              <Link
                href={`/app/${slug}/clientes`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block text-white">Fichas Técnicas de Clientes</span>
                    <span className="text-[10px] text-neutral-500">Historial de cortes y preferencias</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>

              <Link
                href={`/app/${slug}/caja`}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block text-white">Turnos de Caja & Arqueo</span>
                    <span className="text-[10px] text-neutral-500">Aperturas, cierres y balances</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts de Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
