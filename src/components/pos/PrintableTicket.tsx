'use client'

import { forwardRef } from 'react'
import { formatPrice } from '@/lib/utils'

export interface TicketItem {
  name: string
  quantity: number
  unit_price: number
  subtotal: number
  barberName?: string | null
}

export interface PrintableTicketProps {
  ticketId: string
  dateStr: string
  organization: {
    name: string
    address?: string | null
    phone?: string | null
    city?: string | null
  }
  clientName: string
  clientPhone?: string | null
  items: TicketItem[]
  subtotal: number
  discount: number
  tip: number
  total: number
  paymentMethod: string
  slug: string
  loyaltyInfo?: {
    currentPoints: number
    target: number
    isPoints: boolean
    rewardTitle: string
    justRedeemed?: boolean
  } | null
}

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  CARD: 'Tarjeta de Débito/Crédito',
  TRANSFER: 'Transferencia Bancaria',
}

const PrintableTicket = forwardRef<HTMLDivElement, PrintableTicketProps>(
  (
    {
      ticketId,
      dateStr,
      organization,
      clientName,
      clientPhone,
      items,
      subtotal,
      discount,
      tip,
      total,
      paymentMethod,
      slug,
      loyaltyInfo,
    },
    ref
  ) => {
    const paymentLabel = paymentMethodLabels[paymentMethod] || paymentMethod
    const shortTicketId = ticketId ? ticketId.substring(0, 8).toUpperCase() : '00000000'

    // Obtener nombres únicos de barberos que participaron en el ticket
    const barberNames = Array.from(
      new Set(items.map((it) => it.barberName).filter(Boolean))
    ).join(', ')

    return (
      <div
        id="printable-ticket"
        ref={ref}
        className="w-full max-w-[340px] mx-auto bg-white text-black p-5 font-mono text-[11px] leading-tight select-all print:max-w-none print:w-[80mm] print:p-2 print:m-0 print:text-[11px]"
      >
        {/* Cabecera del Salón */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-neutral-400">
          <h2 className="text-base font-bold tracking-tight uppercase">
            {organization.name}
          </h2>
          {organization.address && (
            <p className="text-[10px] text-neutral-700">{organization.address}</p>
          )}
          {organization.city && (
            <p className="text-[10px] text-neutral-700">{organization.city}</p>
          )}
          {organization.phone && (
            <p className="text-[10px] text-neutral-700">Tel: {organization.phone}</p>
          )}
        </div>

        {/* Datos del Ticket */}
        <div className="py-2.5 space-y-1 text-[10px] border-b border-dashed border-neutral-400">
          <div className="flex justify-between">
            <span className="font-bold">TICKET N°:</span>
            <span>#{shortTicketId}</span>
          </div>
          <div className="flex justify-between">
            <span>FECHA / HORA:</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between">
            <span>CLIENTE:</span>
            <span className="font-bold truncate max-w-[170px] text-right">
              {clientName || 'Cliente Casual'}
            </span>
          </div>
          {clientPhone && (
            <div className="flex justify-between">
              <span>TELÉFONO:</span>
              <span>{clientPhone}</span>
            </div>
          )}
          {barberNames && (
            <div className="flex justify-between">
              <span>ATENDIDO POR:</span>
              <span className="font-bold truncate max-w-[170px] text-right">
                {barberNames}
              </span>
            </div>
          )}
        </div>

        {/* Tabla de Ítems */}
        <div className="py-2.5 border-b border-dashed border-neutral-400">
          <div className="flex justify-between text-[10px] font-bold pb-1.5 border-b border-neutral-300">
            <span>DESCRIPCIÓN</span>
            <span>TOTAL</span>
          </div>

          <div className="pt-2 space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-right shrink-0">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-neutral-600 pl-4">
                  <span>P. Unit: {formatPrice(item.unit_price)}</span>
                  {item.barberName && <span>({item.barberName})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales y Métodos de Pago */}
        <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-neutral-400">
          <div className="flex justify-between text-neutral-700">
            <span>SUBTOTAL:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>DESCUENTO:</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          {tip > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>PROPINA:</span>
              <span>+{formatPrice(tip)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-1.5 text-sm font-extrabold border-t border-neutral-400">
            <span>TOTAL A PAGAR:</span>
            <span className="text-base">{formatPrice(total)}</span>
          </div>

          <div className="flex justify-between text-[10px] pt-1 text-neutral-700">
            <span>MEDIO DE PAGO:</span>
            <span className="font-bold uppercase">{paymentLabel}</span>
          </div>
        </div>

        {/* Sección de Fidelización en Ticket */}
        {loyaltyInfo && (
          <div className="py-2.5 text-center space-y-1 border-b border-dashed border-neutral-400">
            <p className="font-bold text-[10px] tracking-wider uppercase">⭐ PROGRAMA DE FIDELIDAD ⭐</p>
            {loyaltyInfo.justRedeemed && (
              <p className="font-bold text-[10px] text-black">
                ¡PREMIO CANJEADO EN ESTA COMPRA!
              </p>
            )}
            <p className="text-[10px]">
              {loyaltyInfo.isPoints
                ? `Puntos acumulados: ${loyaltyInfo.currentPoints} pts (Meta: ${loyaltyInfo.target})`
                : `Sellos acumulados: ${loyaltyInfo.currentPoints} de ${loyaltyInfo.target}`}
            </p>
            {loyaltyInfo.currentPoints < loyaltyInfo.target ? (
              <p className="text-[9px] text-neutral-600">
                {loyaltyInfo.isPoints
                  ? `¡Faltan ${loyaltyInfo.target - loyaltyInfo.currentPoints} pts para tu próximo descuento!`
                  : `¡Te faltan ${loyaltyInfo.target - loyaltyInfo.currentPoints} visitas para tu ${loyaltyInfo.rewardTitle}!`}
              </p>
            ) : (
              <p className="text-[9px] font-bold text-neutral-800">
                ¡Tienes un premio listo para tu próxima visita!
              </p>
            )}
          </div>
        )}

        {/* Pie de Página / Agradecimiento */}
        <div className="pt-3 text-center space-y-1 text-[10px] text-neutral-700">
          <p className="font-bold uppercase">¡Gracias por tu preferencia!</p>
          <p className="text-[9px]">Conserva este comprobante para tu control.</p>
          <div className="pt-2">
            <p className="text-[9px] text-neutral-500">Reserva tu próximo corte en:</p>
            <p className="font-bold text-neutral-800 text-[10px]">
              /reservar/{slug}
            </p>
          </div>
        </div>
      </div>
    )
  }
)

PrintableTicket.displayName = 'PrintableTicket'

export default PrintableTicket
