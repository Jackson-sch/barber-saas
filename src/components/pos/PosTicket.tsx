'use client'

import {
  CreditCard,
  Scissors,
  Package,
  Plus,
  Minus,
  Trash2,
  Lock,
  Loader2,
  Award,
  Gift,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CartItemInput } from '@/actions/pos'
import type { OrganizationMember, Client, CashShift, LoyaltyProgramSettings } from '@/types/database.types'

export type PaymentMethodType = 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER'

interface PosTicketProps {
  cart: CartItemInput[]
  barbers: OrganizationMember[]
  clients: Client[]
  clientType: 'WALK_IN' | 'EXISTING'
  setClientType: (type: 'WALK_IN' | 'EXISTING') => void
  selectedClientId: string
  setSelectedClientId: (id: string) => void
  clientName: string
  setClientName: (name: string) => void
  clientPhone: string
  setClientPhone: (phone: string) => void
  paymentMethod: PaymentMethodType
  setPaymentMethod: (m: PaymentMethodType) => void
  discount: string
  setDiscount: (d: string) => void
  tip: string
  setTip: (t: string) => void
  subtotal: number
  discountVal: number
  tipVal: number
  total: number
  currentShift: CashShift | null
  loading: boolean
  error: string | null
  loyaltyProgram?: LoyaltyProgramSettings | null
  isRedeemingLoyalty?: boolean
  onApplyLoyaltyReward?: (discountAmount: number, title: string) => void
  onRemoveLoyaltyReward?: () => void
  onUpdateQuantity: (index: number, delta: number) => void
  onRemoveItem: (index: number) => void
  onAssignBarber: (index: number, barberId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  onOpenShiftModal: () => void
}

export default function PosTicket({
  cart,
  barbers,
  clients,
  clientType,
  setClientType,
  selectedClientId,
  setSelectedClientId,
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  paymentMethod,
  setPaymentMethod,
  discount,
  setDiscount,
  tip,
  setTip,
  subtotal,
  discountVal,
  tipVal,
  total,
  currentShift,
  loading,
  error,
  loyaltyProgram,
  isRedeemingLoyalty,
  onApplyLoyaltyReward,
  onRemoveLoyaltyReward,
  onUpdateQuantity,
  onRemoveItem,
  onAssignBarber,
  onClearCart,
  onCheckout,
  onOpenShiftModal,
}: PosTicketProps) {
  return (
    <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-sm">Ticket de Venta</h3>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] text-neutral-400 hover:text-red-400 transition cursor-pointer"
          >
            Limpiar ticket
          </button>
        )}
      </div>

