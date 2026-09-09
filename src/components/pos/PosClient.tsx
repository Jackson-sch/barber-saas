'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Scissors,
  Plus,
  Minus,
  Trash2,
  Search,
  User,
  Phone,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Sparkles,
  ArrowRight,
  Lock,
  Package,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { createSaleAction, type CartItemInput } from '@/actions/pos'
import OpenShiftModal from './OpenShiftModal'
import Link from 'next/link'
import type { Service, ServiceCategory, OrganizationMember, CashShift, Client, Product } from '@/types/database.types'

interface AppointmentPreload {
  id: string
  client_id: string
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
  slug,
  preloadAppointment,
}: PosClientProps) {
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

  // Descuento, Propina y Pago
  const [discount, setDiscount] = useState('0')
  const [tip, setTip] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER'>('CASH')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<{ id: string; total: number } | null>(null)

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

  // Filtrar servicios
  const filteredServices = services.filter((svc) => {
    const matchesCat = selectedCategory === 'ALL' ? true : svc.category_id === selectedCategory
    const matchesSearch = svc.name.toLowerCase().includes(searchService.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Filtrar productos
  const filteredProducts = products.filter((prod) => {
    const q = searchProduct.toLowerCase()
    return (
      prod.name.toLowerCase().includes(q) ||
      (prod.sku && prod.sku.toLowerCase().includes(q)) ||
      (prod.barcode && prod.barcode.includes(q))
    )
  })

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
          barber_id: barbers[0]?.id || null, // Asignar el primer barbero por defecto
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
          setError(`No puedes agregar más unidades de "${prod.name}". Stock máximo alcanzado (${prod.stock}).`)
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
          barber_id: barbers[0]?.id || null, // Barbero que recomendó/vendió el producto
          quantity: 1,
          unit_price: Number(prod.sale_price),
          subtotal: Number(prod.sale_price),
          commission_percent: 10, // Comisión del 10% en venta de producto
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
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.saleId) {
      setLoading(false)
      setCompletedSale({ id: res.saleId, total })
    }
  }

  function handleResetSale() {
    setCart([])
    setDiscount('0')
    setTip('0')
    setClientName('')
    setClientPhone('')
    setSelectedClientId('')
    setCompletedSale(null)
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
        {/* Left 7 cols: Services & Products Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selector de Modo: Servicios vs Productos */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
            <button
              type="button"
              onClick={() => setCatalogTab('SERVICES')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                catalogTab === 'SERVICES'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Servicios ({services.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setCatalogTab('PRODUCTS')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                catalogTab === 'PRODUCTS'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Productos ({products.length})</span>
            </button>
          </div>

          {catalogTab === 'SERVICES' ? (
            <>
              {/* Category Tabs & Search */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                      selectedCategory === 'ALL'
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar servicio..."
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredServices.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleAddService(svc)}
                    className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 hover:border-amber-500/50 hover:bg-neutral-900 transition flex flex-col justify-between text-left group cursor-pointer min-h-[110px]"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug group-hover:text-amber-400 transition">
                        {svc.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        {svc.duration_minutes} min • {svc.commission_percent}% com.
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-neutral-800/60">
                      <span className="font-extrabold text-sm text-amber-400">
                        {formatPrice(Number(svc.price))}
                      </span>
                      <div className="w-6 h-6 rounded-md bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black flex items-center justify-center transition">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Product Search & Counter */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <span className="text-xs text-neutral-400">
                  Productos para reventa: <strong className="text-white">{products.length}</strong>
                </span>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center bg-neutral-900/40 rounded-xl border border-neutral-800/60 text-neutral-500 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                  <p className="font-medium text-neutral-400">No hay productos disponibles</p>
                  <p className="text-[11px] text-neutral-600 mt-1">Registra productos en la sección Inventario.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredProducts.map((prod) => {
                    const isOut = prod.stock <= 0
                    const isLow = prod.stock <= prod.min_stock && !isOut
                    return (
                      <button
                        key={prod.id}
                        disabled={isOut}
                        onClick={() => handleAddProduct(prod)}
                        className={`p-3.5 rounded-xl border transition flex flex-col justify-between text-left group min-h-[110px] ${
                          isOut
                            ? 'bg-neutral-950/40 border-neutral-800/40 opacity-40 cursor-not-allowed'
                            : 'bg-neutral-900/70 border-neutral-800/80 hover:border-amber-500/50 hover:bg-neutral-900 cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            {prod.sku ? (
                              <span className="text-[9px] font-mono text-neutral-500 uppercase truncate max-w-[80px]">
                                {prod.sku}
                              </span>
                            ) : <span />}
                            {isOut ? (
                              <span className="text-[10px] font-bold text-red-400">Agotado</span>
                            ) : isLow ? (
                              <span className="text-[10px] font-bold text-amber-400">Quedan {prod.stock}</span>
                            ) : (
                              <span className="text-[10px] font-medium text-emerald-400">{prod.stock} un.</span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-xs leading-snug group-hover:text-amber-400 transition">
                            {prod.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between w-full mt-3 pt-2 border-t border-neutral-800/60">
                          <span className="font-extrabold text-sm text-amber-400">
                            {formatPrice(Number(prod.sale_price))}
                          </span>
                          <div className="w-6 h-6 rounded-md bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black flex items-center justify-center transition">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right 5 cols: Current Ticket & Payment */}
        <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Ticket de Venta</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
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
                  className={`px-2 py-0.5 rounded transition ${
                    clientType === 'WALK_IN' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400'
                  }`}
                >
                  Casual
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('EXISTING')}
                  className={`px-2 py-0.5 rounded transition ${
                    clientType === 'EXISTING' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400'
                  }`}
                >
                  Registrado
                </button>
              </div>
            </div>

            {clientType === 'WALK_IN' ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre del cliente..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Celular (opcional)..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <select
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
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-white text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-white min-w-[50px] text-right">
                        {formatPrice(item.subtotal)}
                      </span>

                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Asignar Barbero al item */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px]">
                    <span className="text-neutral-500">Atendido por:</span>
                    <select
                      value={item.barber_id || ''}
                      onChange={(e) => handleAssignBarber(idx, e.target.value)}
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
              <label className="block text-[11px] text-neutral-400 mb-1">Descuento (S/)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Propina Barbero (S/)</label>
              <input
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
              onClick={handleCheckout}
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
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Abrir Turno de Caja para Cobrar</span>
            </button>
          )}
        </div>
      </div>

      {/* Sale Complete Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">¡Venta Exitosa!</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Cobro procesado y comisiones acreditadas al barbero.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 block">Monto Total Cobrado</span>
              <span className="text-3xl font-extrabold text-amber-400 mt-1 block">
                {formatPrice(completedSale.total)}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Método: {paymentMethod}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleResetSale}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
              >
                Nueva Venta
              </button>
              <Link
                href={`/app/${slug}/caja`}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
              >
                Ver Caja
              </Link>
            </div>
          </div>
        </div>
      )}

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
