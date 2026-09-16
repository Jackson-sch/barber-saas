import { formatPrice } from '@/lib/utils'
import type { CashShift } from '@/types/database.types'

interface CajaMetricsGridProps {
  currentShift: CashShift
  totalCashAmount: number
  totalDigitalAmount: number
  totalExpenses: number
  totalManualIncomes: number
  expectedCashInDrawer: number
  cashSalesCount: number
  digitalSalesCount: number
  expensesCount: number
}

export default function CajaMetricsGrid({
  currentShift,
  totalCashAmount,
  totalDigitalAmount,
  totalExpenses,
  totalManualIncomes,
  expectedCashInDrawer,
  cashSalesCount,
  digitalSalesCount,
  expensesCount,
}: CajaMetricsGridProps) {
  return (
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
        <span className="text-[11px] text-neutral-500 mt-1 block">{cashSalesCount} cobros en efectivo</span>
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
          {expensesCount} egreso{expensesCount !== 1 ? 's' : ''} en turno
        </span>
      </div>

      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
        <span className="text-xs text-purple-400 font-medium">Digital (Yape/Plin/POS)</span>
        <p className="text-xl font-bold text-purple-400 mt-1">
          {formatPrice(totalDigitalAmount)}
        </p>
        <span className="text-[11px] text-neutral-500 mt-1 block">{digitalSalesCount} transferencias/tarjeta</span>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <span className="text-xs text-amber-400 font-medium">Efectivo en Gaveta</span>
        <p className="text-2xl font-extrabold text-amber-400 mt-1">
          {formatPrice(expectedCashInDrawer)}
        </p>
        <span className="text-[11px] text-neutral-400 mt-1 block">Fondo + Efectivo - Gastos</span>
      </div>
    </div>
  )
}
