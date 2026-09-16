import { useState, useEffect } from 'react'
import { createSaleAction, type CartItemInput } from '@/actions/pos'
import type { PaymentMethodType } from './PosTicket'
import type { SaleReceiptData } from './TicketReceiptModal'
import type {
  Service,
  Product,
  OrganizationMember,
  CashShift,
  Client,
  LoyaltyProgramSettings,
} from '@/types/database.types'
import type { AppointmentPreload } from './PosClient'

interface UsePosStateProps {
  services: Service[]
  barbers: OrganizationMember[]
  clients: Client[]
  products: Product[]
  currentShift: CashShift | null
  organizationId: string
  slug: string
  preloadAppointment?: AppointmentPreload | null
  loyaltyProgram?: LoyaltyProgramSettings | null
}

export function usePosState({
  services,
  barbers,
  clients,
  products,
  currentShift,
  organizationId,
  slug,
  preloadAppointment,
  loyaltyProgram,
}: UsePosStateProps) {
  // Carrito / Tab / Búsqueda
  const [cart, setCart] = useState<CartItemInput[]>([])
  const [catalogTab, setCatalogTab] = useState<'SERVICES' | 'PRODUCTS'>('SERVICES')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchService, setSearchService] = useState('')
  const [searchProduct, setSearchProduct] = useState('')

  // Cliente
  const [clientType, setClientType] = useState<'WALK_IN' | 'EXISTING'>('WALK_IN')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Fidelización
  const [isRedeemingLoyalty, setIsRedeemingLoyalty] = useState(false)
  const [loyaltyRewardTitle, setLoyaltyRewardTitle] = useState('')

  // Cobro
  const [discount, setDiscount] = useState('0')
  const [tip, setTip] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH')

  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false)
  const [completedReceipt, setCompletedReceipt] = useState<SaleReceiptData | null>(null)

  // Handlers Fidelización
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

  useEffect(() => {
    if (isRedeemingLoyalty) {
      handleRemoveLoyaltyReward()
    }
  }, [selectedClientId, clientType])

  // Pre-cargar cita
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

  // Handlers de Carrito
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

    const existing = cart.find((item) => item.product_id === prod.id)
    if (existing && existing.quantity >= prod.stock) {
      setError(`No puedes agregar más unidades de "${prod.name}". Stock máximo alcanzado (${prod.stock}).`)
      return
    }

    setCart((prev) => {
      const existingInPrev = prev.find((item) => item.product_id === prod.id)
      if (existingInPrev) {
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
    const item = cart[index]
    if (item && item.item_type === 'PRODUCT' && delta > 0 && item.product_id) {
      const prod = products.find((p) => p.id === item.product_id)
      if (prod && item.quantity + delta > prod.stock) {
        setError(`Stock insuficiente para "${prod.name}" (Disponible: ${prod.stock} unidades).`)
        return
      }
    }

    setCart((prev) => {
      const copy = [...prev]
      const currentItem = copy[index]
      if (!currentItem) return prev

      const newQty = currentItem.quantity + delta
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index)
      }
      
      copy[index] = {
        ...currentItem,
        quantity: newQty,
        subtotal: newQty * currentItem.unit_price,
      }
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

  // Checkout Handler
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
          rewardTitle: loyaltyProgram.reward_title || 'Recompensa',
          justRedeemed: isRedeemingLoyalty,
        }
      }

      setCompletedReceipt({
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
      })

      // Limpiar Formulario
      setCart([])
      setClientName('')
      setClientPhone('')
      setSelectedClientId('')
      setClientType('WALK_IN')
      setDiscount('0')
      setTip('0')
      setPaymentMethod('CASH')
      handleRemoveLoyaltyReward()
      setLoading(false)
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

  return {
    // State
    cart, setCart,
    catalogTab, setCatalogTab,
    selectedCategory, setSelectedCategory,
    searchService, setSearchService,
    searchProduct, setSearchProduct,
    clientType, setClientType,
    selectedClientId, setSelectedClientId,
    clientName, setClientName,
    clientPhone, setClientPhone,
    isRedeemingLoyalty,
    loyaltyRewardTitle,
    discount, setDiscount,
    tip, setTip,
    paymentMethod, setPaymentMethod,
    loading,
    error, setError,
    isOpenShiftModalOpen, setIsOpenShiftModalOpen,
    completedReceipt, setCompletedReceipt,
    subtotal,
    discountVal,
    tipVal,
    total,
    
    // Handlers
    handleApplyLoyaltyReward,
    handleRemoveLoyaltyReward,
    handleAddService,
    handleAddProduct,
    handleUpdateQuantity,
    handleRemoveItem,
    handleAssignBarber,
    handleCheckout,
    handleResetSale,
  }
}
