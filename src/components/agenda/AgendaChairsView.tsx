import { Clock, Plus, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { OrganizationMember } from '@/types/database.types'
import type { AppointmentWithDetails } from './AppointmentDetailModal'

interface AgendaChairsViewProps {
  barbers: OrganizationMember[]
  selectedBarberId: string
  initialAppointments: AppointmentWithDetails[]
  statusColors: Record<string, { bg: string; text: string; border: string }>
  onNewAppointment: (barberId?: string) => void
  onSelectAppointment: (app: AppointmentWithDetails) => void
  onWhatsAppNotify: (app: AppointmentWithDetails) => void
}

export default function AgendaChairsView({
  barbers,
  selectedBarberId,
  initialAppointments,
  statusColors,
  onNewAppointment,
  onSelectAppointment,
  onWhatsAppNotify,
}: AgendaChairsViewProps) {
  const displayedBarbers = selectedBarberId === 'ALL' ? barbers : barbers.filter((b) => b.id === selectedBarberId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
      {displayedBarbers.map((barber) => {
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
                onClick={() => onNewAppointment(barber.id)}
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
                    onClick={() => onNewAppointment(barber.id)}
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
                      onClick={() => onSelectAppointment(app)}
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
                                onWhatsAppNotify(app)
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
      })}
    </div>
  )
}
