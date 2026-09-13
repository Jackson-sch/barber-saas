'use client'

import { useState } from 'react'
import {
  Wallet,
  Clock,
  ArrowUpRight,
  Plus,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  DollarSign,
  Printer,
  TrendingDown,
  TrendingUp,
  Receipt,
  User,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import OpenShiftModal from './OpenShiftModal'
import CloseShiftModal from './CloseShiftModal'
import CashMovementModal from './CashMovementModal'
import TicketReceiptModal, { type SaleReceiptData } from './TicketReceiptModal'
import Link from 'next/link'
import type { CashShift, Sale, CashMovement, OrganizationMember } from '@/types/database.types'

export interface SaleWithDetails extends Sale {
  client?: { full_name: string; phone?: string | null } | null
  items?: Array<{
    name: string
    quantity: number
    unit_price: number
    subtotal: number
    barberName?: string | null
  }>
}

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
                "{currentShift.notes}"
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-medium">Fondo Inicial</span>
              <p className="text-xl font-bold text-white mt-1">
                {formatPrice(Number(currentShift.initial_cash))}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">Caja chica de apertura</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-emerald-400 font-medium">+ Efectivo Cobrado</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {formatPrice(totalCashAmount)}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">{cashSales.length} cobros en efectivo</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400 font-medium">- Gastos / Retiros</span>
                {totalManualIncomes > 0 && (
                  <span className="text-[10px] text-cyan-400 font-mono">+{formatPrice(totalManualIncomes)}</span>
                )}
              </div>
              <p className="text-xl font-bold text-rose-400 mt-1">
                -{formatPrice(totalExpenses)}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                {currentExpenses.length} egreso{currentExpenses.length !== 1 ? 's' : ''} en turno
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-purple-400 font-medium">Digital (Yape/Plin/POS)</span>
              <p className="text-xl font-bold text-purple-400 mt-1">
                {formatPrice(totalDigitalAmount)}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">{digitalSales.length} transferencias/tarjeta</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs text-amber-400 font-medium">Efectivo en Gaveta</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatPrice(expectedCashInDrawer)}
              </p>
              <span className="text-[11px] text-neutral-400 mt-1 block">Fondo + Efectivo - Gastos</span>
            </div>
          </div>
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
            currentShiftSales.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-neutral-800/60 rounded-xl">
                <p className="text-xs text-neutral-500">Aún no se han registrado cobros en este turno.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
                {currentShiftSales.map((s) => {
                  const timeStr = new Date(s.created_at).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const badge = paymentLabels[s.payment_method] || paymentLabels.CASH

                  return (
                    <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-500">{timeStr}</span>
                        <div>
                          <p className="font-medium text-white">{s.client?.full_name || 'Cliente Casual'}</p>
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-white block">{formatPrice(Number(s.total))}</span>
                          {Number(s.tip) > 0 && (
                            <p className="text-[10px] text-amber-400">+ Propina: {formatPrice(Number(s.tip))}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceipt({
                              id: s.id,
                              total: Number(s.total),
                              subtotal: Number(s.subtotal || s.total),
                              discount: Number(s.discount || 0),
                              tip: Number(s.tip || 0),
                              paymentMethod: s.payment_method || 'CASH',
                              createdAt: new Date(s.created_at).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }),
                              clientName: s.client?.full_name || 'Cliente Casual',
                              clientPhone: s.client?.phone || null,
                              items:
                                s.items && s.items.length > 0
                                  ? s.items
                                  : [
                                      {
                                        name: 'Consumo registrado',
                                        quantity: 1,
                                        unit_price: Number(s.total),
                                        subtotal: Number(s.total),
                                      },
                                    ],
                            })
                          }}
                          className="py-1 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Ver e imprimir ticket térmico o enviar por WhatsApp"
                        >
                          <Printer className="w-3 h-3 text-amber-400" />
                          <span>Ticket</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            /* Tab: Gastos & Retiros de Caja */
            currentShiftMovements.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-neutral-800/60 rounded-xl space-y-2">
                <p className="text-xs text-neutral-500">No hay gastos ni salidas manuales de caja en este turno.</p>
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Registrar Primer Gasto o Salida</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
                {currentShiftMovements.map((mov) => {
                  const timeStr = new Date(mov.created_at).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const isExpense = mov.type === 'EXPENSE'
                  const catLabel = movementCategoryLabels[mov.category] || mov.category
                  const barberAssigned = mov.barber_id ? barberMap.get(mov.barber_id) : null

                  return (
                    <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-500">{timeStr}</span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                isExpense
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              }`}
                            >
                              {isExpense ? 'Egreso / Gasto' : 'Ingreso / Inyección'}
                            </span>
                            <span className="font-medium text-neutral-300">{catLabel}</span>
                          </div>
                          <p className="text-neutral-400 text-[11px]">{mov.description}</p>
                          {barberAssigned && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                              <User className="w-3 h-3" />
                              <span>Barbero: {barberAssigned}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-bold font-mono text-sm block ${
                            isExpense ? 'text-rose-400' : 'text-cyan-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatPrice(Number(mov.amount))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* Historial de Turnos Anteriores */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-white text-sm">Historial de Turnos Cerrados</h3>
        </div>

        {pastShifts.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">No hay turnos anteriores registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="pb-3">Apertura</th>
                  <th className="pb-3">Cierre</th>
                  <th className="pb-3">Fondo Inicial</th>
                  <th className="pb-3">Esperado</th>
                  <th className="pb-3">Contado</th>
                  <th className="pb-3">Diferencia</th>
                  <th className="pb-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {pastShifts.map((sh) => {
                  const openedDate = new Date(sh.opened_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const closedDate = sh.closed_at
                    ? new Date(sh.closed_at).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'
                  const diff = Number(sh.difference || 0)

                  return (
                    <tr key={sh.id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                      <td className="py-3 font-medium text-white">{openedDate}</td>
                      <td className="py-3">{closedDate}</td>
                      <td className="py-3">{formatPrice(Number(sh.initial_cash))}</td>
                      <td className="py-3">{formatPrice(Number(sh.expected_cash || 0))}</td>
                      <td className="py-3 font-semibold text-white">
                        {formatPrice(Number(sh.final_cash || 0))}
                      </td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            diff === 0
                              ? 'text-emerald-400'
                              : diff > 0
                              ? 'text-blue-400'
                              : 'text-red-400'
                          }`}
                        >
                          {diff >= 0 ? `+${formatPrice(diff)}` : formatPrice(diff)}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-400 max-w-xs truncate">{sh.notes || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
