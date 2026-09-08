'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Scissors, UserCheck, Phone, User, Clock } from 'lucide-react'
import { createAppointmentAction } from '@/actions/agenda'
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

  if (!isOpen) return null

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
      // Reset
      setClientName('')
      setClientPhone('')
      setClientEmail('')
      setNotes('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Agendar Nueva Cita</h3>
              <p className="text-xs text-neutral-400">Registra un cliente presencial o por teléfono</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Datos del Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="999888777"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Barbero & Servicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Barbero / Especialista *
              </label>
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nickname ? `${b.nickname} (${b.full_name})` : b.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Servicio *
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - S/ {s.price} ({s.duration_minutes}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha, Hora y Canal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Canal de Entrada
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                <option value="WALK_IN">Presencial (En local)</option>
                <option value="PHONE">Llamada Telefónica</option>
                <option value="WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Notas o Preferencias (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Viene por primera vez, corte bajo, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirmar Cita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
