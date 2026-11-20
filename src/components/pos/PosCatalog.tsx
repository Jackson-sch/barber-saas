'use client'

import Link from 'next/link'
import { Scissors, Package, Search, Plus, Clock, X, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CartItemInput } from '@/actions/pos'
import type { Service, ServiceCategory, Product } from '@/types/database.types'

interface PosCatalogProps {
  services: Service[]
  categories: ServiceCategory[]
  products: Product[]
  cart: CartItemInput[]
  slug?: string
  catalogTab: 'SERVICES' | 'PRODUCTS'
  setCatalogTab: (tab: 'SERVICES' | 'PRODUCTS') => void
  selectedCategory: string
  setSelectedCategory: (catId: string) => void
  searchService: string
  setSearchService: (s: string) => void
  searchProduct: string
  setSearchProduct: (p: string) => void
  onAddService: (svc: Service) => void
  onAddProduct: (prod: Product) => void
}

export default function PosCatalog({
  services,
  categories,
  products,
  cart,
  slug,
  catalogTab,
  setCatalogTab,
  selectedCategory,
  setSelectedCategory,
  searchService,
  setSearchService,
  searchProduct,
  setSearchProduct,
  onAddService,
  onAddProduct,
}: PosCatalogProps) {
  // Mapa rápido de cantidades en el ticket actual
  const serviceQtyMap = new Map<string, number>()
  const productQtyMap = new Map<string, number>()
  for (const item of cart) {
    if (item.item_type === 'SERVICE' && item.service_id) {
      serviceQtyMap.set(item.service_id, (serviceQtyMap.get(item.service_id) || 0) + item.quantity)
    } else if (item.item_type === 'PRODUCT' && item.product_id) {
      productQtyMap.set(item.product_id, (productQtyMap.get(item.product_id) || 0) + item.quantity)
    }
  }

  // Conteo por categoría
  const categoryCountMap = new Map<string, number>()
  for (const svc of services) {
    if (svc.category_id) {
      categoryCountMap.set(svc.category_id, (categoryCountMap.get(svc.category_id) || 0) + 1)
    }
  }

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

  const activeSearch = catalogTab === 'SERVICES' ? searchService : searchProduct
  const setActiveSearch = catalogTab === 'SERVICES' ? setSearchService : setSearchProduct

  return (
    <div className="lg:col-span-7 space-y-4">
      {/* Barra de Control Unificada: Tabs + Buscador + Píldoras de Categorías */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Selector Segmentado Servicios / Productos */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090A0E] border border-white/[0.06] flex-1">
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
              <span>Servicios</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  catalogTab === 'SERVICES'
                    ? 'bg-black/15 text-black'
                    : 'bg-white/[0.06] text-neutral-400'
                }`}
              >
                {services.length}
              </span>
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
              <span>Productos</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  catalogTab === 'PRODUCTS'
                    ? 'bg-black/15 text-black'
                    : 'bg-white/[0.06] text-neutral-400'
                }`}
              >
                {products.length}
              </span>
            </button>
          </div>

          {/* Buscador con Botón Limpiar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              aria-label={
                catalogTab === 'SERVICES'
                  ? 'Buscar servicio...'
                  : 'Buscar producto por nombre, SKU o código...'
              }
              type="text"
              placeholder={
                catalogTab === 'SERVICES'
                  ? 'Buscar servicio...'
                  : 'Buscar nombre, SKU o código...'
              }
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
            {activeSearch && (
              <button
                type="button"
                onClick={() => setActiveSearch('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Píldoras de Categorías (Solo en Servicios) */}
        {catalogTab === 'SERVICES' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  : 'bg-[#090A0E] text-neutral-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] font-mono opacity-75">{services.length}</span>
            </button>
            {categories.map((cat) => {
              const count = categoryCountMap.get(cat.id) || 0
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                      : 'bg-[#090A0E] text-neutral-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] font-mono opacity-75">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Grilla de Servicios o Productos */}
      {catalogTab === 'SERVICES' ? (
        filteredServices.length === 0 ? (
          <div className="py-12 text-center bg-[#0D0E15] rounded-2xl border border-white/[0.06] text-neutral-500 text-xs">
            <Scissors className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
            <p className="font-semibold text-neutral-300">No se encontraron servicios</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {searchService
                ? 'Prueba con otro término de búsqueda o limpia el filtro.'
                : 'Agrega servicios desde el módulo Servicios & Precios.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredServices.map((svc) => {
              const qtyInCart = serviceQtyMap.get(svc.id) || 0
              const isInCart = qtyInCart > 0
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => onAddService(svc)}
                  className={`relative p-3.5 rounded-2xl border transition flex flex-col justify-between text-left group cursor-pointer min-h-[124px] ${
                    isInCart
                      ? 'border-amber-500/60 bg-amber-500/[0.06] shadow-lg shadow-amber-500/5'
                      : 'bg-[#0D0E15] border-white/[0.08] hover:border-amber-500/45 hover:bg-[#12141E]'
                  }`}
                >
                  {/* Fila Superior: Icono + Badge de cantidad si está en carrito */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition ${
                          isInCart
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/[0.04] border-white/[0.08] text-neutral-400 group-hover:text-amber-400 group-hover:border-amber-500/30'
                        }`}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                      </div>
                      {isInCart && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono font-extrabold text-[10px] shadow-sm">
                          {qtyInCart}x
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug group-hover:text-amber-300 transition line-clamp-2">
                      {svc.name}
                    </h4>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-300 font-mono tabular-nums">
                        <Clock className="w-2.5 h-2.5 text-neutral-400" />
                        {svc.duration_minutes} min
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 tabular-nums">
                        {svc.commission_percent}% com.
                      </span>
                    </div>
                  </div>

                  {/* Pie de Tarjeta: Precio y botón + */}
                  <div className="flex items-center justify-between w-full mt-3 pt-2.5 border-t border-white/[0.06]">
                    <span className="font-extrabold text-sm text-amber-400 tabular-nums">
                      {formatPrice(Number(svc.price))}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        isInCart
                          ? 'bg-amber-500 text-black'
                          : 'bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center bg-[#0D0E15] rounded-2xl border border-white/[0.06] text-neutral-500 text-xs space-y-2.5">
          <Package className="w-9 h-9 mx-auto text-neutral-600" />
          <div>
            <p className="font-semibold text-neutral-300">
              {products.length === 0
                ? 'Aún no hay productos para reventa'
                : 'No se encontraron productos con ese filtro'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {products.length === 0
                ? 'Registra pomadas, ceras o lociones para venderlas desde el POS.'
                : 'Prueba buscando por otro nombre, SKU o código de barras.'}
            </p>
          </div>
          {products.length === 0 && slug && (
            <Link
              href={`/app/${slug}/inventario`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition"
            >
              <span>Ir a Inventario & Stock</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((prod) => {
            const isOut = prod.stock <= 0
            const isLow = prod.stock <= prod.min_stock && !isOut
            const qtyInCart = productQtyMap.get(prod.id) || 0
            const isInCart = qtyInCart > 0

            return (
              <button
                key={prod.id}
                type="button"
                disabled={isOut}
                onClick={() => onAddProduct(prod)}
                className={`relative p-3.5 rounded-2xl border transition flex flex-col justify-between text-left group min-h-[124px] ${
                  isOut
                    ? 'bg-neutral-950/40 border-white/[0.04] opacity-40 cursor-not-allowed'
                    : isInCart
                      ? 'border-amber-500/60 bg-amber-500/[0.06] shadow-lg shadow-amber-500/5 cursor-pointer'
                      : 'bg-[#0D0E15] border-white/[0.08] hover:border-amber-500/45 hover:bg-[#12141E] cursor-pointer'
                }`}
              >
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono tabular-nums ${
                        isOut
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : isLow
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOut ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                      {isOut ? 'Agotado' : `${prod.stock} un.`}
                    </span>

                    {isInCart ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono font-extrabold text-[10px] shadow-sm">
                        {qtyInCart}x
                      </span>
                    ) : prod.sku ? (
                      <span className="text-[9px] font-mono text-neutral-500 uppercase truncate max-w-[75px]">
                        {prod.sku}
                      </span>
                    ) : null}
                  </div>

                  <h4 className="font-bold text-white text-xs leading-snug group-hover:text-amber-300 transition line-clamp-2">
                    {prod.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between w-full mt-3 pt-2.5 border-t border-white/[0.06]">
                  <span className="font-extrabold text-sm text-amber-400 tabular-nums">
                    {formatPrice(Number(prod.sale_price))}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      isInCart
                        ? 'bg-amber-500 text-black'
                        : 'bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
