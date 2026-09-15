'use client'

import { useState, useEffect } from 'react'
import { formatPrice, formatMinutes, getLocalDateString } from '@/lib/utils'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import { createPublicBookingAction, getBarberAvailabilityAction, type SlotAvailability } from '@/actions/booking'
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Ticket,
  AlertCircle,
  Lock,
} from 'lucide-react'

interface BookingWizardProps {
  organization: {
    id: string
    name: string
    slug: string
    phone: string | null
    address: string | null
    city: string | null
  }
  services: Array<{
    id: string
    name: string
    description: string | null
    price: number
    duration_minutes: number
  }>
  barbers: Array<{
    id: string
    full_name: string
    nickname: string | null
    specialties: string[]
  }>
}

export function BookingWizard({ organization, services, barbers }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)

  // Fechas locales de la barbería (America/Lima UTC-5)
  const todayStr = getLocalDateString(new Date(), 'America/Lima')
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrowDate, 'America/Lima')

  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedTime, setSelectedTime] = useState<string>('10:00')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<{
    serviceName: string
    startTime: string
  } | null>(null)

  // Disponibilidad dinámica de turnos
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availabilitySlots, setAvailabilitySlots] = useState<SlotAvailability[]>([])
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null)

  const activeService = services.find((s) => s.id === selectedService)
  const activeBarber = barbers.find((b) => b.id === selectedBarber)

  // Cargar disponibilidad en tiempo real cuando cambia el barbero o la fecha
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return

    let isMounted = true
    async function fetchAvailability() {
      setSlotsLoading(true)
      setScheduleNotice(null)
      try {
        const res = await getBarberAvailabilityAction({
          organizationId: organization.id,
          barberId: selectedBarber!,
          date: selectedDate,
          durationMinutes: activeService?.duration_minutes || 35,
        })

        if (!isMounted) return

        if (!res.isWorking) {
          setAvailabilitySlots([])
          setScheduleNotice(res.message || 'El especialista no atiende en esta fecha.')
          setSelectedTime('')
        } else {
          setAvailabilitySlots(res.slots)
          // Si el horario seleccionado actualmente no está disponible, seleccionar el primero disponible
          const currentIsAvailable = res.slots.some((s) => s.time === selectedTime && s.available)
          if (!currentIsAvailable) {
            const firstAvailable = res.slots.find((s) => s.available)
            setSelectedTime(firstAvailable ? firstAvailable.time : '')
          }
        }
      } catch (err) {
        console.error('Error al consultar disponibilidad:', err)
      } finally {
        if (isMounted) setSlotsLoading(false)
      }
    }

    fetchAvailability()
    return () => {
      isMounted = false
    }
  }, [selectedBarber, selectedDate, activeService?.duration_minutes, organization.id])

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedBarber || !clientName || !clientPhone) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    setLoading(true)
    setError(null)

    // Construcción precisa de la fecha y hora con offset de la barbería (-05:00 UTC)
    // para evitar el desfase de día de new Date("YYYY-MM-DD")
    const bookingIso = new Date(`${selectedDate}T${selectedTime}:00-05:00`).toISOString()

    try {
      const res = await createPublicBookingAction({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        clientName,
        clientPhone,
        serviceId: selectedService,
        barberId: selectedBarber,
        startTime: bookingIso,
        notes: clientNotes,
      })

      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else if (res?.success) {
        setConfirmedBooking({
          serviceName: res.serviceName || activeService?.name || 'Servicio',
          startTime: res.startTime || bookingIso,
        })
        setStep(5)
      }
    } catch {
      setError('Error al procesar la reserva. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  // Paso 5: Confirmación completada - Luxury Ticket Receipt
  if (step === 5 && confirmedBooking) {
    const formattedDate = new Date(confirmedBooking.startTime).toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })

    const waText = `¡Hola ${organization.name}! Acabo de confirmar mi cita para *${confirmedBooking.serviceName}* el ${formattedDate} a nombre de *${clientName}*. ¡Nos vemos!`
    const waUrl = organization.phone ? formatWhatsAppUrl(organization.phone, waText) : ''

    return (
      <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-8 text-center w-full max-w-2xl mx-auto shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="inline-block text-[11px] font-mono tracking-widest uppercase text-amber-400 mb-1">
          Cita Confirmada
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">¡Tu Lugar está Asegurado!</h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-sm mx-auto">
          Te esperamos en <span className="text-white font-medium">{organization.name}</span> para brindarte el mejor corte y experiencia.
        </p>

        {/* Digital Ticket */}
        <div className="my-6 rounded-2xl bg-[#090A0E] border border-white/10 p-5 text-left relative shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-white/15 mb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-medium text-neutral-300">TICKET DE ATENCIÓN</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Reserva Inmediata</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Servicio</span>
              <span className="font-semibold text-white">{confirmedBooking.serviceName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Especialista</span>
              <span className="font-medium text-neutral-200">{activeBarber?.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Fecha & Hora</span>
              <span className="font-mono font-semibold text-amber-400 capitalize">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Cliente</span>
              <span className="font-medium text-white">{clientName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Contacto</span>
              <span className="font-mono text-neutral-300">{clientPhone}</span>
            </div>
          </div>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 mb-3 cursor-pointer"
          >
            <span>Notificar por WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => {
            setStep(1)
            setSelectedService(null)
            setSelectedBarber(null)
            setConfirmedBooking(null)
            setClientName('')
            setClientPhone('')
            setClientNotes('')
          }}
          className="text-xs text-neutral-400 hover:text-white transition cursor-pointer mt-2"
        >
          Agendar otra cita
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#12131A] border border-white/10 rounded-3xl p-5 sm:p-8 w-full max-w-2xl mx-auto shadow-2xl shadow-black/80 backdrop-blur-xl relative">
      {/* Stepper Header */}
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 1, label: 'Servicio' },
            { id: 2, label: 'Especialista' },
            { id: 3, label: 'Horario' },
            { id: 4, label: 'Datos' },
          ].map((item) => {
            const isCurrent = step === item.id
            const isCompleted = step > item.id
            return (
              <div key={item.id} className="text-center">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 mb-2 ${
                    isCurrent
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : isCompleted
                      ? 'bg-amber-500/40'
                      : 'bg-white/10'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium transition ${
                    isCurrent ? 'text-amber-400 font-semibold' : isCompleted ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Seleccionar Servicio */}
      {step === 1 && (
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
                  onClick={() => setSelectedService(srv.id)}
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
            onClick={() => setStep(2)}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <span>Continuar a Especialista</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Seleccionar Barbero */}
      {step === 2 && (
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
                  onClick={() => setSelectedBarber(barber.id)}
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
              onClick={() => setStep(1)}
              className="py-3 px-4 rounded-xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!selectedBarber}
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <span>Continuar a Horario</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Fecha y Horario */}
      {step === 3 && (
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
              <input
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
                Selecciona otra fecha para consultar los turnos disponibles de {activeBarber?.full_name}.
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
              onClick={() => setStep(2)}
              className="py-3 px-4 rounded-xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => setStep(4)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <span>Continuar a Datos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Datos del Cliente + Luxury Ticket Preview */}
      {step === 4 && (
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Tus Datos de Reserva</h2>
            <p className="text-xs text-neutral-400 mt-1">Ingresa tus datos para registrar y recordarte tu cita</p>
          </div>

          {/* Ticket preview */}
          <div className="rounded-xl bg-[#090A0E] border border-white/10 p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Servicio:</span>
              <span className="text-white font-medium">{activeService?.name}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Especialista:</span>
              <span className="text-white font-medium">{activeBarber?.full_name}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Fecha & Horario:</span>
              <span className="text-amber-400 font-mono font-medium">{selectedDate} - {selectedTime}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 pt-1.5 border-t border-dashed border-white/10">
              <span>Importe Estimado:</span>
              <span className="text-amber-400 font-mono font-bold text-sm">
                {formatPrice(Number(activeService?.price || 0))}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Nombre Completo</label>
            <input
              type="text"
              required
              placeholder="Ej: Rodrigo Valenzuela"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">WhatsApp / Celular</label>
            <input
              type="tel"
              required
              placeholder="+51 987 654 321"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Notas adicionales (opcional)
            </label>
            <input
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
              onClick={() => setStep(3)}
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
      )}
    </div>
  )
}
