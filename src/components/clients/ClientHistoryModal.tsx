'use client'

import { useState, useEffect } from 'react'
import {
  X,
  History,
  Calendar,
  Scissors,
  User,
  DollarSign,
  Loader2,
  Clock,
  MessageCircle,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import { getClientHistoryAction, type ClientHistoryResponse } from '@/actions/clients'
import type { Client } from '@/types/database.types'

interface ClientHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  organizationId: string
  barberiaName: string
}

export default function ClientHistoryModal({
  isOpen,
  onClose,
  client,
  organizationId,
  barberiaName,
}: ClientHistoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<ClientHistoryResponse | null>(null)

  useEffect(() => {
    if (!isOpen || !client) {
      setHistoryData(null)
      setError(null)
      return
    }

    let isMounted = true
    async function fetchHistory() {
      if (!client) return
      setLoading(true)
      setError(null)
      const res = await getClientHistoryAction(client.id, organizationId)
      if (!isMounted) return
      setLoading(false)

      if (res?.error) {
        setError(res.error)
      } else if (res?.data) {
        setHistoryData(res.data)
      }
    }

    fetchHistory()
    return () => {
      isMounted = false
    }
  }, [isOpen, client, organizationId])

  if (!isOpen || !client) return null

  const waReengagementText = `¡Hola ${client.full_name}! Te saludamos de ${barberiaName}. Esperamos que estés muy bien. ¿Te gustaría agendar tu próximo turno de corte y barba con nosotros?`
  const waUrl = client.phone ? formatWhatsAppUrl(client.phone, waReengagementText) : ''

  const statusBadges: Record<string, { label: string; style: string }> = {
    COMPLETED: { label: 'Completada', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    CONFIRMED: { label: 'Confirmada', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    IN_PROGRESS: { label: 'En Curso', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    PENDING: { label: 'Pendiente', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    CANCELLED: { label: 'Cancelada', style: 'bg-neutral-800 text-neutral-400 border-neutral-700' },
    NO_SHOW: { label: 'No Asistió', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101118] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Historial de Visitas & Citas
              </h3>
              <p className="text-xs text-neutral-400">
                {client.full_name} • <span className="font-mono text-neutral-300">{client.phone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs text-neutral-400">Consultando historial del cliente...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : historyData ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Citas Totales
                  </span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-mono">
                    {historyData.stats.totalAppointments}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {historyData.stats.completedAppointments} completadas
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Inversión Total
                  </span>
                  <span className="text-lg font-bold text-amber-400 mt-0.5 block font-mono">
                    {formatPrice(historyData.stats.totalSpent)}
                  </span>
                  <span className="text-[10px] text-neutral-400">LTV acumulado</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Barbero Frecuente
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 block truncate">
                    {historyData.stats.favoriteBarber || 'Varios'}
                  </span>
                  <span className="text-[10px] text-neutral-400">Mayor preferencia</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-white/5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
                    Última Visita
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 block">
                    {historyData.stats.lastVisit
                      ? new Date(historyData.stats.lastVisit).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Sin visitas'}
                  </span>
                  <span className="text-[10px] text-neutral-400">Fecha del turno</span>
                </div>
              </div>

              {/* Timeline List */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cronología de Servicios ({historyData.appointments.length})</span>
                </h4>

                {historyData.appointments.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-white/10 rounded-xl">
                    <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400 font-medium">Este cliente aún no tiene citas registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {historyData.appointments.map((app) => {
                      const dateObj = new Date(app.startTime)
                      const dateFormatted = dateObj.toLocaleDateString('es-PE', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                      const timeFormatted = dateObj.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      const badge = statusBadges[app.status] || {
                        label: app.status,
                        style: 'bg-neutral-800 text-neutral-300 border-neutral-700',
                      }

                      return (
                        <div
                          key={app.id}
                          className="p-3 rounded-xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-14 text-center py-1.5 px-1 rounded-lg bg-neutral-950 border border-white/10 shrink-0">
                              <span className="text-xs font-mono font-bold text-amber-400 block leading-none">
                                {timeFormatted}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500 mt-1 block capitalize">
                                {dateObj.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-white">{app.serviceName}</h5>
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${badge.style}`}
                                >
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                Atendido por:{' '}
                                <span className="text-neutral-200">
                                  {app.barberName}
                                  {app.barberNickname ? ` (${app.barberNickname})` : ''}
                                </span>
                              </p>
                              {app.notes && (
                                <p className="text-[10px] text-neutral-500 italic mt-0.5">
                                  Nota: {app.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-amber-400 block">
                              {formatPrice(app.totalPrice)}
                            </span>
                            <span className="text-[10px] text-neutral-500 block capitalize">
                              {dateFormatted}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-neutral-900/30 flex items-center justify-between gap-3">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mensaje WhatsApp</span>
            </a>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
