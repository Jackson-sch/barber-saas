'use client'

import { useState } from 'react'
import {
  X,
  Clock,
  User,
  Phone,
  Scissors,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Play,
  XCircle,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
  Loader2,
  Eye,
} from 'lucide-react'
import { formatPrice, formatMinutes } from '@/lib/utils'
import { updateAppointmentStatusAction } from '@/actions/agenda'
import Link from 'next/link'

export interface AppointmentWithDetails {
  id: string
  organization_id: string
  client_id: string
  barber_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  source: string
  notes: string | null
  total_price: number
  voucher_url?: string | null
  client?: {
    full_name: string
    phone: string
    email?: string | null
    total_visits?: number
  } | null
  barber?: {
    full_name: string
    nickname?: string | null
  } | null
  service?: {
    name: string
    duration_minutes: number
    price: number
  } | null
}

interface AppointmentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentWithDetails | null
  organizationId: string
  slug: string
  onOpenWhatsApp?: (appointment: AppointmentWithDetails) => void
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  organizationId,
  slug,
  onOpenWhatsApp,
}: AppointmentDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [showVoucherZoom, setShowVoucherZoom] = useState(false)

  if (!isOpen || !appointment) return null

  const startTime = new Date(appointment.start_time).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endTime = new Date(appointment.end_time).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const dateStr = new Date(appointment.start_time).toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusMeta: Record<string, { label: string; color: string; border: string }> = {
    PENDING: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-400', border: 'border-amber-500/30' },
    CONFIRMED: { label: 'Confirmada', color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/30' },
    IN_PROGRESS: { label: 'En Silla / Cortando', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/30' },
    COMPLETED: { label: 'Completada', color: 'bg-emerald-500/10 text-emerald-400', border: 'border-emerald-500/30' },
    CANCELLED: { label: 'Cancelada', color: 'bg-red-500/10 text-red-400', border: 'border-red-500/30' },
    NO_SHOW: { label: 'No Asistió', color: 'bg-neutral-800 text-neutral-400', border: 'border-neutral-700' },
  }

  const currentMeta = statusMeta[appointment.status] || statusMeta.CONFIRMED

  async function handleStatusChange(newStatus: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') {
    if (!appointment) return
    setLoading(true)
    await updateAppointmentStatusAction(appointment.id, organizationId, newStatus, slug)
    setLoading(false)
    onClose()
  }

  // Enlace WhatsApp
  const phoneClean = appointment.client?.phone?.replace(/\D/g, '') || ''
  const waUrl = phoneClean
    ? `https://wa.me/51${phoneClean}?text=Hola%20${encodeURIComponent(
        appointment.client?.full_name || ''
      )},%20te%20saludamos%20para%20confirmar%20tu%20cita%20de%20hoy.`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Detalle de la Cita</h3>
              <p className="text-xs text-neutral-400 capitalize">{dateStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Status and Time banner */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">
                  {startTime} - {endTime}
                </span>
                <p className="text-xs text-neutral-400">
                  {appointment.service?.duration_minutes ? formatMinutes(appointment.service.duration_minutes) : '30 min'} de servicio
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${currentMeta.color} ${currentMeta.border}`}>
              {currentMeta.label}
            </span>
          </div>

          {/* Client Details */}
          <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-sm">
                  {appointment.client?.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{appointment.client?.full_name}</h4>
                  <p className="text-xs text-neutral-400">
                    Visitas previas: <strong className="text-amber-400">{appointment.client?.total_visits || 0}</strong>
                  </p>
                </div>
              </div>

              {appointment.client?.phone && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenWhatsApp) {
                      onOpenWhatsApp(appointment)
                    } else if (waUrl) {
                      window.open(waUrl, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  className="py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Notificar WhatsApp</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1 border-t border-neutral-800/60">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{appointment.client?.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500">Origen:</span>
                <span className="text-neutral-300 font-medium">{appointment.source}</span>
              </div>
            </div>
          </div>

          {/* Service & Barber */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
              <span className="text-[11px] text-neutral-500 block uppercase tracking-wider mb-1">
                Servicio
              </span>
              <p className="text-xs font-bold text-white leading-snug">{appointment.service?.name}</p>
              <p className="text-xs text-amber-400 font-semibold mt-1">
                {formatPrice(Number(appointment.total_price))}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
              <span className="text-[11px] text-neutral-500 block uppercase tracking-wider mb-1">
                Barbero Asignado
              </span>
              <p className="text-xs font-bold text-white leading-snug">
                {appointment.barber?.nickname || appointment.barber?.full_name}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{appointment.barber?.full_name}</p>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
              <span className="text-neutral-500 block font-semibold mb-0.5">Nota:</span>
              <p className="text-neutral-300">{appointment.notes}</p>
            </div>
          )}

          {/* Comprobante de Pago Adjunto (Yape/Plin/Transferencia) */}
          {appointment.voucher_url && (
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Comprobante de Pago Adjunto</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVoucherZoom(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ampliar</span>
                </button>
              </div>

              <div
                onClick={() => setShowVoucherZoom(true)}
                className="w-full max-h-48 rounded-lg overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition group relative p-1"
              >
                <img
                  src={appointment.voucher_url}
                  alt="Comprobante de pago"
                  className="max-h-44 object-contain rounded group-hover:scale-102 transition duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition rounded-lg">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Clic para ver comprobante completo</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions depending on status */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {appointment.status === 'PENDING' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleStatusChange('CONFIRMED')}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Cita</span>
                </button>
              )}

              {appointment.status === 'CONFIRMED' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Sentar en Silla (Iniciar)</span>
                </button>
              )}

              {appointment.status === 'IN_PROGRESS' && (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marcar Completada</span>
                  </button>
                  <Link
                    href={`/app/${slug}/pos?appointmentId=${appointment.id}`}
                    className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cobrar en POS</span>
                  </Link>
                </>
              )}

              {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('NO_SHOW')}
                    className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
                  >
                    No asistió
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de visualización completa del comprobante */}
      {showVoucherZoom && appointment.voucher_url && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowVoucherZoom(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Cerrar vista"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-[#090A0E] border border-white/15 rounded-2xl p-2.5 overflow-hidden shadow-2xl flex flex-col items-center">
              <img
                src={appointment.voucher_url}
                alt="Comprobante en detalle"
                className="max-h-[80vh] w-auto object-contain rounded-xl"
              />
              <div className="pt-3 pb-1 text-center">
                <span className="text-xs text-neutral-400">
                  Comprobante enviado por{' '}
                  <strong className="text-white">{appointment.client?.full_name}</strong> para el turno de las{' '}
                  <strong className="text-amber-400">{startTime}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
