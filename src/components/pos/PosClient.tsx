'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wallet, Lock, ArrowUpRight, Sparkles } from 'lucide-react'
import { usePosState } from './usePosState'
import { formatPrice } from '@/lib/utils'
import OpenShiftModal from './OpenShiftModal'
import PosCatalog from './PosCatalog'
import PosTicket from './PosTicket'
import TicketReceiptModal from './TicketReceiptModal'
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
    logoUrl?: string | null
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

  const {
    cart,
    setCart,
    catalogTab,
    setCatalogTab,
    selectedCategory,
    setSelectedCategory,
    searchService,
    setSearchService,
    searchProduct,
    setSearchProduct,
    clientType,
    setClientType,
    selectedClientId,
    setSelectedClientId,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    isRedeemingLoyalty,
    discount,
    setDiscount,
    tip,
    setTip,
    paymentMethod,
    setPaymentMethod,
    loading,
    isOpenShiftModalOpen,
    setIsOpenShiftModalOpen,
    completedReceipt,
    error,
    subtotal,
    discountVal,
    tipVal,
    total,
    handleApplyLoyaltyReward,
    handleRemoveLoyaltyReward,
    handleAddService,
    handleAddProduct,
    handleUpdateQuantity,
    handleRemoveItem,
    handleAssignBarber,
    handleCheckout,
    handleResetSale,
  } = usePosState({
    services,
    barbers,
    clients,
    products,
    currentShift,
    organizationId,
    slug,
    preloadAppointment,
    loyaltyProgram,
  })

  function handleAssignBarberToAll(barberId: string) {
    setCart((prev) => prev.map((item) => ({ ...item, barber_id: barberId || null })))
  }

  return (
    <div className="space-y-5">
      {/* Cabecera Terminal POS + Status Pill Único de Caja */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-3 h-3" />
              Terminal de Cobro
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Punto de Venta (POS)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cobro rápido de servicios, productos, propinas y comisiones automáticas.
          </p>
        </div>

        {/* Único Status Pill / CTA de Turno de Caja */}
        {currentShift ? (
          <Link
            href={`/app/${slug}/caja`}
            className="inline-flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-xs transition group self-start md:self-auto"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <div>
                <span className="font-bold text-emerald-300 block leading-tight">Caja Abierta</span>
                <span className="text-[11px] text-emerald-400/80 font-mono tabular-nums">
                  Fondo inicial: {formatPrice(Number(currentShift.initial_cash))}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300/90 group-hover:text-emerald-200 pl-2 border-l border-emerald-500/20">
              <span>Ver Caja</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 self-stretch md:self-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block leading-tight">
                  Caja Cerrada • Apertura requerida
                </span>
                <span className="text-[11px] text-amber-300/80">
                  Abre el turno con fondo inicial para habilitar los cobros.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="py-2 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Aperturar Caja Ahora</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Principal Terminal POS: Catálogo (7 cols) + Ticket Sticky (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <PosCatalog
          services={services}
          categories={categories}
          products={products}
          cart={cart}
          slug={slug}
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
          organizationId={organizationId}
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
          onAssignBarberToAll={handleAssignBarberToAll}
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
