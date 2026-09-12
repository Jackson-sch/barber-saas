'use client'

import { useState, useEffect } from 'react'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import type {
  Organization,
  OrganizationMember,
  CashShift,
  Product,
  Appointment,
} from '@/types/database.types'
import DashboardHeader from './DashboardHeader'
import DashboardKpiCards, { type DashboardSaleSummary } from './DashboardKpiCards'
import FloorRadar from './FloorRadar'
import AppointmentsTimeline, { type AppointmentFilter } from './AppointmentsTimeline'
import DashboardSidebarWidgets from './DashboardSidebarWidgets'

export interface DashboardAppointment extends Appointment {
  client?: { full_name: string; phone: string } | null
  barber?: { id: string; full_name: string; nickname: string | null; avatar_url: string | null } | null
  service?: { name: string; price: number; duration_minutes: number } | null
}

export type { DashboardSaleSummary }

interface DashboardClientProps {
  org: Organization & { subscription?: any }
  slug: string
  appointments: DashboardAppointment[]
  salesSummary: DashboardSaleSummary
  clientsCount: number
  barbers: OrganizationMember[]
  currentShift: CashShift | null
  criticalProducts: Product[]
}

export default function DashboardClient({
  org,
  slug,
  appointments,
  salesSummary,
  clientsCount,
  barbers,
  currentShift,
  criticalProducts,
}: DashboardClientProps) {
  const [filter, setFilter] = useState<AppointmentFilter>('ALL')
  const [copiedLink, setCopiedLink] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDateStr, setCurrentDateStr] = useState<string>('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Reloj local en vivo
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      )
      setCurrentDateStr(
        now.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Copiar link de reservas
  async function handleCopyPortalLink() {
    const fullUrl = `${window.location.origin}/reservar/${slug}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedLink(true)
      addToast('success', 'Enlace copiado al portapapeles. ¡Listo para compartir!')
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      addToast('error', 'No se pudo copiar el enlace automáticamente.')
    }
  }

  // Filtrado de citas
  const filteredAppointments = appointments.filter((app) => {
    const st = (app.status || '').toUpperCase()
    if (filter === 'PENDING') return st === 'PENDING' || st === 'CONFIRMED' || st === 'PENDIENTE'
    if (filter === 'IN_PROGRESS') return st === 'IN_PROGRESS' || st === 'EN_PROGRESO'
    if (filter === 'COMPLETED') return st === 'COMPLETED' || st === 'COMPLETADA'
    return true
  })

  // Métricas derivadas
  const completedAppointments = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'COMPLETED' || (a.status || '').toUpperCase() === 'COMPLETADA'
  ).length
  const inProgressAppointments = appointments.filter(
    (a) => (a.status || '').toUpperCase() === 'IN_PROGRESS' || (a.status || '').toUpperCase() === 'EN_PROGRESO'
  ).length
  const pendingAppointments = appointments.length - completedAppointments - inProgressAppointments

  // Ticket promedio
  const averageTicket = salesSummary.count > 0 ? salesSummary.total / salesSummary.count : 0

  return (
    <div className="space-y-8">
      {/* 1. Header Operativo */}
      <DashboardHeader
        orgName={org.name}
        planTier={org.subscription?.plan_tier}
        slug={slug}
        currentTime={currentTime}
        currentDateStr={currentDateStr}
        copiedLink={copiedLink}
        onCopyLink={handleCopyPortalLink}
      />

      {/* 2. Executive KPI Matrix */}
      <DashboardKpiCards
        salesSummary={salesSummary}
        averageTicket={averageTicket}
        appointmentsCount={appointments.length}
        completedAppointments={completedAppointments}
        pendingAppointments={pendingAppointments}
        currentShift={currentShift}
        criticalProducts={criticalProducts}
        barbersCount={barbers.length}
        clientsCount={clientsCount}
        slug={slug}
      />

      {/* 3. Radar de Sillas de Trabajo en Vivo */}
      <FloorRadar barbers={barbers} appointments={appointments} slug={slug} />

      {/* 4. Layout 2 Columnas: Timeline de Citas + Widgets Laterales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <AppointmentsTimeline
          totalCount={appointments.length}
          filteredAppointments={filteredAppointments}
          filter={filter}
          onFilterChange={setFilter}
          orgName={org.name}
          slug={slug}
          pendingCount={pendingAppointments}
          completedCount={completedAppointments}
        />

        <DashboardSidebarWidgets
          slug={slug}
          copiedLink={copiedLink}
          onCopyLink={handleCopyPortalLink}
        />
      </div>

      {/* Toasts de Feedback */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
