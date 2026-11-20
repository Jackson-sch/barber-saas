'use client'

import { useState, useEffect, useMemo } from 'react'
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
  CheckCircle2,
  Search,
  User,
  UserCheck,
  Phone,
  Banknote,
  Smartphone,
  QrCode,
  Landmark,
  Receipt,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { searchGlobalClientsAction } from '@/actions/clients'
import type { CartItemInput } from '@/actions/pos'
import type { OrganizationMember, Client, CashShift, LoyaltyProgramSettings } from '@/types/database.types'

export type PaymentMethodType = 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER'

interface PosTicketProps {
  organizationId: string
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
  onAssignBarberToAll?: (barberId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  onOpenShiftModal: () => void
}

const PAYMENT_OPTIONS = [
  {
    id: 'CASH' as const,
    label: 'Efectivo',
    icon: Banknote,
    activeClass: 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'YAPE' as const,
    label: 'Yape',
    icon: Smartphone,
    activeClass: 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/25',
  },
  {
    id: 'PLIN' as const,
    label: 'Plin',
    icon: QrCode,
    activeClass: 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20',
  },
  {
    id: 'CARD' as const,
    label: 'Tarjeta',
    icon: CreditCard,
    activeClass: 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20',
  },
  {
    id: 'TRANSFER' as const,
    label: 'Transf.',
    icon: Landmark,
    activeClass: 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/25',
  },
]

export default function PosTicket({
  organizationId,
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
  onAssignBarberToAll,
  onClearCart,
  onCheckout,
  onOpenShiftModal,
}: PosTicketProps) {
  const [clientQuery, setClientQuery] = useState('')
  const [remoteClients, setRemoteClients] = useState<
    Array<{ id: string; full_name: string; phone: string; loyalty_points: number }>
  >([])
  const [searchingClients, setSearchingClients] = useState(false)

  useEffect(() => {
    const q = clientQuery.trim()
    if (clientType !== 'EXISTING' || q.length < 2) {
      setRemoteClients([])
      setSearchingClients(false)
      return
    }

    let mounted = true
    const timer = setTimeout(async () => {
      setSearchingClients(true)
      const res = await searchGlobalClientsAction(organizationId, q)
      if (mounted) {
        setRemoteClients(res.clients || [])
        setSearchingClients(false)
      }
    }, 250)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [clientQuery, clientType, organizationId])

  const mergedClients = useMemo(() => {
    const map = new Map<
      string,
      { id: string; full_name: string; phone: string; loyalty_points: number }
    >()
    for (const c of clients) {
      map.set(c.id, {
        id: c.id,
        full_name: c.full_name,
        phone: c.phone,
        loyalty_points: c.loyalty_points || 0,
      })
    }
    for (const rc of remoteClients) {
      map.set(rc.id, {
        id: rc.id,
        full_name: rc.full_name,
        phone: rc.phone,
        loyalty_points: rc.loyalty_points || 0,
      })
    }
    return Array.from(map.values())
  }, [clients, remoteClients])

  const displayedClients =
    clientQuery.trim().length >= 2 ? remoteClients : mergedClients

  const totalItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0)
  const barberMap = useMemo(() => new Map(barbers.map((b) => [b.id, b])), [barbers])

  function handleQuickTip(addAmount: number) {
    const currentTip = Math.max(0, parseFloat(tip) || 0)
    setTip(String(currentTip + addAmount))
  }

  return (
    <div className="lg:col-span-5 lg:sticky lg:top-20 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl shadow-black/50">
      {/* Cabecera del Ticket */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Receipt className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight">Ticket de Venta</h3>
          {totalItemsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px] tabular-nums">
              {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] font-medium text-neutral-400 hover:text-red-400 transition cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Sección Compacta de Cliente */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
            Cliente
          </span>
          <div className="flex items-center gap-1 bg-[#090A0E] p-0.5 rounded-lg border border-white/[0.06] text-[10px]">
            <button
              type="button"
              onClick={() => setClientType('WALK_IN')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                clientType === 'WALK_IN'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Casual</span>
            </button>
            <button
              type="button"
              onClick={() => setClientType('EXISTING')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                clientType === 'EXISTING'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Registrado</span>
            </button>
          </div>
        </div>

        {clientType === 'WALK_IN' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                aria-label="Nombre del cliente"
                type="text"
                placeholder="Nombre cliente..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                aria-label="Celular opcional"
                type="tel"
                placeholder="Celular (opc.)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                aria-label="Buscar cliente registrado por nombre o celular"
                type="text"
                placeholder="Buscar por nombre o celular..."
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
              {searchingClients && (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <select
              aria-label="Seleccionar cliente registrado"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500 transition"
            >
              <option value="">
                {clientQuery.trim().length >= 2
                  ? `${displayedClients.length} coincidencia(s) encontrada(s)...`
                  : 'Seleccionar cliente...'}
              </option>
              {displayedClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Banner de Fidelización */}
        {clientType === 'EXISTING' &&
          selectedClientId &&
          loyaltyProgram?.enabled &&
          (() => {
            const clientObj = mergedClients.find((c) => c.id === selectedClientId)
            if (!clientObj) return null

            const isPoints = loyaltyProgram.program_type === 'POINTS'
            const target = isPoints ? loyaltyProgram.target_points : loyaltyProgram.target_visits
            const points = clientObj.loyalty_points || 0
            const isReady = points >= target
            const rewardDiscountVal = isPoints
              ? loyaltyProgram.points_reward_discount
              : loyaltyProgram.reward_discount

            return (
              <div
                className={`p-2.5 rounded-xl border text-xs transition ${
                  isReady
                    ? 'bg-amber-500/15 border-amber-500/40 text-white'
                    : 'bg-[#090A0E] border-white/[0.06] text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-neutral-200 tabular-nums">
                      {isPoints ? `${points}/${target} Pts` : `${points}/${target} Sellos`}
                    </span>
                    {isReady && !isRedeemingLoyalty && (
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded">
                        ¡Premio!
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
                        Aplicado (-{formatPrice(rewardDiscountVal)})
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

      {/* Selector Rápido de Barbero Global (cuando hay ítems y barberos) */}
      {cart.length > 0 && barbers.length > 0 && onAssignBarberToAll && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#090A0E] border border-white/[0.06] text-[11px]">
          <span className="text-neutral-400 font-medium whitespace-nowrap">Barbero para todo:</span>
          <select
            aria-label="Asignar barbero a todos los ítems"
            defaultValue=""
            onChange={(e) => onAssignBarberToAll(e.target.value)}
            className="bg-[#12141E] border border-white/[0.08] text-neutral-200 text-[11px] px-2 py-1 rounded-lg focus:outline-none focus:border-amber-500 max-w-[180px]"
          >
            <option value="">Elegir especialista...</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nickname || b.full_name} ({b.commission_rate}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de Ítems en el Carrito */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {cart.length === 0 ? (
          <div className="py-7 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#090A0E]/50">
            <div className="flex items-center justify-center gap-2 mb-1.5 text-neutral-600">
              <Scissors className="w-4 h-4" />
              <Package className="w-4 h-4" />
            </div>
            <p className="text-xs text-neutral-400 font-medium">Ticket vacío</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Toca un servicio o producto del catálogo para agregarlo.
            </p>
          </div>
        ) : (
          cart.map((item, idx) => {
            const assignedBarber = item.barber_id ? barberMap.get(item.barber_id) : null
            const barberInitial = (assignedBarber?.nickname || assignedBarber?.full_name || '?')
              .charAt(0)
              .toUpperCase()

            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.07] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                          item.item_type === 'PRODUCT'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.item_type === 'PRODUCT' ? 'Prod' : 'Serv'}
                      </span>
                      <h4 className="font-bold text-white truncate">{item.name}</h4>
                    </div>
                    <span className="text-[11px] text-neutral-500 tabular-nums">
                      {formatPrice(item.unit_price)} c/u
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#12141E] border border-white/[0.08] rounded-lg">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(idx, -1)}
                        aria-label="Disminuir cantidad"
                        className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-white text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(idx, 1)}
                        aria-label="Aumentar cantidad"
                        className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-white min-w-[54px] text-right tabular-nums">
                      {formatPrice(item.subtotal)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      aria-label="Quitar ítem"
                      className="p-1 text-neutral-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Asignación de barbero por ítem con inicial */}
                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05] text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <span
                      className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                        assignedBarber
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/[0.05] text-neutral-500'
                      }`}
                    >
                      {barberInitial}
                    </span>
                    <span>Atendido por:</span>
                  </div>
                  <select
                    aria-label="Seleccionar barbero para el ítem"
                    value={item.barber_id || ''}
                    onChange={(e) => onAssignBarber(idx, e.target.value)}
                    className="bg-[#12141E] border border-white/[0.08] text-neutral-200 text-[11px] px-2 py-0.5 rounded-lg focus:outline-none focus:border-amber-500"
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
            )
          })
        )}
      </div>

      {/* Medios de Pago en una Sola Fila (5 columnas con iconos y color distintivo) */}
      <div className="pt-2 border-t border-white/[0.06] space-y-2">
        <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest block">
          Medio de Pago
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {PAYMENT_OPTIONS.map((pm) => {
            const Icon = pm.icon
            const isSelected = paymentMethod === pm.id
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold transition cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? pm.activeClass
                    : 'bg-[#090A0E] text-neutral-400 border-white/[0.07] hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate w-full text-center leading-none">{pm.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Descuento y Propina Compactos con Prefijo S/ y Atajos */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label
            htmlFor="pos_discount_input"
            className="block text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-wider mb-1"
          >
            Descuento
          </label>
          <div className="relative">
            <span className="text-[11px] font-mono text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              S/
            </span>
            <input
              id="pos_discount_input"
              type="number"
              min="0"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="pos_tip_input"
              className="block text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-wider"
            >
              Propina
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickTip(5)}
                className="px-1.5 py-0.2 rounded bg-white/[0.06] hover:bg-amber-500/20 text-[10px] font-mono text-amber-300 border border-white/[0.08] transition cursor-pointer"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => handleQuickTip(10)}
                className="px-1.5 py-0.2 rounded bg-white/[0.06] hover:bg-amber-500/20 text-[10px] font-mono text-amber-300 border border-white/[0.08] transition cursor-pointer"
              >
                +10
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="text-[11px] font-mono text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              S/
            </span>
            <input
              id="pos_tip_input"
              type="number"
              min="0"
              step="1"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="p-3.5 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-400 tabular-nums">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountVal > 0 && (
          <div className="flex justify-between text-red-400 tabular-nums">
            <span>Descuento</span>
            <span>-{formatPrice(discountVal)}</span>
          </div>
        )}
        {tipVal > 0 && (
          <div className="flex justify-between text-amber-400 tabular-nums">
            <span>Propina</span>
            <span>+{formatPrice(tipVal)}</span>
          </div>
        )}
        <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
          <span className="font-bold text-white text-xs uppercase tracking-wider">Total a Pagar</span>
          <span className="font-extrabold text-2xl text-amber-400 tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Botón Único de Acción Principal */}
      {currentShift ? (
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || cart.length === 0}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer tabular-nums"
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
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Aperturar Turno de Caja para Cobrar</span>
        </button>
      )}
    </div>
  )
}
