'use client'

import { useState } from 'react'
import {
  Printer,
  MessageCircle,
  X,
  Check,
  Send,
  ExternalLink,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import PrintableTicket, { type TicketItem } from './PrintableTicket'
import { formatPrice } from '@/lib/utils'
import { formatWhatsAppUrl } from '@/lib/whatsapp'

export interface SaleReceiptData {
  id: string
  total: number
  subtotal: number
  discount: number
  tip: number
  paymentMethod: string
  createdAt: string
  clientName: string
  clientPhone?: string | null
  items: TicketItem[]
  loyaltyInfo?: {
    currentPoints: number
    target: number
    isPoints: boolean
    rewardTitle: string
    justRedeemed?: boolean
  } | null
}

interface TicketReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  sale: SaleReceiptData | null
  organization: {
    name: string
    address?: string | null
    phone?: string | null
    city?: string | null
    logoUrl?: string | null
  }
  slug: string
  onNewSale?: () => void
  onViewCaja?: () => void
}

export default function TicketReceiptModal({
  isOpen,
  onClose,
  sale,
  organization,
  slug,
  onNewSale,
  onViewCaja,
}: TicketReceiptModalProps) {
  const [phoneInput, setPhoneInput] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  if (!isOpen || !sale) return null

  const effectivePhone = phoneInput.trim() || sale.clientPhone || ''
  const cleanPhone = effectivePhone.replace(/[^0-9]/g, '')

  // Armar texto estructurado para WhatsApp
  function handleSendWhatsApp() {
    if (!sale) return

    const shortId = sale.id.substring(0, 8).toUpperCase()
    const barberNames = Array.from(
      new Set(sale.items.map((it) => it.barberName).filter(Boolean))
    ).join(', ')

    const itemsText = sale.items
      .map(
        (it) =>
          `• *${it.name}* (${it.quantity}x) = S/ ${it.subtotal.toFixed(2)}${
            it.barberName ? ` _[${it.barberName}]_` : ''
          }`
      )
      .join('\n')

    const lines = [
      `💈 *${organization.name.toUpperCase()}*`,
      `🧾 *COMPROBANTE DE PAGO*`,
      `N° Ticket: #${shortId}`,
      `📅 Fecha: ${sale.createdAt}`,
      `👤 Cliente: ${sale.clientName || 'Cliente'}`,
      barberNames ? `✂️ Especialista: ${barberNames}` : '',
      `────────────────────`,
      itemsText,
      `────────────────────`,
      `Subtotal: S/ ${sale.subtotal.toFixed(2)}`,
      sale.discount > 0 ? `Descuento: -S/ ${sale.discount.toFixed(2)}` : '',
      sale.tip > 0 ? `Propina Barbero: +S/ ${sale.tip.toFixed(2)}` : '',
      `💰 *TOTAL PAGADO: S/ ${sale.total.toFixed(2)}*`,
      `💳 Medio de Pago: ${sale.paymentMethod}`,
      sale.loyaltyInfo
        ? [
            `────────────────────`,
            `⭐ *PROGRAMA DE FIDELIDAD*`,
            sale.loyaltyInfo.justRedeemed ? `🎁 *¡Premio Canjeado con éxito!*` : '',
            sale.loyaltyInfo.isPoints
              ? `Puntos acumulados: ${sale.loyaltyInfo.currentPoints}/${sale.loyaltyInfo.target}`
              : `Sellos acumulados: ${sale.loyaltyInfo.currentPoints}/${sale.loyaltyInfo.target}`,
            sale.loyaltyInfo.currentPoints < sale.loyaltyInfo.target
              ? `¡Te faltan ${sale.loyaltyInfo.target - sale.loyaltyInfo.currentPoints} para tu ${sale.loyaltyInfo.rewardTitle}!`
              : `🏆 ¡Tienes un premio listo para tu próxima visita!`,
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      `────────────────────`,
      `¡Muchas gracias por tu visita y preferencia! 🙌`,
      `Agenda tu próximo corte 24/7 aquí:`,
      `🔗 ${window.location.origin}/reservar/${slug}`,
    ]
      .filter(Boolean)
      .join('\n')

    const waUrl = effectivePhone
      ? formatWhatsAppUrl(effectivePhone, lines)
      : `https://wa.me/?text=${encodeURIComponent(lines)}`

    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Print-only CSS rules injected */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ticket,
          #printable-ticket * {
            visibility: visible !important;
          }
          #printable-ticket {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            color: black !important;
            z-index: 999999 !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      <div className="w-full max-w-2xl bg-[#0D0E15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#090A0E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">
                Comprobante & Ticket Térmico
              </h3>
              <p className="text-xs text-neutral-400">
                Ticket N° #{sale.id.substring(0, 8).toUpperCase()} • Total:{' '}
                <strong className="text-amber-400 font-mono">
                  {formatPrice(sale.total)}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns on desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Printable Ticket Preview */}
          <div className="md:col-span-6 bg-neutral-100 rounded-xl p-3 shadow-inner overflow-hidden flex justify-center">
            <div className="shadow-lg border border-neutral-300 rounded-md overflow-hidden">
              <PrintableTicket
                ticketId={sale.id}
                dateStr={sale.createdAt}
                organization={organization}
                clientName={sale.clientName}
                clientPhone={sale.clientPhone}
                items={sale.items}
                subtotal={sale.subtotal}
                discount={sale.discount}
                tip={sale.tip}
                total={sale.total}
                paymentMethod={sale.paymentMethod}
                slug={slug}
                loyaltyInfo={sale.loyaltyInfo}
              />
            </div>
          </div>

          {/* Right Column (6 cols): Actions & Delivery */}
          <div className="md:col-span-6 space-y-4">
            {/* Action 1: Print Thermal Ticket */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Printer className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
                  Impresión Térmica
                </h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Formateado para impresoras térmicas de 58mm y 80mm (USB, Bluetooth o Red).
              </p>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket Ahora</span>
              </button>
            </div>

            {/* Action 2: WhatsApp Receipt */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageCircle className="w-4 h-4" />
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-white">
                  Enviar a WhatsApp
                </h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Envía el voucher digital estructurado al celular del cliente con su enlace de re-reserva.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="field" className="text-[11px] text-neutral-400 font-medium">
                  Número de Celular (con código de país o local):
                </label>
                <input aria-label="Ej. 987654321 o +51987654321"
                  type="tel"
                  placeholder="Ej. 987654321 o +51987654321"
                  value={phoneInput || sale.clientPhone || ''}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp con Comprobante</span>
              </button>
            </div>

            {/* Modal Bottom Flow: Nueva Venta or Cerrar */}
            <div className="flex items-center gap-2 pt-2">
              {onNewSale && (
                <button
                  type="button"
                  onClick={onNewSale}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer border border-white/10 text-center"
                >
                  ⚡ Nueva Venta
                </button>
              )}

              {onViewCaja && (
                <button
                  type="button"
                  onClick={onViewCaja}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-neutral-700"
                >
                  Ver Caja
                </button>
              )}

              {!onNewSale && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer border border-white/10"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
