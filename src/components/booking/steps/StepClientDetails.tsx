'use client'

import React from 'react'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface StepClientDetailsProps {
  clientName: string
  setClientName: (v: string) => void
  clientPhone: string
  setClientPhone: (v: string) => void
  clientNotes: string
  setClientNotes: (v: string) => void
  loading: boolean
  activeServiceName?: string
  activeServicePrice?: number
  activeBarberName?: string
  selectedDate: string
  selectedTime: string
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function StepClientDetails({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientNotes,
  setClientNotes,
  loading,
  activeServiceName,
  activeServicePrice,
  activeBarberName,
  selectedDate,
  selectedTime,
  onBack,
  onSubmit,
}: StepClientDetailsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Tus Datos de Reserva</h2>
        <p className="text-xs text-neutral-400 mt-1">Ingresa tus datos para registrar y recordarte tu cita</p>
      </div>

      {/* Ticket preview */}
      <div className="rounded-xl bg-[#090A0E] border border-white/10 p-3.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-neutral-400">
          <span>Servicio:</span>
          <span className="text-white font-medium">{activeServiceName}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400">
          <span>Especialista:</span>
          <span className="text-white font-medium">{activeBarberName}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400">
          <span>Fecha & Horario:</span>
          <span className="text-amber-400 font-mono font-medium">
            {selectedDate} - {selectedTime}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 pt-1.5 border-t border-dashed border-white/10">
          <span>Importe Estimado:</span>
          <span className="text-amber-400 font-mono font-bold text-sm">
            {formatPrice(Number(activeServicePrice || 0))}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">Nombre Completo</label>
        <input aria-label="Ej: Rodrigo Valenzuela"
          type="text"
          required
          placeholder="Ej: Rodrigo Valenzuela"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div>
        <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">WhatsApp / Celular</label>
        <input aria-label="+51 987 654 321"
          type="tel"
          required
          placeholder="+51 987 654 321"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div>
        <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
          Notas adicionales (opcional)
        </label>
        <input aria-label="Ej: Preferencia de corte o barba..."
          type="text"
          placeholder="Ej: Preferencia de corte o barba..."
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 rounded-xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmando Cita...</span>
            </>
          ) : (
            <>
              <span>Confirmar Reserva</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
