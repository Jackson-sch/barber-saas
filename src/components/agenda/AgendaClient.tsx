'use client'

import { useState, useEffect } from 'react'
import AgendaHeader from './AgendaHeader'
import AgendaMetrics from './AgendaMetrics'
import AgendaBarberTabs from './AgendaBarberTabs'
import AgendaChairsView from './AgendaChairsView'
import AgendaListView from './AgendaListView'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import NewAppointmentModal from './NewAppointmentModal'
import AppointmentDetailModal, { type AppointmentWithDetails } from './AppointmentDetailModal'
import WhatsAppReminderModal from './WhatsAppReminderModal'
import type { OrganizationMember, Service, WhatsAppNotificationSettings } from '@/types/database.types'
import { useRouter } from 'next/navigation'
import { playSalonChime } from '@/lib/sound'

interface AgendaClientProps {
  initialAppointments: AppointmentWithDetails[]
  barbers: OrganizationMember[]
  services: Service[]
  organizationId: string
  slug: string
  selectedDate: string
  organizationName?: string
  organizationAddress?: string | null
  whatsappTemplates?: WhatsAppNotificationSettings | null
}

export default function AgendaClient({
  initialAppointments,
  barbers,
  services,
  organizationId,
  slug,
  selectedDate,
  organizationName,
  organizationAddress,
  whatsappTemplates,
}: AgendaClientProps) {
  const router = useRouter()
  const [selectedBarberId, setSelectedBarberId] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'CHAIRS' | 'LIST'>('CHAIRS')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null)
  const [waAppointment, setWaAppointment] = useState<AppointmentWithDetails | null>(null)
  const [defaultBarberForNew, setDefaultBarberForNew] = useState<string | undefined>()

  // Formato legible de la fecha
  const [year, month, day] = selectedDate.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const formattedDateTitle = dateObj.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleDateChange(newDate: string) {
    router.push(`/app/${slug}/agenda?date=${newDate}`)
  }

  function handlePrevDay() {
    const prev = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000)
    const yyyy = prev.getFullYear()
    const mm = String(prev.getMonth() + 1).padStart(2, '0')
    const dd = String(prev.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  function handleNextDay() {
    const next = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000)
    const yyyy = next.getFullYear()
    const mm = String(next.getMonth() + 1).padStart(2, '0')
    const dd = String(next.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  function handleToday() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    handleDateChange(`${yyyy}-${mm}-${dd}`)
  }

  // Filtrado por barbero
  const filteredAppointments = initialAppointments.filter((app) => {
    if (selectedBarberId === 'ALL') return true
    return app.barber_id === selectedBarberId
  })

  // Métricas del día
  const totalBookings = initialAppointments.length
  const confirmedOrInProgress = initialAppointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS' || a.status === 'COMPLETED'
  ).length
  const estimatedRevenue = initialAppointments
    .filter((a) => a.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + Number(curr.total_price || 0), 0)

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    CONFIRMED: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    IN_PROGRESS: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
    COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    CANCELLED: { bg: 'bg-neutral-900', text: 'text-neutral-500', border: 'border-neutral-800' },
    NO_SHOW: { bg: 'bg-neutral-900', text: 'text-neutral-500', border: 'border-neutral-800' },
  }

  // Suscripción Realtime a Supabase
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`agenda-realtime-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            playSalonChime()
            toast.success('¡Nueva Cita Registrada!', {
              description: 'Se ha agendado una nueva cita en tiempo real.',
              duration: 5000,
            })
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Cita actualizada', {
              description: 'El estado de una cita ha sido modificado.',
              duration: 3500,
            })
          } else if (payload.eventType === 'DELETE') {
            toast.warning('Cita cancelada o eliminada de la agenda')
          }
          // Refrescar datos en el servidor
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, router])

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <AgendaHeader
        formattedDateTitle={formattedDateTitle}
        selectedDate={selectedDate}
        viewMode={viewMode}
        onDateChange={handleDateChange}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onViewModeChange={setViewMode}
        onNewAppointment={() => {
          setDefaultBarberForNew(undefined)
          setIsNewModalOpen(true)
        }}
      />

      {/* KPI Stats Strip */}
      <AgendaMetrics
        totalBookings={totalBookings}
        confirmedOrInProgress={confirmedOrInProgress}
        estimatedRevenue={estimatedRevenue}
      />

      {/* Barber Tabs */}
      <AgendaBarberTabs
        barbers={barbers}
        initialAppointments={initialAppointments}
        selectedBarberId={selectedBarberId}
        onSelectBarber={setSelectedBarberId}
      />

      {/* View: Chairs or List */}
      {viewMode === 'CHAIRS' ? (
        <AgendaChairsView
          barbers={barbers}
          selectedBarberId={selectedBarberId}
          initialAppointments={initialAppointments}
          statusColors={statusColors}
          onNewAppointment={(barberId) => {
            setDefaultBarberForNew(barberId)
            setIsNewModalOpen(true)
          }}
          onSelectAppointment={setSelectedAppointment}
          onWhatsAppNotify={setWaAppointment}
        />
      ) : (
        <AgendaListView
          filteredAppointments={filteredAppointments}
          statusColors={statusColors}
          onSelectAppointment={setSelectedAppointment}
          onWhatsAppNotify={setWaAppointment}
        />
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        selectedDate={selectedDate}
        barbers={barbers}
        services={services}
        organizationId={organizationId}
        slug={slug}
        defaultBarberId={defaultBarberForNew}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        organizationId={organizationId}
        slug={slug}
        onOpenWhatsApp={(app) => {
          setSelectedAppointment(null)
          setWaAppointment(app)
        }}
      />

      <WhatsAppReminderModal
        isOpen={!!waAppointment}
        onClose={() => setWaAppointment(null)}
        appointment={waAppointment}
        barberiaName={organizationName || slug}
        barberiaAddress={organizationAddress}
        customTemplates={whatsappTemplates}
        organizationId={organizationId}
      />
    </div>
  )
}
