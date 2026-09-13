'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Award,
  Sparkles,
  Gift,
  Star,
  History,
  Plus,
  Minus,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import {
  adjustClientLoyaltyAction,
  getClientLoyaltyLogsAction,
} from '@/actions/clients'
import type { ClientWithPreferences } from './ClientsClient'
import type { LoyaltyProgramSettings, LoyaltyLog } from '@/types/database.types'

interface LoyaltyHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  client: ClientWithPreferences | null
  loyaltyProgram: LoyaltyProgramSettings | null
  organizationId: string
  slug: string
  onUpdateClientPoints?: (clientId: string, newPoints: number) => void
}

export default function LoyaltyHistoryModal({
  isOpen,
  onClose,
  client,
  loyaltyProgram,
  organizationId,
  slug,
  onUpdateClientPoints,
}: LoyaltyHistoryModalProps) {
  const [logs, setLogs] = useState<LoyaltyLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [adjustAmount, setAdjustAmount] = useState('1')
  const [adjustReason, setAdjustReason] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && client) {
      loadLogs()
      setAdjustAmount('1')
      setAdjustReason('')
      setError(null)
      setSuccessMsg(null)
    }
  }, [isOpen, client])

  if (!isOpen || !client) return null

  async function loadLogs() {
    if (!client) return
    setLoadingLogs(true)
    const res = await getClientLoyaltyLogsAction(client.id, organizationId)
    if (res.logs) {
      setLogs(res.logs)
    }
    setLoadingLogs(false)
  }

  const isPoints = loyaltyProgram?.program_type === 'POINTS'
  const target = isPoints
    ? loyaltyProgram?.target_points || 100
    : loyaltyProgram?.target_visits || 8
  const currentPoints = client.loyalty_points || 0
  const progressPercent = Math.min(100, Math.round((currentPoints / target) * 100))
  const isRewardReady = currentPoints >= target
  const remaining = Math.max(0, target - currentPoints)

  async function handleAdjust(deltaMultiplier: 1 | -1) {
    if (!client) return
    const num = parseInt(adjustAmount, 10)
    if (isNaN(num) || num <= 0) {
      setError('Ingresa una cantidad válida mayor a 0.')
      return
    }

    setIsAdjusting(true)
    setError(null)
    setSuccessMsg(null)

    const finalDelta = num * deltaMultiplier
    const res = await adjustClientLoyaltyAction({
      clientId: client.id,
      organizationId,
      pointsDelta: finalDelta,
      reason: adjustReason.trim() || (finalDelta > 0 ? 'Ajuste manual (+)' : 'Ajuste manual (-)'),
      slug,
    })

    setIsAdjusting(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success && res.newPoints !== undefined) {
      setSuccessMsg(`Puntos actualizados a ${res.newPoints}.`)
      setAdjustReason('')
      if (onUpdateClientPoints) {
        onUpdateClientPoints(client.id, res.newPoints)
      }
      loadLogs()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Fidelización de Cliente</h3>
              <p className="text-xs text-neutral-400">{client.full_name} • {client.phone}</p>
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

        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tarjeta Digital del Cliente */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-neutral-950 to-neutral-950 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tarjeta Digital de Fidelidad
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isRewardReady
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 animate-pulse'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {isRewardReady ? '🏆 ¡Premio Disponible!' : 'En Progreso'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-black text-white font-mono">
                {currentPoints} <span className="text-xs font-medium text-neutral-400">/ {target} {isPoints ? 'puntos' : 'sellos'}</span>
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isRewardReady
                  ? `Premio: ${loyaltyProgram?.reward_title || 'Corte Gratis'} (${formatPrice(loyaltyProgram?.reward_discount || 25)})`
                  : `Faltan ${remaining} ${isPoints ? 'puntos' : 'sellos'} para el premio.`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-400 font-mono">{progressPercent}%</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sellos visuales si es por visitas */}
          {!isPoints && target <= 12 && (
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
              {Array.from({ length: target }).map((_, i) => {
                const filled = i < currentPoints
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                      filled
                        ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/40'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-600'
                    }`}
                  >
                    {filled ? <Star className="w-3.5 h-3.5 fill-current" /> : i + 1}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Ajuste manual administrativo */}
        <div className="mt-5 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Ajuste Manual de {isPoints ? 'Puntos' : 'Sellos'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            <div className="sm:col-span-3">
              <input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                placeholder="Cantidad"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Motivo (ej. Cortesía)..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-4 flex items-center gap-1.5">
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => handleAdjust(1)}
                className="flex-1 py-2 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Añadir sellos/puntos"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sumar</span>
              </button>
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => handleAdjust(-1)}
                className="flex-1 py-2 px-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Restar sellos/puntos"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Restar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Historial de transacciones de fidelidad */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Historial de Transacciones
            </span>
            <span className="text-[11px] text-neutral-500">{logs.length} registros</span>
          </div>

          {loadingLogs ? (
            <div className="py-8 text-center text-neutral-500 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Cargando movimientos...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-500">Aún no se registran movimientos de fidelidad.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/80 max-h-48 overflow-y-auto">
              {logs.map((l) => {
                const isRedeem = l.type === 'REDEEM_REWARD'
                const isEarn = l.type === 'EARN_VISIT' || l.type === 'EARN_POINTS'
                const dateStr = new Date(l.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            isRedeem
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isEarn
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          }`}
                        >
                          {isRedeem ? 'Canje de Premio' : isEarn ? 'Acumulado' : 'Ajuste'}
                        </span>
                        <span className="text-neutral-300 font-medium">{l.reward_description}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">{dateStr}</span>
                    </div>

                    <span
                      className={`font-mono font-bold text-sm ${
                        l.points_delta > 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {l.points_delta > 0 ? `+${l.points_delta}` : l.points_delta}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
