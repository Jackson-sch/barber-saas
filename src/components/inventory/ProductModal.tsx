'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Package, Barcode, DollarSign, Tag, ShieldCheck, AlertCircle } from 'lucide-react'
import { createProductAction, updateProductAction } from '@/actions/inventory'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/database.types'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  organizationId: string
  slug: string
  onSaved?: (message: string) => void
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  organizationId,
  slug,
  onSaved,
}: ProductModalProps) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('3')
  const [isInternalUse, setIsInternalUse] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku || '')
      setBarcode(product.barcode || '')
      setCostPrice(product.cost_price.toString())
      setSalePrice(product.sale_price.toString())
      setStock(product.stock.toString())
      setMinStock(product.min_stock.toString())
      setIsInternalUse(product.is_internal_use)
    } else {
      setName('')
      setSku('')
      setBarcode('')
      setCostPrice('0')
      setSalePrice('0')
      setStock('0')
      setMinStock('3')
      setIsInternalUse(false)
    }
    setError(null)
  }, [product, isOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  // Margen estimado en vivo
  const numCost = parseFloat(costPrice) || 0
  const numSale = parseFloat(salePrice) || 0
  const profit = numSale - numCost
  const marginPercent = numSale > 0 ? Math.round((profit / numSale) * 100) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre del producto es obligatorio.')
      return
    }

    setLoading(true)
    setError(null)

    const payload = {
      id: product?.id,
      organization_id: organizationId,
      name: name.trim(),
      sku: sku.trim() || null,
      barcode: barcode.trim() || null,
      cost_price: numCost,
      sale_price: numSale,
      stock: parseInt(stock, 10) || 0,
      min_stock: parseInt(minStock, 10) || 0,
      is_internal_use: isInternalUse,
      slug,
    }

    const res = product
      ? await updateProductAction(payload)
      : await createProductAction(payload)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      if (onSaved) {
        onSaved(product ? 'Producto actualizado con éxito.' : 'Producto registrado en el inventario.')
      }
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#12131A] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {product ? 'Editar Producto' : 'Nuevo Producto en Inventario'}
              </h3>
              <p className="text-xs text-neutral-400">
                Control de existencias, precios de venta y reposición
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Nombre del Producto <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pomada Fijación Fuerte Mate 100g, Aceite de Barba..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* SKU y Código de Barras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Código SKU (opcional)
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="POM-MATE-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white placeholder-neutral-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Código de Barras (opcional)
              </label>
              <div className="relative">
                <Barcode className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="775123456789"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Precios: Costo y Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Precio de Costo (Compra)
              </label>
              <div className="relative">
                <span className="text-neutral-500 text-xs absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Precio de Venta (Público) <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <span className="text-neutral-500 text-xs absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                  S/
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Margen Calculado en Tiempo Real */}
          {numSale > 0 && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-neutral-400">Margen estimado de ganancia:</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold font-mono">
                  +{formatPrice(profit)}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  {marginPercent}% margen
                </span>
              </div>
            </div>
          )}

          {/* Stock Actual y Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Stock Inicial en Tienda <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Alerta de Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Se marcará en alerta cuando queden {minStock || 0} o menos unidades.
              </span>
            </div>
          </div>

          {/* Switch de Insumo Interno vs Reventa */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090A0E] border border-white/10 cursor-pointer hover:border-white/20 transition">
              <input
                type="checkbox"
                checked={isInternalUse}
                onChange={(e) => setIsInternalUse(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-900"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Insumo de uso interno del salón
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Marca esta opción si es un producto de gasto operativo (ej: talco, hojas de afeitar, champú de lavacabezas) que no estará disponible para cobro directo a clientes en el POS.
                </span>
              </div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{product ? 'Guardar Cambios' : 'Registrar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