      {/* Client Assignment */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Cliente
          </span>
          <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[10px]">
            <button
              type="button"
              onClick={() => setClientType('WALK_IN')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                clientType === 'WALK_IN' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Casual
            </button>
            <button
              type="button"
              onClick={() => setClientType('EXISTING')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                clientType === 'EXISTING' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Registrado
            </button>
          </div>
        </div>

        {clientType === 'WALK_IN' ? (
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Nombre del cliente..."
              type="text"
              placeholder="Nombre del cliente..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
            />
            <input aria-label="Celular (opcional)..."
              type="tel"
              placeholder="Celular (opcional)..."
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        ) : (
          <select aria-label="select"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.phone})
              </option>
            ))}
          </select>
        )}

        {/* Loyalty Program Status & Redeem Banner */}
        {clientType === 'EXISTING' && selectedClientId && loyaltyProgram?.enabled && (() => {
          const clientObj = clients.find((c) => c.id === selectedClientId)
          if (!clientObj) return null

          const isPoints = loyaltyProgram.program_type === 'POINTS'
          const target = isPoints ? loyaltyProgram.target_points : loyaltyProgram.target_visits
          const points = clientObj.loyalty_points || 0
          const isReady = points >= target
          const rewardDiscountVal = isPoints ? loyaltyProgram.points_reward_discount : loyaltyProgram.reward_discount

          return (
            <div
              className={`mt-2 p-2.5 rounded-xl border text-xs transition ${
                isReady
                  ? 'bg-amber-500/15 border-amber-500/40 text-white'
                  : 'bg-neutral-950/80 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-neutral-200">
                    {isPoints ? `${points}/${target} Pts` : `${points}/${target} Sellos`}
                  </span>
                  {isReady && !isRedeemingLoyalty && (
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded">
                      ¡Premio Disponible!
                    </span>
                  )}
                </div>

                {isReady && !isRedeemingLoyalty && onApplyLoyaltyReward && (
                  <button
                    type="button"
                    onClick={() => onApplyLoyaltyReward(rewardDiscountVal, loyaltyProgram.reward_title)}
                    className="py-1 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] uppercase tracking-wider transition flex items-center gap-1 cursor-pointer shadow-md shadow-amber-400/20"
                  >
                    <Gift className="w-3 h-3" />
                    <span>Canjear (-{formatPrice(rewardDiscountVal)})</span>
                  </button>
                )}

                {isRedeemingLoyalty && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Premio Aplicado (-{formatPrice(rewardDiscountVal)})
                    </span>
                    {onRemoveLoyaltyReward && (
                      <button
                        type="button"
                        onClick={onRemoveLoyaltyReward}
                        className="text-[10px] text-neutral-400 hover:text-red-400 underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {cart.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-neutral-800 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-1.5 text-neutral-600">
              <Scissors className="w-5 h-5" />
              <Package className="w-5 h-5" />
            </div>
            <p className="text-xs text-neutral-500">Selecciona servicios o productos para cobrar</p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.item_type === 'PRODUCT'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                    </span>
                    <h4 className="font-bold text-white truncate">{item.name}</h4>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {formatPrice(item.unit_price)} c/u
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, -1)}
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-white text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, 1)}
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold text-white min-w-[50px] text-right">
                    {formatPrice(item.subtotal)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Asignar Barbero al item */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px]">
                <span className="text-neutral-500">Atendido por:</span>
                <select aria-label="select"
                  value={item.barber_id || ''}
                  onChange={(e) => onAssignBarber(idx, e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] px-2 py-0.5 rounded focus:outline-none focus:border-amber-500"
                >
                  <option value="">Sin barbero</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nickname || b.full_name} ({b.commission_rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="pt-2 border-t border-neutral-800">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
          Medio de Pago
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'CASH', label: 'Efectivo' },
              { id: 'YAPE', label: 'Yape' },
              { id: 'PLIN', label: 'Plin' },
              { id: 'CARD', label: 'Tarjeta' },
              { id: 'TRANSFER', label: 'Transf.' },
            ] as const
          ).map((pm) => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setPaymentMethod(pm.id)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold transition cursor-pointer border text-center ${
                paymentMethod === pm.id
                  ? 'bg-amber-500 text-black border-amber-500 font-bold'
                  : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Descuento y Propina */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <label htmlFor="field" className="block text-[11px] text-neutral-400 mb-1">Descuento (S/)</label>
          <input aria-label="input"
            type="number"
            min="0"
            step="1"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label htmlFor="field" className="block text-[11px] text-neutral-400 mb-1">Propina Barbero (S/)</label>
          <input aria-label="input"
            type="number"
            min="0"
            step="1"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Totals Summary */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountVal > 0 && (
          <div className="flex justify-between text-red-400">
            <span>Descuento:</span>
            <span>-{formatPrice(discountVal)}</span>
          </div>
        )}
        {tipVal > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>Propina:</span>
            <span>+{formatPrice(tipVal)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
          <span className="font-bold text-white text-sm">TOTAL A PAGAR:</span>
          <span className="font-extrabold text-2xl text-amber-400">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Advertencia dentro del ticket si la caja está cerrada */}
      {!currentShift && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-white">Cobro Bloqueado</span>
            <span className="text-neutral-400 text-[11px] block mt-0.5 leading-relaxed">
              La caja está cerrada. Debes aperturar el turno con el fondo inicial antes de cobrar.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Checkout Button: Solo habilitado si la caja está abierta */}
      {currentShift ? (
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || cart.length === 0}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          <span>Cobrar {formatPrice(total)}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenShiftModal}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Abrir Turno de Caja para Cobrar</span>
        </button>
      )}
    </div>
  )
}
