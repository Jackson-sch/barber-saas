'use client'

import { useState } from 'react'
import { X, Loader2, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { closeCashShiftAction } from '@/actions/pos'
import { formatPrice } from '@/lib/utils'
import type { CashShift } from '@/types/database.types'

interface CloseShiftModalProps {
  isOpen: boolean
  onClose: () => void
  shift: CashShift
  cashSalesTotal: number
  expensesTotal?: number
  manualIncomesTotal?: number
  organizationId: string
  slug: string
}

export default function CloseShiftModal({
  isOpen,
  onClose,
  shift,
  cashSalesTotal,
  expensesTotal = 0,
  manualIncomesTotal = 0,
  organizationId,
  slug,
}: CloseShiftModalProps) {
  const expectedTotal =
    Number(shift.initial_cash || 0) +
    Number(cashSalesTotal || 0) +
    Number(manualIncomesTotal || 0) -
    Number(expensesTotal || 0)
  const [countedCash, setCountedCash] = useState(String(expectedTotal))
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const difference = (parseFloat(countedCash) || 0) - expectedTotal

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await closeCashShiftAction(
      shift.id,
      organizationId,
      parseFloat(countedCash) || 0,
      notes || null,
      slug
    )

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Arqueo y Cierre de Caja</h3>
              <p className="text-xs text-neutral-400">Verifica el efectivo físico en caja y finaliza el turno</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Balance Breakdown */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Fondo Inicial de Apertura:</span>
              <strong className="text-white">{formatPrice(Number(shift.initial_cash))}</strong>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>+ Ventas Cobradas en Efectivo:</span>
              <strong className="text-emerald-400">+{formatPrice(cashSalesTotal)}</strong>
            </div>
            {manualIncomesTotal > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>+ Ingresos Manuales / Inyección:</span>
                <strong className="text-cyan-400">+{formatPrice(manualIncomesTotal)}</strong>
              </div>
            )}
            {expensesTotal > 0 && (
              <div className="flex justify-between text-neutral-400">
                <span>- Gastos Menores & Adelantos:</span>
                <strong className="text-rose-400">-{formatPrice(expensesTotal)}</strong>
              </div>
            )}
            <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm text-white">
              <span>Efectivo Esperado en Gaveta:</span>
              <span className="text-amber-400">{formatPrice(expectedTotal)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Efectivo Físico Contado (S/ PEN) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              required
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-base font-bold focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Difference Alert */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              difference === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : difference > 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {difference === 0 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>
                {difference === 0
                  ? 'Caja Exacta'
                  : difference > 0
                  ? 'Sobrante en Caja'
                  : 'Faltante en Caja'}
              </span>
            </div>
            <span>{difference >= 0 ? `+${formatPrice(difference)}` : formatPrice(difference)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Notas de Cierre (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Se retiraron S/ 200 para depósito bancario"
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirmar Cierre de Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
