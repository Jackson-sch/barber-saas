'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function RoiCalculator() {
  const [barbersCount, setBarbersCount] = useState(4)
  const [cutsPerDay, setCutsPerDay] = useState(10)
  const [averagePrice, setAveragePrice] = useState(40)

  // Monthly estimations (26 working days)
  const totalMonthlyServices = barbersCount * cutsPerDay * 26
  const monthlyRevenue = totalMonthlyServices * averagePrice

  // Estimated recovery:
  // 1. WhatsApp reduces 2 no-shows per barber/week = 8 recovered cuts/month per barber
  const noShowRecoveredRevenue = barbersCount * 8 * averagePrice

  // 2. Loyalty stamps increases repeat visits by ~10%
  const loyaltyBonusRevenue = monthlyRevenue * 0.08

  // Total recovered per month
  const totalEstimatedGain = Math.round(noShowRecoveredRevenue + loyaltyBonusRevenue)

  // Plan Pro cost: S/ 99/month
  const proCost = 99
  const roiMultiple = (totalEstimatedGain / proCost).toFixed(1)

  return (
    <section id="calculadora" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06] scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculadora de Impacto Financiero</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          ¿Cuánto dinero gana de más tu barbería con BarberOS?
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Descubre el retorno de inversión real al eliminar citas canceladas sin aviso y duplicar la fidelidad de tus clientes habituales.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0E1017] border border-white/[0.08] space-y-6 shadow-2xl">
          {/* Slider 1: Barbers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-bold uppercase tracking-wider">Número de Barberos / Sillas</span>
              <span className="text-base font-extrabold text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20">
                {barbersCount} {barbersCount === 1 ? 'barbero' : 'barberos'}
              </span>
            </div>
            <input aria-label="input"
              type="range"
              min={1}
              max={15}
              value={barbersCount}
              onChange={(e) => setBarbersCount(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>1 silla</span>
              <span>8 sillas</span>
              <span>15 sillas</span>
            </div>
          </div>

          {/* Slider 2: Cuts per day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-bold uppercase tracking-wider">Cortes al día por Barbero</span>
              <span className="text-base font-extrabold text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20">
                {cutsPerDay} servicios/día
              </span>
            </div>
            <input aria-label="input"
              type="range"
              min={4}
              max={25}
              value={cutsPerDay}
              onChange={(e) => setCutsPerDay(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>4 cortes</span>
              <span>15 cortes</span>
              <span>25 cortes</span>
            </div>
          </div>

          {/* Slider 3: Average Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-bold uppercase tracking-wider">Ticket Promedio por Servicio</span>
              <span className="text-base font-extrabold text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-lg border border-amber-500/20">
                S/ {averagePrice}.00 PEN
              </span>
            </div>
            <input aria-label="input"
              type="range"
              min={20}
              max={120}
              step={5}
              value={averagePrice}
              onChange={(e) => setAveragePrice(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>S/ 20</span>
              <span>S/ 70</span>
              <span>S/ 120</span>
            </div>
          </div>

          {/* Micro breakdown bullets */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Recordatorios automáticos vía WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Arqueo de caja y gastos sin descuadres</span>
            </div>
          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[#181B26] via-[#10121B] to-[#0A0B10] border-2 border-amber-500/40 relative shadow-2xl space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Ganancia Neta Estimada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                S/ {totalEstimatedGain.toLocaleString('es-PE')}
              </span>
              <span className="text-xs text-neutral-400 font-mono">/ mes</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium pt-1">
              📈 Retorno de inversión estimado: <strong className="font-mono">{roiMultiple}x veces</strong> el costo del Plan Pro.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-white/[0.08] text-xs">
            <div className="flex justify-between text-neutral-300">
              <span>Citas salvadas con WhatsApp:</span>
              <span className="font-mono text-white font-bold">~{barbersCount * 8} citas/mes</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Ingreso rescatado de no-shows:</span>
              <span className="font-mono text-emerald-400 font-bold">+S/ {noShowRecoveredRevenue.toLocaleString('es-PE')}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Ingreso por mayor recurrencia:</span>
              <span className="font-mono text-emerald-400 font-bold">+S/ {Math.round(loyaltyBonusRevenue).toLocaleString('es-PE')}</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Costo Plan Pro BarberOS:</span>
              <span className="font-mono text-neutral-400">S/ 99.00 / mes</span>
            </div>
          </div>

          <Link
            href="/registro-barberia"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/20 active:scale-[0.99]"
          >
            <span>Empezar con 14 Días Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
