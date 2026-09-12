'use client'

import Link from 'next/link'
import { Clock, Calendar, Plus, MessageCircle, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { DashboardAppointment } from './DashboardClient'

export type AppointmentFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

interface AppointmentsTimelineProps {
  totalCount: number
  filteredAppointments: DashboardAppointment[]
  filter: AppointmentFilter
  onFilterChange: (filter: AppointmentFilter) => void
  orgName: string
  slug: string
  pendingCount: number
  completedCount: number
}

export default function AppointmentsTimeline({
  totalCount,
  filteredAppointments,
  filter,
  onFilterChange,
  orgName,
  slug,
  pendingCount,
  completedCount,
}: AppointmentsTimelineProps) {
  return (
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
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filter === 'ALL'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('PENDING')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filter === 'PENDING'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('COMPLETED')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Listas ({completedCount})
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
              `¡Hola ${app.client?.full_name || ''}! Te saludamos de ${orgName}. Te recordamos tu cita de ${app.service?.name || 'Corte'} hoy a las ${startTime}. ¿Confirmas tu asistencia?`
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
                      <span>
                        Especialista:{' '}
                        <strong className="text-neutral-300 font-normal">
                          {app.barber?.full_name}
                        </strong>
                      </span>
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
  )
}
