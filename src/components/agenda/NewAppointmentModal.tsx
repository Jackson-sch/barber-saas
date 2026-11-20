'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Loader2,
  Calendar,
  Scissors,
  Phone,
  User,
  Clock,
  Store,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Check,
} from 'lucide-react'
import { createAppointmentAction } from '@/actions/agenda'
import { searchGlobalClientsAction } from '@/actions/clients'
import { formatPrice, formatMinutes } from '@/lib/utils'
import type { OrganizationMember, Service } from '@/types/database.types'

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: string
  barbers: OrganizationMember[]
  services: Service[]
  organizationId: string
  slug: string
  defaultBarberId?: string
}

const SOURCE_OPTIONS = [
  { id: 'WALK_IN' as const, label: 'Presencial (En local)', icon: Store },
  { id: 'WHATSAPP' as const, label: 'WhatsApp', icon: MessageCircle },
  { id: 'PHONE' as const, label: 'Llamada Telefónica', icon: PhoneCall },
]

export default function NewAppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  barbers,
  services,
  organizationId,
  slug,
  defaultBarberId,
}: NewAppointmentModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [barberId, setBarberId] = useState(defaultBarberId || barbers[0]?.id || '')
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [date, setDate] = useState(selectedDate)
  const [time, setTime] = useState('10:00')
  const [source, setSource] = useState<'WALK_IN' | 'PHONE' | 'WHATSAPP'>('WALK_IN')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sugerencias de clientes existentes al escribir nombre o teléfono
  const [clientSuggestions, setClientSuggestions] = useState<
    Array<{ id: string; full_name: string; phone: string; total_visits: number }>
  >([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Sincronizar fecha y barbero por defecto cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDate(selectedDate)
      setBarberId(defaultBarberId || barbers[0]?.id || '')
      if (!serviceId && services[0]?.id) {
        setServiceId(services[0].id)
      }
      setError(null)
    }
  }, [isOpen, selectedDate, defaultBarberId, barbers, services, serviceId])

  // Buscar coincidencias de clientes existentes
  useEffect(() => {
    if (!isOpen) return
    const q = clientName.trim().length >= 2 ? clientName.trim() : clientPhone.trim()
    if (q.length < 2) {
      setClientSuggestions([])
      return
    }

    let mounted = true
    const timer = setTimeout(async () => {
      const res = await searchGlobalClientsAction(organizationId, q)
      if (mounted && res.clients) {
        setClientSuggestions(res.clients.slice(0, 5))
      }
    }, 220)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [clientName, clientPhone, organizationId, isOpen])

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || services[0],
    [services, serviceId]
  )

  // Calcular hora estimada de finalización
  const estimatedEndTime = useMemo(() => {
    if (!time || !selectedService) return null
    const [h, m] = time.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return null
    const totalMinutes = h * 60 + m + (selectedService.duration_minutes || 30)
    const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')
    const endM = String(totalMinutes % 60).padStart(2, '0')
    return `${endH}:${endM}`
  }, [time, selectedService])

  if (!isOpen) return null

  function handleSelectSuggestion(c: { full_name: string; phone: string }) {
    setClientName(c.full_name)
    setClientPhone(c.phone)
    setShowSuggestions(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await createAppointmentAction({
      organization_id: organizationId,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || null,
      barber_id: barberId,
      service_id: serviceId,
      date,
      time,
      source,
      notes: notes || null,
      slug,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
      setClientName('')
      setClientPhone('')
      setClientEmail('')
      setNotes('')
      setShowSuggestions(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">Agendar Nueva Cita</h3>
              <p className="text-xs text-neutral-400">
                Registra un turno presencial, por WhatsApp o llamada telefónica
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Datos del Cliente con Autocompletado */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="new_app_client_name"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Nombre del Cliente *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="new_app_client_name"
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={clientName}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setClientName(e.target.value)
                      setShowSuggestions(true)
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="new_app_client_phone"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="new_app_client_phone"
                    type="tel"
                    required
                    placeholder="Ej: 999 888 777"
                    value={clientPhone}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setClientPhone(e.target.value)
                      setShowSuggestions(true)
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Sugerencias rápidas si el cliente ya está registrado en el CRM */}
            {showSuggestions && clientSuggestions.length > 0 && (
              <div className="mt-2 p-2 rounded-xl bg-[#090A0E] border border-amber-500/30 shadow-xl space-y-1">
                <div className="flex items-center justify-between px-2 py-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Clientes registrados encontrados (clic para autocompletar)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    Ocultar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {clientSuggestions.map((c) => {
                    const isExact = c.full_name === clientName && c.phone === clientPhone
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(c)}
                        className={`px-3 py-1.5 rounded-lg text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer border ${
                          isExact
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : 'bg-[#12141E] hover:bg-white/[0.06] border-white/[0.06] text-neutral-200'
                        }`}
                      >
                        <span className="font-semibold truncate">{c.full_name}</span>
                        <span className="font-mono text-[11px] text-neutral-400 shrink-0 flex items-center gap-1">
                          {c.phone}
                          {isExact && <Check className="w-3 h-3 text-amber-400" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Barbero & Servicio (con ancho suficiente para mostrar nombre y precio completos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new_app_barber"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Barbero / Especialista *
              </label>
              <select
                id="new_app_barber"
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nickname ? `${b.nickname} — ${b.full_name}` : b.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="new_app_service"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Servicio a Realizar *
              </label>
              <select
                id="new_app_service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(Number(s.price))} ({s.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Fecha y Hora de Inicio (2 columnas amplias + resumen del turno) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new_app_date"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Fecha de la Cita *
              </label>
              <input
                id="new_app_date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="new_app_time"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                >
                  Hora de Inicio *
                </label>
                {estimatedEndTime && (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Fin aprox: {estimatedEndTime}
                  </span>
                )}
              </div>
              <input
                id="new_app_time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* 4. Canal de Entrada (Botones seleccionables en 3 columnas sin texto cortado) */}
          <div>
            <span className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Canal de Entrada
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SOURCE_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = source === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSource(opt.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-[#090A0E] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 5. Notas o Preferencias */}
          <div>
            <label
              htmlFor="new_app_notes"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Notas o Preferencias (Opcional)
            </label>
            <input
              id="new_app_notes"
              type="text"
              placeholder="Ej: Viene por primera vez, degradado medio, toalla caliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Resumen rápido del servicio + Botones de acción */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {selectedService ? (
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">
                    {selectedService.name} ({formatMinutes(selectedService.duration_minutes)})
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                    Importe: {formatPrice(Number(selectedService.price))}
                  </span>
                </div>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmar Cita</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
