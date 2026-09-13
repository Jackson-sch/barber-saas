'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  AlertCircle,
  Lock,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { createSaleAction, type CartItemInput } from '@/actions/pos'
import OpenShiftModal from './OpenShiftModal'
import PosCatalog from './PosCatalog'
import PosTicket, { type PaymentMethodType } from './PosTicket'
import TicketReceiptModal, { type SaleReceiptData } from './TicketReceiptModal'
import Link from 'next/link'
import type {
  Service,
  ServiceCategory,
  OrganizationMember,
  CashShift,
  Client,
  Product,
  LoyaltyProgramSettings,
} from '@/types/database.types'

export interface AppointmentPreload {
  id: string
  client_id?: string
  barber_id: string
  service_id: string
  client_name?: string
  client_phone?: string
}

interface PosClientProps {
  services: Service[]
  categories: ServiceCategory[]
  barbers: OrganizationMember[]
  clients: Client[]
  products?: Product[]
  currentShift: CashShift | null
  organizationId: string
  organizationInfo?: {
    name: string
    address?: string | null
    phone?: string | null
    city?: string | null
  }
  loyaltyProgram?: LoyaltyProgramSettings | null
  slug: string
  preloadAppointment?: AppointmentPreload | null
}

export default function PosClient({
  services,
  categories,
  barbers,
  clients,
  products = [],
  currentShift,
  organizationId,
  organizationInfo,
  loyaltyProgram = null,
  slug,
  preloadAppointment,
}: PosClientProps) {
  const router = useRouter()
  // Estado del Carrito / Ticket
  const [cart, setCart] = useState<CartItemInput[]>([])
  const [catalogTab, setCatalogTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchService, setSearchService] = useState('')
  const [searchProduct, setSearchProduct] = useState('')

  // Estado del Cliente
  const [clientType, setClientType] = useState<'WALK_IN' | 'EXISTING'>('WALK_IN')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Fidelización y Recompensas
  const [isRedeemingLoyalty, setIsRedeemingLoyalty] = useState(false)
  const [loyaltyRewardTitle, setLoyaltyRewardTitle] = useState('')

  function handleApplyLoyaltyReward(discountAmount: number, title: string) {
    setDiscount(String(discountAmount))
    setIsRedeemingLoyalty(true)
    setLoyaltyRewardTitle(title)
  }

  function handleRemoveLoyaltyReward() {
    setDiscount('0')
    setIsRedeemingLoyalty(false)
    setLoyaltyRewardTitle('')
  }

  // Si cambia el cliente seleccionado, reiniciar cualquier premio aplicado
  useEffect(() => {
    if (isRedeemingLoyalty) {
      handleRemoveLoyaltyReward()
    }
  }, [selectedClientId, clientType])

  // Descuento, Propina y Pago
  const [discount, setDiscount] = useState('0')
  const [tip, setTip] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false)
  const [completedReceipt, setCompletedReceipt] = useState<SaleReceiptData | null>(null)

  // Pre-cargar cita si vino por parámetro
  useEffect(() => {
    if (preloadAppointment) {
      const svc = services.find((s) => s.id === preloadAppointment.service_id)
      if (svc) {
        setCart([
          {
            service_id: svc.id,
            name: svc.name,
            item_type: 'SERVICE',
            barber_id: preloadAppointment.barber_id,
            quantity: 1,
            unit_price: Number(svc.price),
            subtotal: Number(svc.price),
            commission_percent: Number(svc.commission_percent || 40),
          },
        ])
      }
      if (preloadAppointment.client_name) {
        setClientName(preloadAppointment.client_name)
      }
      if (preloadAppointment.client_phone) {
        setClientPhone(preloadAppointment.client_phone)
      }
      if (preloadAppointment.client_id) {
        setSelectedClientId(preloadAppointment.client_id)
      }
    }
  }, [preloadAppointment, services])

  // Funciones del carrito
  function handleAddService(svc: Service) {
    setError(null)
    setCart((prev) => {
      const existing = prev.find((item) => item.service_id === svc.id)
      if (existing) {
        return prev.map((item) =>
          item.service_id === svc.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item
        )
      }
      return [
        ...prev,
        {
          service_id: svc.id,
          name: svc.name,
          item_type: 'SERVICE',
          barber_id: barbers[0]?.id || null,
          quantity: 1,
          unit_price: Number(svc.price),
          subtotal: Number(svc.price),
          commission_percent: Number(svc.commission_percent || 40),
        },
      ]
    })
  }

  function handleAddProduct(prod: Product) {
    setError(null)
    if (prod.stock <= 0) {
      setError(`El producto "${prod.name}" no tiene unidades disponibles en stock.`)
      return
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === prod.id)
      if (existing) {
        if (existing.quantity >= prod.stock) {
          setError(
            `No puedes agregar más unidades de "${prod.name}". Stock máximo alcanzado (${prod.stock}).`
          )
          return prev
        }
        return prev.map((item) =>
          item.product_id === prod.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item
        )
      }
      return [
        ...prev,
        {
          product_id: prod.id,
          name: prod.name,
          item_type: 'PRODUCT',
          barber_id: barbers[0]?.id || null,
          quantity: 1,
          unit_price: Number(prod.sale_price),
          subtotal: Number(prod.sale_price),
          commission_percent: 10,
        },
      ]
    })
  }

  function handleUpdateQuantity(index: number, delta: number) {
    setError(null)
    setCart((prev) => {
      const copy = [...prev]
      const item = copy[index]

      if (item.item_type === 'PRODUCT' && delta > 0 && item.product_id) {
        const prod = products.find((p) => p.id === item.product_id)
        if (prod && item.quantity + delta > prod.stock) {
          setError(`Stock insuficiente para "${prod.name}" (Disponible: ${prod.stock} unidades).`)
          return prev
        }
      }

      const newQty = item.quantity + delta
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index)
      }
      copy[index].quantity = newQty
      copy[index].subtotal = newQty * copy[index].unit_price
      return copy
    })
  }

  function handleRemoveItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAssignBarber(index: number, barberId: string) {
    setCart((prev) => {
      const copy = [...prev]
      copy[index].barber_id = barberId
      return copy
    })
  }

  // Cálculos totales
  const subtotal = cart.reduce((acc, it) => acc + it.subtotal, 0)
  const discountVal = parseFloat(discount) || 0
  const tipVal = parseFloat(tip) || 0
  const total = Math.max(0, subtotal - discountVal) + tipVal

  async function handleCheckout() {
    if (!currentShift) {
      setError('La caja está cerrada. Debes abrir un turno de caja antes de realizar un cobro.')
      setIsOpenShiftModalOpen(true)
      return
    }
    if (cart.length === 0) return
    setError(null)
    setLoading(true)

    const res = await createSaleAction({
      organization_id: organizationId,
      shift_id: currentShift.id,
      client_id: clientType === 'EXISTING' ? selectedClientId : null,
      client_name: clientType === 'WALK_IN' ? clientName : undefined,
      client_phone: clientType === 'WALK_IN' ? clientPhone : undefined,
      appointment_id: preloadAppointment?.id || null,
      items: cart,
      discount: discountVal,
      tip: tipVal,
      payment_method: paymentMethod,
      slug,
      redeem_loyalty_reward: isRedeemingLoyalty,
      loyalty_reward_description: isRedeemingLoyalty ? loyaltyRewardTitle : undefined,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.saleId) {
      const selectedClientObj = clients.find((c) => c.id === selectedClientId)

      let receiptLoyaltyInfo = null
      if (selectedClientObj && loyaltyProgram?.enabled) {
        const isPoints = loyaltyProgram.program_type === 'POINTS'
        const target = isPoints ? loyaltyProgram.target_points : loyaltyProgram.target_visits
        const prevPoints = selectedClientObj.loyalty_points || 0
        const afterRedeem = isRedeemingLoyalty ? Math.max(0, prevPoints - target) : prevPoints
        const earned = isPoints ? Math.floor(total * (loyaltyProgram.points_per_pen || 1)) : 1
        const newBalance = afterRedeem + earned

        receiptLoyaltyInfo = {
          currentPoints: newBalance,
          target,
          isPoints,
          rewardTitle: loyaltyProgram.reward_title,
          justRedeemed: isRedeemingLoyalty,
        }
      }

      const receiptData: SaleReceiptData = {
        id: res.saleId,
        total,
        subtotal,
        discount: discountVal,
        tip: tipVal,
        paymentMethod,
        createdAt: new Date().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        clientName:
          clientType === 'WALK_IN'
            ? clientName.trim() || 'Cliente Casual'
            : selectedClientObj?.full_name || 'Cliente Registrado',
        clientPhone:
          clientType === 'WALK_IN'
            ? clientPhone.trim() || null
            : selectedClientObj?.phone || null,
        items: cart.map((it) => {
          const barber = barbers.find((b) => b.id === it.barber_id)
          return {
            name: it.name,
            quantity: it.quantity,
            unit_price: it.unit_price,
            subtotal: it.subtotal,
            barberName: barber ? barber.nickname || barber.full_name : null,
          }
        }),
        loyaltyInfo: receiptLoyaltyInfo,
      }

      setLoading(false)
      setCompletedReceipt(receiptData)
    }
  }

  function handleResetSale() {
    setCart([])
    setDiscount('0')
    setTip('0')
    setClientName('')
    setClientPhone('')
    setSelectedClientId('')
    setIsRedeemingLoyalty(false)
    setLoyaltyRewardTitle('')
    setCompletedReceipt(null)
  }

  return (
    <div className="space-y-4">
      {/* Header & Shift Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Punto de Venta (POS)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cobro rápido de servicios, propinas y comisiones automáticas por barbero.
          </p>
        </div>

        {/* Turno de caja badge */}
        <div>
          {currentShift ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Caja Abierta (Fondo: {formatPrice(Number(currentShift.initial_cash))})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Abrir Turno de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta Destacada: Caja Cerrada */}
      {!currentShift && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Caja Cerrada — Cobros Inhabilitados</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Para registrar ventas y emitir comprobantes, primero debes aperturar el turno con el fondo inicial.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenShiftModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Aperturar Caja Ahora</span>
          </button>
        </div>
      )}

      {/* POS Grid: Catalog on left, Ticket on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <PosCatalog
          services={services}
          categories={categories}
          products={products}
          catalogTab={catalogTab}
          setCatalogTab={setCatalogTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchService={searchService}
          setSearchService={setSearchService}
          searchProduct={searchProduct}
          setSearchProduct={setSearchProduct}
          onAddService={handleAddService}
          onAddProduct={handleAddProduct}
        />

        <PosTicket
          cart={cart}
          barbers={barbers}
          clients={clients}
          clientType={clientType}
          setClientType={setClientType}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          clientName={clientName}
          setClientName={setClientName}
          clientPhone={clientPhone}
          setClientPhone={setClientPhone}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          discount={discount}
          setDiscount={setDiscount}
          tip={tip}
          setTip={setTip}
          subtotal={subtotal}
          discountVal={discountVal}
          tipVal={tipVal}
          total={total}
          currentShift={currentShift}
          loading={loading}
          error={error}
          loyaltyProgram={loyaltyProgram}
          isRedeemingLoyalty={isRedeemingLoyalty}
          onApplyLoyaltyReward={handleApplyLoyaltyReward}
          onRemoveLoyaltyReward={handleRemoveLoyaltyReward}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onAssignBarber={handleAssignBarber}
          onClearCart={() => setCart([])}
          onCheckout={handleCheckout}
          onOpenShiftModal={() => setIsOpenShiftModalOpen(true)}
        />
      </div>

      {/* Sale Complete Modal with Thermal Ticket & WhatsApp */}
      <TicketReceiptModal
        isOpen={!!completedReceipt}
        onClose={handleResetSale}
        sale={completedReceipt}
        organization={organizationInfo || { name: 'Barbería' }}
        slug={slug}
        onNewSale={handleResetSale}
        onViewCaja={() => router.push(`/app/${slug}/caja`)}
      />

      {/* Open Shift Modal */}
      <OpenShiftModal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        organizationId={organizationId}
        slug={slug}
      />
    </div>
  )
}
