'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Scissors,
  User,
  CheckCircle2,
  Users,
  LayoutGrid,
  List,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import NewAppointmentModal from './NewAppointmentModal'
import AppointmentDetailModal, { type AppointmentWithDetails } from './AppointmentDetailModal'
import WhatsAppReminderModal from './WhatsAppReminderModal'
import type { OrganizationMember, Service, WhatsAppNotificationSettings } from '@/types/database.types'
import { useRouter } from 'next/navigation'

interface AgendaClientProps {
  initialAppointments: AppointmentWithDetails[]
  barbers: OrganizationMember[]
  services: Service[]
  organizationId: string
  slug: string
  selectedDate: string
  organizationName?: string
  organizationAddress?: string | null
  whatsappTemplates?: WhatsAppNotificationSettings | null
}

export default function AgendaClient({
  initialAppointments,
  barbers,
  services,
  organizationId,
  slug,
  selectedDate,
  organizationName,
  organizationAddress,
  whatsappTemplates,
}: AgendaClientProps) {
  const router = useRouter()
  const [selectedBarberId, setSelectedBarberId] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'CHAIRS' | 'LIST'>('CHAIRS')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [waAppointment, setWaAppointment] = useState<AppointmentWithDetails | null>(null)
  const [defaultBarberForNew, setDefaultBarberForNew] = useState<string | undefined>()

  // Formato legible de la fecha
  const [year, month, day] = selectedDate.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const formattedDateTitle = dateObj.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleDateChange(newDate: string) {
    router.push(`/app/${slug}/agenda?date=${newDate}`)
  }

  function handlePrevDay() {
    const prev = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000)
    const yyyy = prev.getFullYear()
    const mm = String(prev.getMonth() + 1).padStart(2, '0')
    const dd = String(prev.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  function handleNextDay() {
    const next = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000)
    const yyyy = next.getFullYear()
    const mm = String(next.getMonth() + 1).padStart(2, '0')
    const dd = String(next.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  function handleToday() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  // Filtrado por barbero
  const filteredAppointments = initialAppointments.filter((app) => {
    if (selectedBarberId === 'ALL') return true
    return app.barber_id === selectedBarberId
  })

  // Métricas del día
  const totalBookings = initialAppointments.length
  const confirmedOrInProgress = initialAppointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'COMPLETED'
  ).length
  const estimatedRevenue = initialAppointments
    .filter((a) => a.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + Number(curr.total_price || 0), 0)

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    CONFIRMED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    IN_PROGRESS: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    CANCELLED: { bg: 'bg-neutral-900', text: 'text-neutral-500', border: 'border-neutral-800' },
    NO_SHOW: { bg: 'bg-neutral-900', text: 'text-neutral-500', border: 'border-neutral-800' },
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Control de Citas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight capitalize mt-1">
            {formattedDateTitle}
          </h1>
        </div>

        {/* Date Selector & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Navigation */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition cursor-pointer"
          />

          {/* Switch View */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('CHAIRS')}
              className={
                viewMode === 'CHAIRS'
                  ? 'p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-black'
                  : 'p-1.5 rounded-md transition cursor-pointer text-neutral-400 hover:text-white'
              }
              title="Vista por Silla / Barbero"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={
                viewMode === 'LIST'
                  ? 'p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-black'
                  : 'p-1.5 rounded-md transition cursor-pointer text-neutral-400 hover:text-white'
              }
              title="Vista de Lista Cronológica"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setDefaultBarberForNew(undefined)
              setIsNewModalOpen(true)
            }}
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400">Total Programadas</span>
            <p className="text-xl font-bold text-white mt-0.5">{totalBookings}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400">Activas o Realizadas</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{confirmedOrInProgress}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400">Proyección del Día</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{formatPrice(estimatedRevenue)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Barber Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedBarberId('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
            selectedBarberId === 'ALL'
              ? 'bg-amber-500 text-black font-semibold'
              : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Todos los Barberos ({initialAppointments.length})
        </button>

        {barbers.map((b) => {
          const count = initialAppointments.filter((a) => a.barber_id === b.id).length
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBarberId(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedBarberId === b.id
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {b.nickname || b.full_name} ({count})
            </button>
          )
        })}
      </div>

      {/* View: Chairs / Columns per Barber */}
      {viewMode === 'CHAIRS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
          {(selectedBarberId === 'ALL' ? barbers : barbers.filter((b) => b.id === selectedBarberId)).map(
            (barber) => {
              const barberAppointments = initialAppointments
                .filter((a) => a.barber_id === barber.id)
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

              return (
                <div
                  key={barber.id}
                  className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 flex flex-col min-h-[420px]"
                >
                  {/* Barber Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {barber.nickname ? barber.nickname.charAt(0) : barber.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-xs leading-tight">
                          {barber.nickname || barber.full_name}
                        </h3>
                        <span className="text-[10px] text-neutral-400">{barber.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDefaultBarberForNew(barber.id)
                        setIsNewModalOpen(true)
                      }}
                      className="p-1 rounded-md hover:bg-neutral-800 text-amber-400 transition cursor-pointer"
                      title={`Agendar para ${barber.nickname || barber.full_name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Appointments in Chair */}
                  <div className="space-y-2.5 flex-1">
                    {barberAppointments.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-neutral-800/60 rounded-xl">
                        <Clock className="w-6 h-6 text-neutral-600 mb-1" />
                        <span className="text-xs text-neutral-500">Sin citas para hoy</span>
                        <button
                          onClick={() => {
                            setDefaultBarberForNew(barber.id)
                            setIsNewModalOpen(true)
                          }}
                          className="mt-2 text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          + Agendar cita
                        </button>
                      </div>
                    ) : (
                      barberAppointments.map((app) => {
                        const startTime = new Date(app.start_time).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        const endTime = new Date(app.end_time).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        const statusStyle = statusColors[app.status] || statusColors.CONFIRMED

                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedAppointment(app)}
                            className={`p-3 rounded-xl border bg-neutral-950/70 hover:border-neutral-600 transition cursor-pointer group ${statusStyle.border}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-amber-400">
                                {startTime} - {endTime}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                              {app.client?.full_name || 'Cliente'}
                            </h4>

                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {app.service?.name}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800/60">
                              <div className="flex items-center gap-1.5">
                                <span>{app.service?.duration_minutes} min</span>
                                {app.client?.phone && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setWaAppointment(app)
                                    }}
                                    className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition cursor-pointer"
                                    title="Notificar por WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <span className="font-semibold text-white">
                                {formatPrice(Number(app.total_price))}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            }
          )}
        </div>
      ) : (
        /* View: List View */
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarIcon className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No hay citas registradas para este día.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredAppointments
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((app) => {
                  const startTime = new Date(app.start_time).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const endTime = new Date(app.end_time).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const statusStyle = statusColors[app.status] || statusColors.CONFIRMED

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppointment(app)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/40 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 text-center py-1.5 px-2 rounded-lg bg-neutral-950 border border-neutral-800">
                          <span className="text-xs font-bold text-amber-400">{startTime}</span>
                          <span className="text-[10px] text-neutral-500 block">{endTime}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{app.client?.full_name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {app.service?.name} • Barbero:{' '}
                            <strong className="text-neutral-300">
                              {app.barber?.nickname || app.barber?.full_name}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {app.client?.phone && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setWaAppointment(app)
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-500/20 cursor-pointer"
                            title="Notificar por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        )}
                        <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="text-sm font-bold text-white">
                            {formatPrice(Number(app.total_price))}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {app.service?.duration_minutes} min • {app.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        selectedDate={selectedDate}
        barbers={barbers}
        services={services}
        organizationId={organizationId}
        slug={slug}
        defaultBarberId={defaultBarberForNew}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        organizationId={organizationId}
        slug={slug}
        onOpenWhatsApp={(app) => {
          setSelectedAppointment(null)
          setWaAppointment(app)
        }}
      />

      <WhatsAppReminderModal
        isOpen={!!waAppointment}
        onClose={() => setWaAppointment(null)}
        appointment={waAppointment}
        barberiaName={organizationName || slug}
        barberiaAddress={organizationAddress}
        customTemplates={whatsappTemplates}
      />
    </div>
  )
}
