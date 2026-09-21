'use client'

import React from 'react'
import { CheckCircle2, Ticket, ArrowRight } from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import type { BookingOrganization, ConfirmedBookingInfo } from '../types'

interface StepConfirmationProps {
  organization: BookingOrganization
  confirmedBooking: ConfirmedBookingInfo
  clientName: string
  clientPhone: string
  activeBarberName?: string
  onReset: () => void
}

export default function StepConfirmation({
  organization,
  confirmedBooking,
  clientName,
  clientPhone,
  activeBarberName,
  onReset,
}: StepConfirmationProps) {
  const formattedDate = new Date(confirmedBooking.startTime).toLocaleDateString('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isQrPayment = confirmedBooking.paymentMethod === 'QR_WALLET'
  const waText = isQrPayment
    ? `¡Hola ${organization.name}! Acabo de reservar mi cita para *${confirmedBooking.serviceName}* el ${formattedDate} a nombre de *${clientName}*. Adjunto mi constancia de pago vía Yape/Plin${confirmedBooking.opReference ? ` (Ref: ${confirmedBooking.opReference})` : ''}. ¡Muchas gracias!`
    : `¡Hola ${organization.name}! Acabo de confirmar mi cita para *${confirmedBooking.serviceName}* el ${formattedDate} a nombre de *${clientName}*. ¡Nos vemos!`
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
        Te esperamos con puntualidad en <span className="text-white font-medium">{organization.name}</span>.
      </p>

      {/* Ticket Card */}
      <div className="my-6 rounded-2xl bg-[#090A0E] border border-white/10 p-5 text-left space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-white">
              Comprobante de Reserva
            </span>
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
            <span className="font-medium text-neutral-200">{activeBarberName}</span>
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
          {confirmedBooking.isPaidOnline ? (
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/10">
              <span className="text-emerald-400 font-semibold">Estado de Pago</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                PAGADO VÍA CULQI
              </span>
            </div>
          ) : confirmedBooking.paymentMethod === 'QR_WALLET' ? (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-semibold">Modalidad</span>
                <span className="font-mono text-emerald-400 font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  PAGO VÍA QR (YAPE / PLIN)
                </span>
              </div>
              {confirmedBooking.opReference && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">Ref / Op:</span>
                  <span className="font-mono text-neutral-200">{confirmedBooking.opReference}</span>
                </div>
              )}
              {confirmedBooking.voucherUrl && (
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-white/5">
                  <span className="text-neutral-400">Constancia:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Captura adjuntada</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/10">
              <span className="text-neutral-400">Modalidad</span>
              <span className="text-amber-400 font-medium">Pago presencial en el local</span>
            </div>
          )}
        </div>
      </div>

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg mb-3 cursor-pointer ${
            isQrPayment
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
          }`}
        >
          <span>
            {isQrPayment ? '📲 Enviar Constancia por WhatsApp' : 'Notificar por WhatsApp'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </a>
      )}

      <button
        onClick={onReset}
        className="text-xs text-neutral-400 hover:text-white transition cursor-pointer mt-2"
      >
        Agendar otra cita
      </button>
    </div>
  )
}
