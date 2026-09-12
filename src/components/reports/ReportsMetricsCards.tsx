'use client'

import {
  TrendingUp,
  Wallet,
  Clock,
  Coins,
  ShieldCheck,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ReportsMetricsCardsProps {
  totalRevenue: number
  ticketCount: number
  averageTicket: number
  totalDiscounts: number
  totalTips: number
  totalCommissionsEarned: number
  totalCommissionsPaid: number
  totalCommissionsPending: number
  netShopProfit: number
}

export default function ReportsMetricsCards({
  totalRevenue,
  ticketCount,
  averageTicket,
  totalDiscounts,
  totalTips,
  totalCommissionsEarned,
  totalCommissionsPaid,
  totalCommissionsPending,
  netShopProfit,
}: ReportsMetricsCardsProps) {
  const marginPercentage =
    totalRevenue > 0 ? ((netShopProfit / totalRevenue) * 100).toFixed(0) : '0'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Facturación Bruta */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 transition group relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Facturación Total
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {formatPrice(totalRevenue)}
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>{ticketCount} tickets emitidos</span>
          {totalDiscounts > 0 && (
            <span className="text-red-400">-{formatPrice(totalDiscounts)} desc.</span>
          )}
        </div>
      </div>

      {/* KPI 2: Margen Neto del Salón */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 transition group relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Margen Neto del Negocio
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-400 tracking-tight">
            {formatPrice(netShopProfit)}
          </span>
          <span className="text-xs text-neutral-400 font-mono">({marginPercentage}%)</span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Tras comisiones</span>
          <span className="text-neutral-300">
            Com: {formatPrice(totalCommissionsEarned)}
          </span>
        </div>
      </div>

      {/* KPI 3: Comisiones Pendientes por Liquidar */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 transition group relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Comisiones por Pagar
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              totalCommissionsPending > 0
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {totalCommissionsPending > 0 ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Wallet className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="mt-3">
          <span
            className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
              totalCommissionsPending > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {formatPrice(totalCommissionsPending)}
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Pagado: {formatPrice(totalCommissionsPaid)}</span>
          {totalCommissionsPending > 0 ? (
            <span className="text-amber-400 font-semibold">Pendiente</span>
          ) : (
            <span className="text-emerald-400">Al día</span>
          )}
        </div>
      </div>

      {/* KPI 4: Ticket Promedio & Propinas */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 transition group relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {formatPrice(averageTicket)}
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Propinas:</span>
          <span className="text-amber-400 font-medium">+{formatPrice(totalTips)}</span>
        </div>
      </div>
    </div>
  )
}
