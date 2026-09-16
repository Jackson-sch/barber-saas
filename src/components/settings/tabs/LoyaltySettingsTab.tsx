'use client'

import React from 'react'
import {
  Award,
  Sparkles,
  Gift,
  Star,
} from 'lucide-react'

interface LoyaltySettingsTabProps {
  loyaltyEnabled: boolean
  setLoyaltyEnabled: (val: boolean) => void
  programType: 'VISITS' | 'POINTS'
  setProgramType: (val: 'VISITS' | 'POINTS') => void
  targetVisits: string
  setTargetVisits: (val: string) => void
  rewardTitle: string
  setRewardTitle: (val: string) => void
  rewardDiscount: string
  setRewardDiscount: (val: string) => void
  pointsPerPen: string
  setPointsPerPen: (val: string) => void
  targetPoints: string
  setTargetPoints: (val: string) => void
  pointsRewardDiscount: string
  setPointsRewardDiscount: (val: string) => void
  isOwner: boolean
}

export default function LoyaltySettingsTab({
  loyaltyEnabled,
  setLoyaltyEnabled,
  programType,
  setProgramType,
  targetVisits,
  setTargetVisits,
  rewardTitle,
  setRewardTitle,
  rewardDiscount,
  setRewardDiscount,
  pointsPerPen,
  setPointsPerPen,
  targetPoints,
  setTargetPoints,
  pointsRewardDiscount,
  setPointsRewardDiscount,
  isOwner,
}: LoyaltySettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Programa de Fidelización de Clientes</h2>
              <p className="text-xs text-neutral-400">Premia la recurrencia con tarjetas digitales de sellos o puntos por corte</p>
            </div>
          </div>

          <label htmlFor="field" className="relative inline-flex items-center cursor-pointer select-none">
            <input aria-label="input"
              type="checkbox"
              disabled={!isOwner}
              checked={loyaltyEnabled}
              onChange={(e) => setLoyaltyEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition peer-checked:bg-amber-500"></div>
            <span className="ml-2.5 text-xs font-semibold text-neutral-300">
              {loyaltyEnabled ? 'Activado' : 'Desactivado'}
            </span>
          </label>
        </div>

        {loyaltyEnabled ? (
          <div className="space-y-5">
            {/* Selector de Modalidad */}
            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Modalidad del Programa
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setProgramType('VISITS')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    programType === 'VISITS'
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${programType === 'VISITS' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-neutral-500'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-white">Por Visitas / Sellos</span>
                    <span className="text-[11px] text-neutral-400">1 sello por cada servicio completado (Ej. 8 cortes = 1 gratis)</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setProgramType('POINTS')}
                  className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    programType === 'POINTS'
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${programType === 'POINTS' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-neutral-500'}`}>
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-white">Por Puntos Acumulables</span>
                    <span className="text-[11px] text-neutral-400">Puntos proporcionales al gasto en soles canjeables por descuento</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Parámetros según modalidad */}
            {programType === 'VISITS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090A0E] border border-white/[0.06]">
                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Visitas para Premio *
                  </label>
                  <input aria-label="input"
                    type="number"
                    min="2"
                    max="50"
                    disabled={!isOwner}
                    value={targetVisits}
                    onChange={(e) => setTargetVisits(e.target.value)}
                    placeholder="8"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Título del Beneficio *
                  </label>
                  <input aria-label="input"
                    type="text"
                    disabled={!isOwner}
                    value={rewardTitle}
                    onChange={(e) => setRewardTitle(e.target.value)}
                    placeholder="Corte Clásico Gratis"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Tope Descuento Máximo (S/ PEN) *
                  </label>
                  <input aria-label="input"
                    type="number"
                    step="1"
                    min="1"
                    disabled={!isOwner}
                    value={rewardDiscount}
                    onChange={(e) => setRewardDiscount(e.target.value)}
                    placeholder="25.00"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#090A0E] border border-white/[0.06]">
                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Puntos por cada S/ 1 gastado
                  </label>
                  <input aria-label="input"
                    type="number"
                    step="0.5"
                    min="0.1"
                    disabled={!isOwner}
                    value={pointsPerPen}
                    onChange={(e) => setPointsPerPen(e.target.value)}
                    placeholder="1"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Puntos para Canje *
                  </label>
                  <input aria-label="input"
                    type="number"
                    min="10"
                    disabled={!isOwner}
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Descuento Otorgado (S/ PEN) *
                  </label>
                  <input aria-label="input"
                    type="number"
                    step="1"
                    min="1"
                    disabled={!isOwner}
                    value={pointsRewardDiscount}
                    onChange={(e) => setPointsRewardDiscount(e.target.value)}
                    placeholder="10.00"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Título del Beneficio *
                  </label>
                  <input aria-label="input"
                    type="text"
                    disabled={!isOwner}
                    value={rewardTitle}
                    onChange={(e) => setRewardTitle(e.target.value)}
                    placeholder="Vale de Descuento"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Vista Previa de Tarjeta Digital */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/20 space-y-2">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                Vista Previa del Beneficio para Clientes
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{rewardTitle || 'Corte Gratis'}</p>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    {programType === 'VISITS'
                      ? `Alcanza ${targetVisits || 8} visitas para canjear tu premio de hasta S/ ${rewardDiscount || 25}.`
                      : `Canjea ${targetPoints || 100} puntos por S/ ${pointsRewardDiscount || 10} de descuento directo.`}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shrink-0 text-center">
                  Valor: S/ {programType === 'VISITS' ? rewardDiscount || 25 : pointsRewardDiscount || 10}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 italic">
            El programa de fidelización se encuentra pausado. Los clientes no acumularán nuevos sellos o puntos hasta que lo reactives.
          </p>
        )}
      </div>
    </div>
  )
}
