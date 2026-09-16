'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Calendar, Clock, Check } from 'lucide-react'
import { saveBarberSchedulesAction, type DayScheduleInput } from '@/actions/barbers'
import type { OrganizationMember, BarberSchedule } from '@/types/database.types'

interface BarberScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  member: OrganizationMember | null
  existingSchedules: BarberSchedule[]
  organizationId: string
  slug: string
}

const DAYS_OF_WEEK = [
  { day: 1, name: 'Lunes' },
  { day: 2, name: 'Martes' },
  { day: 3, name: 'Miércoles' },
  { day: 4, name: 'Jueves' },
  { day: 5, name: 'Viernes' },
  { day: 6, name: 'Sábado' },
  { day: 0, name: 'Domingo' },
]

export default function BarberScheduleModal({
  isOpen,
  onClose,
  member,
  existingSchedules,
  organizationId,
  slug,
}: BarberScheduleModalProps) {
  const [schedules, setSchedules] = useState<DayScheduleInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!member) return

    const memberSchedules = existingSchedules.filter((s) => s.member_id === member.id)

    const initial: DayScheduleInput[] = DAYS_OF_WEEK.map(({ day }) => {
      const found = memberSchedules.find((s) => s.day_of_week === day)
      if (found) {
        return {
          day_of_week: day,
          start_time: found.start_time.slice(0, 5),
          end_time: found.end_time.slice(0, 5),
          lunch_start: found.lunch_start ? found.lunch_start.slice(0, 5) : '13:00',
          lunch_end: found.lunch_end ? found.lunch_end.slice(0, 5) : '14:00',
          is_working: found.is_working,
        }
      }
      return {
        day_of_week: day,
        start_time: '09:00',
        end_time: '20:00',
        lunch_start: '13:00',
        lunch_end: '14:00',
        is_working: day !== 0, // Domingo libre por defecto
      }
    })

    setSchedules(initial)
    setError(null)
    setSaved(false)
  }, [member, existingSchedules, isOpen])

  if (!isOpen || !member) return null

  function handleScheduleChange(index: number, field: keyof DayScheduleInput, value: any) {
    setSchedules((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!member) return
    setLoading(true)
    setError(null)

    // Formatear tiempos con segundos para Postgres TIME
    const formatted = schedules.map((s) => ({
      ...s,
      start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
      end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
      lunch_start: s.lunch_start && s.lunch_start.length === 5 ? `${s.lunch_start}:00` : s.lunch_start,
      lunch_end: s.lunch_end && s.lunch_end.length === 5 ? `${s.lunch_end}:00` : s.lunch_end,
    }))

    const res = await saveBarberSchedulesAction(organizationId, member.id, formatted, slug)

    if (res?.error) {
      setError(res.error)
    } else {
      setSaved(true)
      setTimeout(() => {
        onClose()
      }, 800)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Horario de Atención: {member.nickname || member.full_name}
              </h3>
              <p className="text-xs text-neutral-400">
                Define los días laborables y horas de atención para el cálculo de disponibilidad
              </p>
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

        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {schedules.map((item, idx) => {
            const dayMeta = DAYS_OF_WEEK.find((d) => d.day === item.day_of_week)
            return (
              <div
                key={item.day_of_week}
                className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  item.is_working
                    ? 'bg-neutral-950/70 border-neutral-800'
                    : 'bg-neutral-950/30 border-neutral-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    id={`day-${item.day_of_week}`}
                    checked={item.is_working}
                    onChange={(e) => handleScheduleChange(idx, 'is_working', e.target.checked)}
                    className="rounded bg-neutral-900 border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${item.day_of_week}`}
                    className="font-semibold text-white cursor-pointer select-none"
                  >
                    {dayMeta?.name}
                  </label>
                </div>

                {item.is_working ? (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <input aria-label="input"
                        type="time"
                        value={item.start_time}
                        onChange={(e) => handleScheduleChange(idx, 'start_time', e.target.value)}
                        className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                      <span className="text-neutral-500">-</span>
                      <input aria-label="input"
                        type="time"
                        value={item.end_time}
                        onChange={(e) => handleScheduleChange(idx, 'end_time', e.target.value)}
                        className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span className="text-[11px] text-neutral-500">Refrigerio:</span>
                      <input aria-label="input"
                        type="time"
                        value={item.lunch_start || '13:00'}
                        onChange={(e) => handleScheduleChange(idx, 'lunch_start', e.target.value)}
                        className="px-1.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-amber-500 text-[11px]"
                      />
                      <span className="text-neutral-500">-</span>
                      <input aria-label="input"
                        type="time"
                        value={item.lunch_end || '14:00'}
                        onChange={(e) => handleScheduleChange(idx, 'lunch_end', e.target.value)}
                        className="px-1.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-amber-500 text-[11px]"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-neutral-500 italic text-xs">Descanso / Día no laborable</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-5">
          <span className="text-xs text-neutral-500">
            Los clientes no podrán agendar fuera de este horario.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
              <span>{saved ? 'Guardado' : 'Guardar Horario'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
