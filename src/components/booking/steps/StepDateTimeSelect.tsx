'use client'

import React from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lock,
  Sun,
  Moon,
} from 'lucide-react'
import type { SlotAvailability } from '@/actions/booking'

interface StepDateTimeSelectProps {
  selectedDate: string
  setSelectedDate: (d: string) => void
  selectedTime: string
  setSelectedTime: (t: string) => void
  todayStr: string
  tomorrowStr: string
  slotsLoading: boolean
  scheduleNotice: string | null
  availabilitySlots: SlotAvailability[]
  activeBarberName?: string
  onBack: () => void
  onContinue: () => void
}

export default function StepDateTimeSelect({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  todayStr,
  tomorrowStr,
  slotsLoading,
  scheduleNotice,
  availabilitySlots,
  activeBarberName,
  onBack,
  onContinue,
}: StepDateTimeSelectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Fecha y Horario</h2>
        <p className="text-xs text-neutral-400 mt-1">Selecciona el día y el turno más conveniente</p>
      </div>

      {/* Quick date selector chips */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedDate(todayStr)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer border ${
            selectedDate === todayStr
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
              : 'bg-[#090A0E] border-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => setSelectedDate(tomorrowStr)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer border ${
            selectedDate === tomorrowStr
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
              : 'bg-[#090A0E] border-white/5 text-neutral-400 hover:text-white'
          }`}
        >
          Mañana
        </button>
        <div className="relative flex-1">
          <input aria-label="input"
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full py-2 px-2.5 rounded-lg bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Dynamic Slots View */}
      {slotsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-[#090A0E]/60 rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-xs text-neutral-300 font-medium">Consultando agenda del especialista...</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Verificando turnos libres y citas en tiempo real</p>
        </div>
      ) : scheduleNotice ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-white">Especialista no disponible</p>
            <p className="text-neutral-400 mt-0.5">{scheduleNotice}</p>
          </div>
        </div>
      ) : availabilitySlots.length === 0 ? (
        <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
          <Lock className="w-6 h-6 text-neutral-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No hay turnos disponibles</p>
          <p className="text-xs text-neutral-400">
            Selecciona otra fecha para consultar los turnos disponibles {activeBarberName ? `de ${activeBarberName}` : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mañana */}
          {availabilitySlots.filter((s) => s.time < '13:00').length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Turno Mañana</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availabilitySlots
                  .filter((s) => s.time < '13:00')
                  .map((slot) => {
                    const isSelected = selectedTime === slot.time
                    const isAvail = slot.available

                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!isAvail}
                        onClick={() => setSelectedTime(slot.time)}
                        title={
                          slot.reason === 'BOOKED'
                            ? 'Horario ya reservado'
                            : slot.reason === 'LUNCH'
                            ? 'Horario de refrigerio'
                            : slot.reason === 'PAST'
                            ? 'Horario pasado'
                            : 'Disponible'
                        }
                        className={`py-2 px-1 rounded-lg text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-0.5 border ${
                          !isAvail
                            ? 'bg-neutral-900/40 border-white/[0.04] text-neutral-600 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-sm shadow-amber-400/20 cursor-pointer'
                            : 'bg-[#090A0E] border-white/5 text-neutral-300 hover:border-amber-400/50 hover:text-white cursor-pointer'
                        }`}
                      >
                        <span>{slot.time}</span>
                        {!isAvail && (
                          <span className="text-[9px] no-underline font-sans uppercase tracking-tight text-neutral-500">
                            {slot.reason === 'BOOKED'
                              ? 'Ocupado'
                              : slot.reason === 'LUNCH'
                              ? 'Descanso'
                              : 'Pasado'}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Tarde */}
          {availabilitySlots.filter((s) => s.time >= '13:00').length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2 font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Turno Tarde / Noche</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {availabilitySlots
                  .filter((s) => s.time >= '13:00')
                  .map((slot) => {
                    const isSelected = selectedTime === slot.time
                    const isAvail = slot.available

                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!isAvail}
                        onClick={() => setSelectedTime(slot.time)}
                        title={
                          slot.reason === 'BOOKED'
                            ? 'Horario ya reservado'
                            : slot.reason === 'LUNCH'
                            ? 'Horario de refrigerio'
                            : slot.reason === 'PAST'
                            ? 'Horario pasado'
                            : 'Disponible'
                        }
                        className={`py-2 px-1 rounded-lg text-xs font-mono font-medium transition flex flex-col items-center justify-center gap-0.5 border ${
                          !isAvail
                            ? 'bg-neutral-900/40 border-white/[0.04] text-neutral-600 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-sm shadow-amber-400/20 cursor-pointer'
                            : 'bg-[#090A0E] border-white/5 text-neutral-300 hover:border-amber-400/50 hover:text-white cursor-pointer'
                        }`}
                      >
                        <span>{slot.time}</span>
                        {!isAvail && (
                          <span className="text-[9px] no-underline font-sans uppercase tracking-tight text-neutral-500">
                            {slot.reason === 'BOOKED'
                              ? 'Ocupado'
                              : slot.reason === 'LUNCH'
                              ? 'Descanso'
                              : 'Pasado'}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}

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
          disabled={!selectedTime}
          onClick={onContinue}
          className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <span>Continuar a Datos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
