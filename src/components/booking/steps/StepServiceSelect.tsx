'use client'

import React from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { formatPrice, formatMinutes } from '@/lib/utils'
import type { BookingService } from '../types'

interface StepServiceSelectProps {
  services: BookingService[]
  selectedService: string | null
  onSelectService: (id: string) => void
  onContinue: () => void
}

export default function StepServiceSelect({
  services,
  selectedService,
  onSelectService,
  onContinue,
}: StepServiceSelectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Selecciona tu Servicio</h2>
        <p className="text-xs text-neutral-400 mt-1">Elige la experiencia que buscas en esta visita</p>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {services.map((srv) => {
          const isSelected = selectedService === srv.id
          return (
            <div
              key={srv.id}
              onClick={() => onSelectService(srv.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400/80 shadow-md shadow-amber-500/5'
                  : 'bg-[#090A0E]/80 border-white/5 hover:border-white/15 text-neutral-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-white truncate">{srv.name}</h3>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                {srv.description && (
                  <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 leading-relaxed">
                    {srv.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mt-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{formatMinutes(srv.duration_minutes)}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-mono font-bold text-amber-400">
                  {formatPrice(Number(srv.price))}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!selectedService}
        onClick={onContinue}
        className="w-full mt-4 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
      >
        <span>Continuar a Especialista</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
