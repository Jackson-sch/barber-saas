'use client'

import { Scissors, Package, Search, Plus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Service, ServiceCategory, Product } from '@/types/database.types'

interface PosCatalogProps {
  services: Service[]
  categories: ServiceCategory[]
  products: Product[]
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

  return (
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
                type="button"
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
                  type="button"
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
                type="button"
                onClick={() => onAddService(svc)}
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
                    type="button"
                    disabled={isOut}
                    onClick={() => onAddProduct(prod)}
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
                        ) : (
                          <span />
                        )}
                        {isOut ? (
                          <span className="text-[10px] font-bold text-red-400">Agotado</span>
                        ) : isLow ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            Quedan {prod.stock}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-400">
                            {prod.stock} un.
                          </span>
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
  )
}
