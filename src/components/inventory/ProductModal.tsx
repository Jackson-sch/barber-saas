'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Package, Barcode, Tag, AlertCircle } from 'lucide-react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">
                {product ? 'Editar Producto' : 'Nuevo Producto en Inventario'}
              </h3>
              <p className="text-xs text-neutral-400">
                Control de existencias, precios de venta y alertas de reposición
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="product_name_input"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Nombre del Producto *
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="product_name_input"
                type="text"
                required
                placeholder="Ej: Pomada Fijación Fuerte Mate 100g, Aceite de Barba..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* SKU y Código de Barras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product_sku_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Código SKU (Opcional)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="product_sku_input"
                  type="text"
                  placeholder="POM-MATE-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono uppercase focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product_barcode_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Código de Barras (Opcional)
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="product_barcode_input"
                  type="text"
                  placeholder="775123456789"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Precios: Costo y Venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product_cost_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Precio de Costo (Compra)
              </label>
              <div className="relative">
                <span className="text-neutral-500 text-xs absolute left-3.5 top-1/2 -translate-y-1/2 font-mono pointer-events-none">
                  S/
                </span>
                <input
                  id="product_cost_input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product_sale_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Precio de Venta (Público) *
              </label>
              <div className="relative">
                <span className="text-neutral-500 text-xs absolute left-3.5 top-1/2 -translate-y-1/2 font-mono pointer-events-none">
                  S/
                </span>
                <input
                  id="product_sale_input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Margen Calculado en Tiempo Real */}
          {numSale > 0 && (
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-neutral-400">Margen estimado de ganancia:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold font-mono tabular-nums ${
                    profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {profit >= 0 ? '+' : ''}
                  {formatPrice(profit)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border font-mono tabular-nums ${
                    profit >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {marginPercent}% margen
                </span>
              </div>
            </div>
          )}

          {/* Stock Actual y Stock Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="product_stock_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Stock Inicial en Tienda *
              </label>
              <input
                id="product_stock_input"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="product_min_stock_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Alerta de Stock Mínimo
              </label>
              <input
                id="product_min_stock_input"
                type="number"
                min="0"
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Se marcará en alerta cuando queden {minStock || 0} o menos unidades.
              </span>
            </div>
          </div>

          {/* Switch de Insumo Interno vs Reventa */}
          <label
            htmlFor="product_internal_use_check"
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.07] cursor-pointer hover:border-white/15 transition"
          >
            <input
              id="product_internal_use_check"
              type="checkbox"
              checked={isInternalUse}
              onChange={(e) => setIsInternalUse(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-amber-500 bg-neutral-900 w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                Insumo de uso interno del salón
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5 leading-relaxed">
                Marca esta opción si es un gasto operativo (talco, hojas de afeitar, champú) que no debe aparecer para cobro directo en el POS.
              </span>
            </div>
          </label>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
