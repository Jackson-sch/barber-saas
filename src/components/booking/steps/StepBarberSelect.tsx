'use client'

import React from 'react'
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { BookingBarber } from '../types'

interface StepBarberSelectProps {
  barbers: BookingBarber[]
  selectedBarber: string | null
  onSelectBarber: (id: string) => void
  onBack: () => void
  onContinue: () => void
}

export default function StepBarberSelect({
  barbers,
  selectedBarber,
  onSelectBarber,
  onBack,
  onContinue,
}: StepBarberSelectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Elige a tu Especialista</h2>
        <p className="text-xs text-neutral-400 mt-1">Selecciona el barbero que atenderá tu servicio</p>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {barbers.map((barber) => {
          const isSelected = selectedBarber === barber.id
          return (
            <div
              key={barber.id}
              onClick={() => onSelectBarber(barber.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-400/80 shadow-md shadow-amber-500/5'
                  : 'bg-[#090A0E]/80 border-white/5 hover:border-white/15 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-amber-400 font-bold text-base shadow-sm">
                  {barber.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">{barber.full_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {barber.nickname && (
                      <span className="text-xs text-amber-400/90 font-mono">
                        &quot;{barber.nickname}&quot;
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Disponible
                    </span>
                  </div>
                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {barber.specialties.slice(0, 3).map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
            </div>
          )
        })}
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
          type="button"
          disabled={!selectedBarber}
          onClick={onContinue}
          className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <span>Continuar a Horario</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
