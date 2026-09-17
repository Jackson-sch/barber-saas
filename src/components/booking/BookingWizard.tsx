'use client'

import React, { useState, useEffect } from 'react'
import { getLocalDateString } from '@/lib/utils'
import {
  createPublicBookingAction,
  createCulqiBookingChargeAction,
  getBarberAvailabilityAction,
  type SlotAvailability,
} from '@/actions/booking'
import type { BookingOrganization, BookingService, BookingBarber, ConfirmedBookingInfo } from './types'

import BookingStepperHeader from './BookingStepperHeader'
import StepServiceSelect from './steps/StepServiceSelect'
import StepBarberSelect from './steps/StepBarberSelect'
import StepDateTimeSelect from './steps/StepDateTimeSelect'
import StepClientDetails from './steps/StepClientDetails'
import StepConfirmation from './steps/StepConfirmation'

interface BookingWizardProps {
  organization: BookingOrganization
  services: BookingService[]
  barbers: BookingBarber[]
}

export function BookingWizard({ organization, services, barbers }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)

  // Disponibilidad de Culqi en la barbería
  const culqiAvailable = Boolean(organization.culqiSettings?.enabled && organization.culqiSettings?.public_key)
  const [paymentMode, setPaymentMode] = useState<'IN_PERSON' | 'CULQI_ONLINE'>(
    culqiAvailable ? 'CULQI_ONLINE' : 'IN_PERSON'
  )
  const [clientEmail, setClientEmail] = useState('')

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
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingInfo | null>(null)

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

  // Helper para cargar dinámicamente el SDK de Culqi v4
  async function loadCulqi(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).Culqi) {
      return
    }
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('culqi-js-v4')
      if (existing) {
        existing.addEventListener('load', () => resolve())
        return
      }
      const script = document.createElement('script')
      script.id = 'culqi-js-v4'
      script.src = 'https://checkout.culqi.com/js/v4'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('No se pudo cargar la pasarela de Culqi.'))
      document.body.appendChild(script)
    })
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedBarber || !clientName || !clientPhone) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    setLoading(true)
    setError(null)

    // Construcción precisa de la fecha y hora con offset de la barbería (-05:00 UTC)
    const bookingIso = new Date(`${selectedDate}T${selectedTime}:00-05:00`).toISOString()

    // CASO A: Pago Online con Culqi
    if (paymentMode === 'CULQI_ONLINE' && culqiAvailable) {
      if (!clientEmail || !clientEmail.includes('@')) {
        setError('Por favor ingresa un correo electrónico válido para tu comprobante de pago.')
        setLoading(false)
        return
      }

      try {
        await loadCulqi()
        const culqi = (window as any).Culqi
        if (!culqi) {
          setError('No se pudo inicializar la pasarela. Puedes optar por pagar en el salón.')
          setLoading(false)
          return
        }

        culqi.publicKey = organization.culqiSettings!.public_key
        culqi.settings({
          title: organization.name,
          currency: 'PEN',
          amount: Math.round(Number(activeService?.price || 0) * 100),
        })
        culqi.options({
          lang: 'es',
          installments: false,
          paymentMethods: {
            tarjeta: true,
            yape: true,
            billetera: false,
            bancaMovil: false,
            agente: false,
            cuotealo: false,
          },
        })

        // Configuración de respuesta de Culqi
        ;(window as any).culqi = async () => {
          if (culqi.token) {
            const tokenId = culqi.token.id
            culqi.close()
            setLoading(true)

            try {
              const res = await createCulqiBookingChargeAction({
                organizationId: organization.id,
                tokenId,
                email: clientEmail,
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
                  isPaidOnline: true,
                  chargeId: res.chargeId,
                })
                setStep(5)
                setLoading(false)
              }
            } catch {
              setError('Error al procesar el cargo con Culqi. Intenta nuevamente.')
              setLoading(false)
            }
          } else if (culqi.error) {
            setError(culqi.error.user_message || culqi.error.message || 'Error en la pasarela de pagos.')
            setLoading(false)
          }
        }

        culqi.open()
      } catch (err: any) {
        setError(err.message || 'No se pudo abrir la pasarela de pagos.')
        setLoading(false)
      }
      return
    }

    // CASO B: Pago Presencial en el Salón
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
          isPaidOnline: false,
        })
        setStep(5)
      }
    } catch {
      setError('Error al procesar la reserva. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  function handleReset() {
    setStep(1)
    setSelectedService(null)
    setSelectedBarber(null)
    setConfirmedBooking(null)
    setClientName('')
    setClientPhone('')
    setClientEmail('')
    setClientNotes('')
  }

  // Paso 5: Pantalla de confirmación con ticket
  if (step === 5 && confirmedBooking) {
    return (
      <StepConfirmation
        organization={organization}
        confirmedBooking={confirmedBooking}
        clientName={clientName}
        clientPhone={clientPhone}
        activeBarberName={activeBarber?.full_name}
        onReset={handleReset}
      />
    )
  }

  return (
    <div className="bg-[#12131A] border border-white/10 rounded-3xl p-5 sm:p-8 w-full max-w-2xl mx-auto shadow-2xl shadow-black/80 backdrop-blur-xl relative">
      {/* Stepper Header */}
      <BookingStepperHeader currentStep={step} />

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Selección de Servicio */}
      {step === 1 && (
        <StepServiceSelect
          services={services}
          selectedService={selectedService}
          onSelectService={setSelectedService}
          onContinue={() => setStep(2)}
        />
      )}

      {/* STEP 2: Selección de Especialista */}
      {step === 2 && (
        <StepBarberSelect
          barbers={barbers}
          selectedBarber={selectedBarber}
          onSelectBarber={setSelectedBarber}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {/* STEP 3: Fecha y Horario */}
      {step === 3 && (
        <StepDateTimeSelect
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          todayStr={todayStr}
          tomorrowStr={tomorrowStr}
          slotsLoading={slotsLoading}
          scheduleNotice={scheduleNotice}
          availabilitySlots={availabilitySlots}
          activeBarberName={activeBarber?.full_name}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      )}

      {/* STEP 4: Datos del Cliente */}
      {step === 4 && (
        <StepClientDetails
          clientName={clientName}
          setClientName={setClientName}
          clientPhone={clientPhone}
          setClientPhone={setClientPhone}
          clientEmail={clientEmail}
          setClientEmail={setClientEmail}
          clientNotes={clientNotes}
          setClientNotes={setClientNotes}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          culqiAvailable={culqiAvailable}
          loading={loading}
          activeServiceName={activeService?.name}
          activeServicePrice={activeService?.price}
          activeBarberName={activeBarber?.full_name}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={() => setStep(3)}
          onSubmit={handleConfirmBooking}
        />
      )}
    </div>
  )
}
