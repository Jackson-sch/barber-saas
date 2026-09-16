'use client'

import {
  CreditCard,
  Scissors,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type {
  DailySalesStat,
  PaymentMethodStat,
  TopItemStat,
} from '@/actions/reports'

interface ReportsSalesTabProps {
  dailyTrend: DailySalesStat[]
  paymentMethods: PaymentMethodStat[]
  topServices: TopItemStat[]
  topProducts: TopItemStat[]
  totalRevenue: number
}

export default function ReportsSalesTab({
  dailyTrend,
  paymentMethods,
  topServices,
  topProducts,
  totalRevenue,
}: ReportsSalesTabProps) {
  // Calcular valor máximo para escalar las barras de tendencia
  const maxDailyRevenue = Math.max(...dailyTrend.map((d) => d.total), 100)

  return (
    <div className="space-y-6">
      {/* 1. Tendencia de Facturación Diaria */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Evolución de Ingresos por Día
              </h3>
              <p className="text-xs text-neutral-400">
                Facturación diaria y volumen de tickets en el período
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            Total Período: {formatPrice(totalRevenue)}
          </span>
        </div>

        {dailyTrend.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No se registraron ventas en el rango de fechas seleccionado.
          </div>
        ) : (
          <div className="pt-2">
            {/* Gráfico visual de barras CSS */}
            <div className="pt-14 pb-2 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
              <div className="flex items-end gap-2 sm:gap-3 h-44 sm:h-52 min-w-full">
                {dailyTrend.map((item) => {
                  const heightPercent = Math.max(
                    8,
                    Math.round((item.total / maxDailyRevenue) * 100)
                  )
                  return (
                    <div
                      key={item.date}
                      className="flex-1 min-w-[42px] max-w-[64px] flex flex-col items-center justify-end h-full group relative hover:z-30"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition duration-150 bg-[#090A0E] border border-white/20 text-white text-[11px] font-mono py-1.5 px-3 rounded-xl pointer-events-none shadow-2xl z-50 whitespace-nowrap flex items-center gap-1.5 ring-1 ring-black/50">
                        <span className="font-medium text-neutral-300">{item.label}:</span>
                        <span className="font-extrabold text-amber-400">{formatPrice(item.total)}</span>
                        <span className="text-[10px] text-neutral-400">({item.count} tickets)</span>
                      </div>

                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-amber-500/30 to-amber-400 group-hover:to-amber-300 transition cursor-pointer relative"
                      >
                        {item.total > 0 && (
                          <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neutral-400 truncate pointer-events-none">
                            {Math.round(item.total)}
                          </span>
                        )}
                      </div>

                      {/* Date label */}
                      <span className="text-[10px] font-mono text-neutral-400 mt-2 truncate max-w-full">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Distribución por Métodos de Pago */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Distribución por Métodos de Pago
            </h3>
            <p className="text-xs text-neutral-400">
              Desglose de recaudación en efectivo, billeteras digitales y tarjetas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {paymentMethods.map((pm) => (
            <div
              key={pm.method}
              className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-tight">
                  {pm.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 font-semibold">
                  {pm.percentage}%
                </span>
              </div>

              <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pm.percentage}%` }}
                  className={`h-full rounded-full ${
                    pm.method === 'CASH'
                      ? 'bg-emerald-500'
                      : pm.method === 'YAPE'
                      ? 'bg-purple-500'
                      : pm.method === 'PLIN'
                      ? 'bg-cyan-500'
                      : pm.method === 'CARD'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="font-extrabold text-white">
                  {formatPrice(pm.total)}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {pm.count} tx{pm.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Rankings: Top Servicios vs Top Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top Servicios */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Servicios Más Rentables
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Por facturación</span>
          </div>

          {topServices.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No hay servicios registrados en este período.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topServices.map((svc, index) => (
                <div
                  key={svc.id}
                  className="p-3 rounded-xl bg-[#090A0E] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                        index === 0
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/[0.05] text-neutral-300 border border-white/10'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white truncate">{svc.name}</h4>
                      <span className="text-[10px] text-neutral-400">
                        {svc.quantity} atención{svc.quantity !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-white text-right shrink-0">
                    {formatPrice(svc.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Productos */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">
                Productos con Mayor Venta
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Por facturación</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No hay productos vendidos en este período.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((prod, index) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-[#090A0E] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                        index === 0
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/[0.05] text-neutral-300 border border-white/10'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white truncate">{prod.name}</h4>
                      <span className="text-[10px] text-neutral-400">
                        {prod.quantity} unidad{prod.quantity !== 1 ? 'es' : ''} vendida{prod.quantity !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-white text-right shrink-0">
                    {formatPrice(prod.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
