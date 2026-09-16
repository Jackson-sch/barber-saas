'use client'

import { useRouter } from 'next/navigation'
import { Wallet, AlertCircle, Lock } from 'lucide-react'
import { usePosState } from './usePosState'
import { formatPrice } from '@/lib/utils'
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

  // Categorías
  const filteredCategories = categories.filter((c) =>
    services.some((s) => s.category_id === c.id)
  )

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
