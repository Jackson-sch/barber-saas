'use client'

import { useState } from 'react'
import {
  Wallet,
  Plus,
  CreditCard,
  TrendingDown,
  Receipt,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import OpenShiftModal from './OpenShiftModal'
import CloseShiftModal from './CloseShiftModal'
import CashMovementModal from './CashMovementModal'
import TicketReceiptModal, { type SaleReceiptData } from './TicketReceiptModal'
import Link from 'next/link'
import CajaMetricsGrid from './caja/CajaMetricsGrid'
import CajaSalesList from './caja/CajaSalesList'
import CajaMovementsList from './caja/CajaMovementsList'
import PastShiftsTable from './caja/PastShiftsTable'
import type { SaleWithDetails } from './caja/types'
import type { CashShift, CashMovement, OrganizationMember } from '@/types/database.types'

interface CajaClientProps {
  currentShift: CashShift | null
  currentShiftSales: SaleWithDetails[]
  currentShiftMovements?: CashMovement[]
  barbers?: OrganizationMember[]
  pastShifts: CashShift[]
  organizationId: string
  organizationInfo?: {
    name: string
    address?: string | null
    phone?: string | null
    city?: string | null
    logoUrl?: string | null
  }
  slug: string
}

export default function CajaClient({
  currentShift,
  currentShiftSales,
  currentShiftMovements = [],
  barbers = [],
  pastShifts,
  organizationId,
  organizationInfo,
  slug,
}: CajaClientProps) {
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'SALES' | 'MOVEMENTS'>('SALES')
  const [selectedReceipt, setSelectedReceipt] = useState<SaleReceiptData | null>(null)

  // Cálculos del turno actual
  const currentExpenses = currentShiftMovements.filter((m) => m.type === 'EXPENSE')
  const currentIncomes = currentShiftMovements.filter((m) => m.type === 'INCOME')

  const totalExpenses = currentExpenses.reduce((acc, m) => acc + Number(m.amount || 0), 0)
  const totalManualIncomes = currentIncomes.reduce((acc, m) => acc + Number(m.amount || 0), 0)

  const cashSales = currentShiftSales.filter((s) => s.payment_method === 'CASH')
  const digitalSales = currentShiftSales.filter((s) => s.payment_method !== 'CASH')

  const totalCashAmount = cashSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const totalDigitalAmount = digitalSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const totalTurno = totalCashAmount + totalDigitalAmount
  const expectedCashInDrawer = currentShift
    ? Number(currentShift.initial_cash || 0) + totalCashAmount + totalManualIncomes - totalExpenses
    : 0

  const barberMap = new Map(barbers.map((b) => [b.id, b.nickname || b.full_name]))

  const movementCategoryLabels: Record<string, string> = {
    INSUMOS: 'Insumos de Barbería',
    LIMPIEZA_CAFETERIA: 'Limpieza, Agua & Cafetería',
    ADELANTO_BARBERO: 'Adelanto a Barbero',
    SERVICIOS_DELIVERY: 'Delivery & Envíos',
    ALIMENTACION: 'Refrigerio / Alimentación',
    INYECCION_FONDO: 'Inyección de Cambio / Fondo Extra',
    OTROS: 'Otro Concepto',
  }

  const paymentLabels: Record<string, { label: string; color: string }> = {
    CASH: { label: 'Efectivo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    YAPE: { label: 'Yape', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    PLIN: { label: 'Plin', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    CARD: { label: 'Tarjeta', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    TRANSFER: { label: 'Transferencia', color: 'bg-neutral-800 text-neutral-300 border-neutral-700' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Control de Caja & Turnos
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Apertura, arqueos en vivo, corte diario y control de ingresos en efectivo y digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentShift ? (
            <>
              <Link
                href={`/app/${slug}/pos`}
                className="py-2 px-3.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Cobrar en POS</span>
              </Link>
              <button
                onClick={() => setIsMovementModalOpen(true)}
                className="py-2 px-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>- Registrar Gasto</span>
              </button>
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Arqueo & Cerrar Caja</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenModalOpen(true)}
              className="py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Turno de Caja</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Shift Status Card */}
      {currentShift ? (
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Turno Activo en Curso
                </span>
                <p className="text-xs text-neutral-400">
                  Abierto hoy a las{' '}
                  {new Date(currentShift.opened_at).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {currentShift.notes && (
              <span className="text-xs text-neutral-400 italic bg-neutral-950 px-3 py-1 rounded-lg border border-neutral-800">
                &ldquo;{currentShift.notes}&rdquo;
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <CajaMetricsGrid
            currentShift={currentShift}
            totalCashAmount={totalCashAmount}
            totalDigitalAmount={totalDigitalAmount}
            totalExpenses={totalExpenses}
            totalManualIncomes={totalManualIncomes}
            expectedCashInDrawer={expectedCashInDrawer}
            cashSalesCount={cashSales.length}
            digitalSalesCount={digitalSales.length}
            expensesCount={currentExpenses.length}
          />
        </div>
      ) : (
        <div className="py-14 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30 p-6">
          <Wallet className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No hay ningún turno de caja abierto</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Abre la caja ingresando tu fondo de sencillo inicial para poder registrar ventas y cobros en el punto de venta.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Turno de Caja Ahora</span>
          </button>
        </div>
      )}

      {/* Sales & Cash Movements of current shift */}
      {currentShift && (
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('SALES')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'SALES'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Ventas del Turno ({currentShiftSales.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MOVEMENTS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'MOVEMENTS'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Gastos & Retiros ({currentShiftMovements.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {activeTab === 'SALES' ? (
                <span className="text-neutral-400">
                  Total facturado: <strong className="text-white">{formatPrice(totalTurno)}</strong>
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400">
                    Total egresos: <strong className="text-rose-400">-{formatPrice(totalExpenses)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMovementModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer border border-rose-500/30"
                  >
                    <Plus className="w-3 h-3 text-rose-400" />
                    <span>Registrar Gasto</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'SALES' ? (
            <CajaSalesList
              sales={currentShiftSales}
              paymentLabels={paymentLabels}
              onSelectReceipt={setSelectedReceipt}
            />
          ) : (
            <CajaMovementsList
              movements={currentShiftMovements}
              movementCategoryLabels={movementCategoryLabels}
              barberMap={barberMap}
              onOpenMovementModal={() => setIsMovementModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* Historial de Turnos Anteriores */}
      <PastShiftsTable shifts={pastShifts} />

      {/* Modals */}
      <OpenShiftModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        organizationId={organizationId}
        slug={slug}
      />

      {currentShift && (
        <>
          <CloseShiftModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            shift={currentShift}
            cashSalesTotal={totalCashAmount}
            expensesTotal={totalExpenses}
            manualIncomesTotal={totalManualIncomes}
            organizationId={organizationId}
            slug={slug}
          />

          <CashMovementModal
            isOpen={isMovementModalOpen}
            onClose={() => setIsMovementModalOpen(false)}
            shiftId={currentShift.id}
            organizationId={organizationId}
            barbers={barbers}
            slug={slug}
          />
        </>
      )}

      {/* Modal de Comprobante / Ticket Térmico */}
      <TicketReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
        organization={organizationInfo || { name: 'Barbería' }}
        slug={slug}
      />
    </div>
  )
}
