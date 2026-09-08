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
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import OpenShiftModal from './OpenShiftModal'
import CloseShiftModal from './CloseShiftModal'
import Link from 'next/link'
import type { CashShift, Sale } from '@/types/database.types'

interface SaleWithDetails extends Sale {
  client?: { full_name: string } | null
}

interface CajaClientProps {
  currentShift: CashShift | null
  currentShiftSales: SaleWithDetails[]
  pastShifts: CashShift[]
  organizationId: string
  slug: string
}

export default function CajaClient({
  currentShift,
  currentShiftSales,
  pastShifts,
  organizationId,
  slug,
}: CajaClientProps) {
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)

  // Cálculos del turno actual
  const cashSales = currentShiftSales.filter((s) => s.payment_method === 'CASH')
  const digitalSales = currentShiftSales.filter((s) => s.payment_method !== 'CASH')

  const totalCashAmount = cashSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const totalDigitalAmount = digitalSales.reduce((acc, s) => acc + Number(s.total || 0), 0)
  const totalTurno = totalCashAmount + totalDigitalAmount
  const expectedCashInDrawer = currentShift ? Number(currentShift.initial_cash || 0) + totalCashAmount : 0

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-medium">Fondo Inicial</span>
              <p className="text-xl font-bold text-white mt-1">
                {formatPrice(Number(currentShift.initial_cash))}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">Caja chica de apertura</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-emerald-400 font-medium">+ Efectivo Recaudado</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {formatPrice(totalCashAmount)}
              </p>
              <span className="text-[11px] text-neutral-500 mt-1 block">{cashSales.length} cobros en efectivo</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-purple-400 font-medium">Digital (Yape/Plin/Tarjeta)</span>
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
              <span className="text-[11px] text-neutral-400 mt-1 block">Total que debe haber físicamente</span>
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

      {/* Sales of current shift */}
      {currentShift && (
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">
              Ventas Realizadas en este Turno ({currentShiftSales.length})
            </h3>
            <span className="text-xs text-neutral-400">
              Total facturado: <strong className="text-white">{formatPrice(totalTurno)}</strong>
            </span>
          </div>

          {currentShiftSales.length === 0 ? (
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

                    <div className="text-right">
                      <span className="font-bold text-white">{formatPrice(Number(s.total))}</span>
                      {Number(s.tip) > 0 && (
                        <p className="text-[10px] text-amber-400">+ Propina: {formatPrice(Number(s.tip))}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
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
        <CloseShiftModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          shift={currentShift}
          cashSalesTotal={totalCashAmount}
          organizationId={organizationId}
          slug={slug}
        />
      )}
    </div>
  )
}
