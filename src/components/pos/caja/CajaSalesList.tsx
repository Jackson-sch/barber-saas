import { Printer } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { SaleWithDetails } from './types'
import type { SaleReceiptData } from '../TicketReceiptModal'

interface CajaSalesListProps {
  sales: SaleWithDetails[]
  paymentLabels: Record<string, { label: string; color: string }>
  onSelectReceipt: (receipt: SaleReceiptData) => void
}

export default function CajaSalesList({ sales, paymentLabels, onSelectReceipt }: CajaSalesListProps) {
  if (sales.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-neutral-800/60 rounded-xl">
        <p className="text-xs text-neutral-500">Aún no se han registrado cobros en este turno.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
      {sales.map((s) => {
        const timeStr = new Date(s.created_at).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const badge = paymentLabels[s.payment_method] || paymentLabels.CASH

        return (
          <div key={s.id} className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-neutral-500">{timeStr}</span>
              <div>
                <p className="font-medium text-white">{s.client?.full_name || 'Cliente Casual'}</p>
                <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-bold text-white block">{formatPrice(Number(s.total))}</span>
                {Number(s.tip) > 0 && (
                  <p className="text-[10px] text-amber-400">+ Propina: {formatPrice(Number(s.tip))}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectReceipt({
                    id: s.id,
                    total: Number(s.total),
                    subtotal: Number(s.subtotal || s.total),
                    discount: Number(s.discount || 0),
                    tip: Number(s.tip || 0),
                    paymentMethod: s.payment_method || 'CASH',
                    createdAt: new Date(s.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    clientName: s.client?.full_name || 'Cliente Casual',
                    clientPhone: s.client?.phone || null,
                    items:
                      s.items && s.items.length > 0
                        ? s.items
                        : [
                            {
                              name: 'Consumo registrado',
                              quantity: 1,
                              unit_price: Number(s.total),
                              subtotal: Number(s.total),
                            },
                          ],
                  })
                }}
                className="py-1 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Ver e imprimir ticket térmico o enviar por WhatsApp"
              >
                <Printer className="w-3 h-3 text-amber-400" />
                <span>Ticket</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
