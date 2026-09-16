import { Calendar as CalendarIcon, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { AppointmentWithDetails } from './AppointmentDetailModal'

interface AgendaListViewProps {
  filteredAppointments: AppointmentWithDetails[]
  statusColors: Record<string, { bg: string; text: string; border: string }>
  onSelectAppointment: (app: AppointmentWithDetails) => void
  onWhatsAppNotify: (app: AppointmentWithDetails) => void
}

export default function AgendaListView({
  filteredAppointments,
  statusColors,
  onSelectAppointment,
  onWhatsAppNotify,
}: AgendaListViewProps) {
  return (
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
                  onClick={() => onSelectAppointment(app)}
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
                          onWhatsAppNotify(app)
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
  )
}
