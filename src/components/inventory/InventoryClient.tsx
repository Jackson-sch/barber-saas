'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  TrendingUp,
  DollarSign,
  Tag,
  Barcode,
  Archive,
  Layers,
  ShoppingBag,
  Loader2,
  ArrowUpRight,
  Minus,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { adjustStockAction, deleteProductAction } from '@/actions/inventory'
import ProductModal from './ProductModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import type { Product } from '@/types/database.types'

interface InventoryClientProps {
  initialProducts: Product[]
  organizationId: string
  slug: string
}

type FilterTab = 'ALL' | 'LOW_STOCK' | 'RETAIL' | 'INTERNAL'

export default function InventoryClient({
  initialProducts,
  organizationId,
  slug,
}: InventoryClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<FilterTab>('ALL')

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Sincronizar si cambia initialProducts
  if (initialProducts !== products) {
    setProducts(initialProducts)
  }

  // KPIs
  const totalProducts = products.length
  const lowStockCount = products.filter((p) => p.stock <= p.min_stock).length
  const totalCostValue = products.reduce((acc, p) => acc + Number(p.cost_price || 0) * (p.stock || 0), 0)
  const totalSaleValue = products.reduce((acc, p) => acc + Number(p.sale_price || 0) * (p.stock || 0), 0)

  // Filtrado
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q))

    if (!matchesSearch) return false

    if (selectedTab === 'LOW_STOCK') return p.stock <= p.min_stock
    if (selectedTab === 'RETAIL') return !p.is_internal_use
    if (selectedTab === 'INTERNAL') return p.is_internal_use
    return true
  })

  function handleOpenCreate() {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  function handleOpenEdit(product: Product) {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  async function handleQuickStock(productId: string, delta: number) {
    setAdjustingId(productId)
    const res = await adjustStockAction(productId, organizationId, delta, slug)
    if (res?.error) {
      addToast('error', res.error)
    } else if (res?.success && typeof res.newStock === 'number') {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: res.newStock } : p))
      )
    }
    setAdjustingId(null)
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return
    setIsDeleting(true)
    const res = await deleteProductAction(productToDelete.id, organizationId, slug)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', `Producto "${productToDelete.name}" eliminado del catálogo.`)
    }
    setIsDeleting(false)
    setProductToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Control de Inventario & Stock
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestiona productos para reventa en el POS, insumos de barbería, costos y niveles de reposición.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Productos Registrados</span>
            <p className="text-2xl font-extrabold text-white mt-0.5">{totalProducts}</p>
            <span className="text-[11px] text-neutral-500">En catálogo de tienda</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Valoración de Stock</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {formatPrice(totalSaleValue)}
            </p>
            <span className="text-[11px] text-neutral-500">
              Costo invertido: {formatPrice(totalCostValue)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Stock Crítico / Agotados</span>
            <p
              className={`text-2xl font-extrabold mt-0.5 ${
                lowStockCount > 0 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {lowStockCount}
            </p>
            <span className="text-[11px] text-neutral-500">Por debajo del stock mínimo</span>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              lowStockCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/[0.04] border-white/10 text-neutral-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedTab === 'ALL'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedTab === 'LOW_STOCK'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
            }`}
          >
            {lowStockCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            <span>Stock Bajo ({lowStockCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('RETAIL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedTab === 'RETAIL'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
            }`}
          >
            Reventa POS ({products.filter((p) => !p.is_internal_use).length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('INTERNAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedTab === 'INTERNAL'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
            }`}
          >
            Insumos ({products.filter((p) => p.is_internal_use).length})
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-neutral-500 mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No se encontraron productos</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No hay productos que coincidan con tu búsqueda.'
              : 'Comienza agregando los productos que vendes en el mostrador o insumos que usas a diario.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primer Producto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const isOut = prod.stock === 0
            const isLow = prod.stock <= prod.min_stock && !isOut
            const profit = prod.sale_price - prod.cost_price
            const marginPercent =
              prod.sale_price > 0 ? Math.round((profit / prod.sale_price) * 100) : 0

            return (
              <div
                key={prod.id}
                className="bg-[#12131A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition group relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {prod.is_internal_use ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 uppercase">
                          Insumo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 uppercase">
                          Reventa POS
                        </span>
                      )}
                      {prod.sku && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-neutral-400 font-mono text-[10px] border border-white/[0.06]">
                          {prod.sku}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <div>
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-bold border border-red-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>Agotado</span>
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Stock Bajo</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Disponible</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nombre */}
                  <h4 className="text-white font-bold text-base tracking-tight leading-snug">
                    {prod.name}
                  </h4>

                  {/* Precios & Margen */}
                  <div className="mt-3 p-3 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Precio Venta</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {formatPrice(prod.sale_price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Costo compra</span>
                      <span className="text-neutral-400 font-mono">
                        {formatPrice(prod.cost_price)}
                      </span>
                    </div>
                    {!prod.is_internal_use && prod.sale_price > 0 && (
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/[0.04]">
                        <span className="text-neutral-500">Ganancia bruta</span>
                        <span className="text-emerald-400 font-mono font-medium">
                          +{formatPrice(profit)} ({marginPercent}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Stock Controls & Actions */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  {/* Quick +/- Stock adjustment */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400 mr-1">Stock:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickStock(prod.id, -1)}
                      disabled={adjustingId === prod.id || prod.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition cursor-pointer"
                      title="Restar 1 unidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span
                      className={`font-mono text-sm font-bold min-w-[28px] text-center ${
                        isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {adjustingId === prod.id ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto text-amber-400" />
                      ) : (
                        prod.stock
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuickStock(prod.id, 1)}
                      disabled={adjustingId === prod.id}
                      className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition cursor-pointer"
                      title="Sumar 1 unidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(prod)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        organizationId={organizationId}
        slug={slug}
        onSaved={(msg) => addToast('success', msg)}
      />

      {/* Confirmación Eliminar */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Producto"
        description={`¿Estás seguro de eliminar "${productToDelete?.name}"? Si el producto ya cuenta con ventas registradas, será archivado para mantener la integridad contable de los reportes.`}
        confirmText="Sí, eliminar"
        cancelText="Conservar"
        loading={isDeleting}
        details={
          productToDelete
            ? [
                { label: 'Producto', value: productToDelete.name },
                { label: 'Precio de venta', value: formatPrice(productToDelete.sale_price) },
                { label: 'Stock actual', value: `${productToDelete.stock} unidades` },
                {
                  label: 'Tipo',
                  value: productToDelete.is_internal_use ? 'Insumo interno' : 'Reventa en POS',
                },
              ]
            : undefined
        }
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
