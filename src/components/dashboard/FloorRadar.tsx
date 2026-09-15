'use client'

import Link from 'next/link'
import { Scissors, ChevronRight, CreditCard, MessageCircle } from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import type { OrganizationMember } from '@/types/database.types'

export interface FloorRadarAppointment {
  id: string
  barber_id: string
  status: string
  start_time: string
  client?: { full_name: string; phone?: string } | null
  service?: { name: string; price: number; duration_minutes: number } | null
}

interface FloorRadarProps {
  barbers: OrganizationMember[]
  appointments: FloorRadarAppointment[]
  slug: string
}

export default function FloorRadar({ barbers, appointments, slug }: FloorRadarProps) {
  return (
    <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base tracking-tight">
              Radar de Sillas & Estaciones en Vivo
            </h2>
            <p className="text-xs text-neutral-400">
              Ocupación y disponibilidad del equipo en el salón ahora mismo
            </p>
          </div>
        </div>

        <Link
          href={`/app/${slug}/barberos`}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium transition inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Configurar Sillas & Horarios</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {barbers.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          No hay barberos registrados en el equipo. Registra a tu primer especialista en la sección Barberos.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {barbers.map((barber, index) => {
            // Citas de este barbero hoy
            const barberTodayApps = appointments.filter((a) => a.barber_id === barber.id)
            const currentApp = barberTodayApps.find(
              (a) =>
                (a.status || '').toUpperCase() === 'IN_PROGRESS' ||
                (a.status || '').toUpperCase() === 'EN_PROGRESO'
            )
            const nextApp = barberTodayApps.find(
              (a) =>
                (a.status || '').toUpperCase() === 'PENDING' ||
                (a.status || '').toUpperCase() === 'CONFIRMED'
            )

            const isOccupied = !!currentApp

            return (
              <div
                key={barber.id}
                className="bg-[#090A0E] border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-4 flex flex-col justify-between transition group"
              >
                <div>
                  {/* Silla header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-mono font-bold text-neutral-300 flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-white tracking-tight">
                        {barber.nickname || barber.full_name}
                      </span>
                    </div>

                    {isOccupied ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[10px] font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>EN CORTE</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>DISPONIBLE</span>
                      </span>
                    )}
                  </div>

                  {/* Contenido de la silla */}
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs space-y-1 mt-1">
                    {isOccupied && currentApp ? (
                      <>
                        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                          <span>Atendiendo a:</span>
                          <span className="font-semibold text-white truncate max-w-[140px]">
                            {currentApp.client?.full_name || 'Cliente'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Servicio:</span>
                          <span className="text-amber-400 font-medium">
                            {currentApp.service?.name}
                          </span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                          <span className="text-[10px] text-amber-400/90 font-mono font-medium animate-pulse">
                            ● En atención
                          </span>
                          <Link
                            href={`/app/${slug}/pos?appointmentId=${currentApp.id}`}
                            className="py-1 px-2 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition shadow-sm"
                            title="Cobrar servicio en el POS"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Cobrar POS</span>
                          </Link>
                        </div>
                      </>
                    ) : nextApp ? (
                      <>
                        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                          <span>Próxima cita:</span>
                          <span className="font-mono font-semibold text-neutral-200">
                            {new Date(nextApp.start_time).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Cliente:</span>
                          <span className="text-white truncate max-w-[140px]">
                            {nextApp.client?.full_name || 'Cliente'}
                          </span>
                        </div>
                        {nextApp.client?.phone ? (
                          <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400">Próximo turno</span>
                            <a
                              href={formatWhatsAppUrl(
                                nextApp.client.phone,
                                `¡Hola ${nextApp.client.full_name || ''}! Tu turno está programado para hoy a las ${new Date(nextApp.start_time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} con ${barber.nickname || barber.full_name}. ¿Confirmas tu asistencia?`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1 px-2 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition shadow-sm"
                              title="Enviar recordatorio WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-400" />
                              <span>Avisar</span>
                            </a>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="py-1 text-center text-neutral-500 text-[11px]">
                        Sin citas pendientes asignadas hoy
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer de la silla */}
                <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    {barberTodayApps.length} turno{barberTodayApps.length !== 1 ? 's' : ''} hoy
                  </span>
                  <span className="text-neutral-500 font-mono">
                    Comisión: {barber.commission_rate}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
