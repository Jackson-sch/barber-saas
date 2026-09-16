'use client'

import { useState } from 'react'
import {
  X,
  TrendingDown,
  TrendingUp,
  Loader2,
  DollarSign,
  User,
  FileText,
  Tag,
} from 'lucide-react'
import { recordCashMovementAction } from '@/actions/cash-movements'
import type { OrganizationMember } from '@/types/database.types'

interface CashMovementModalProps {
  isOpen: boolean
  onClose: () => void
  shiftId: string
  organizationId: string
  barbers: OrganizationMember[]
  slug: string
  onSuccess?: () => void
}

const expenseCategories = [
  { id: 'INSUMOS', label: 'Insumos de Barbería (hojas, alcohol, talco)' },
  { id: 'LIMPIEZA_CAFETERIA', label: 'Limpieza, Agua & Cafetería' },
  { id: 'ADELANTO_BARBERO', label: 'Adelanto de Pago a Barbero' },
  { id: 'SERVICIOS_DELIVERY', label: 'Delivery, Envíos & Fletes' },
  { id: 'ALIMENTACION', label: 'Refrigerio / Alimentación' },
  { id: 'OTROS', label: 'Otros Gastos Menores' },
]

const incomeCategories = [
  { id: 'INYECCION_FONDO', label: 'Inyección de Cambio / Fondo Extra' },
  { id: 'OTROS', label: 'Otro Ingreso Manual' },
]

export default function CashMovementModal({
  isOpen,
  onClose,
  shiftId,
  organizationId,
  barbers,
  slug,
  onSuccess,
}: CashMovementModalProps) {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [category, setCategory] = useState('INSUMOS')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBarberId, setSelectedBarberId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function handleTypeChange(newType: 'EXPENSE' | 'INCOME') {
    setType(newType)
    setCategory(newType === 'EXPENSE' ? 'INSUMOS' : 'INYECCION_FONDO')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero.')
      return
    }

    if (!description.trim()) {
      setError('Por favor describe el motivo del movimiento de efectivo.')
      return
    }

    if (type === 'EXPENSE' && category === 'ADELANTO_BARBERO' && !selectedBarberId) {
      setError('Selecciona al barbero al cual se le entrega el adelanto.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await recordCashMovementAction({
      organization_id: organizationId,
      shift_id: shiftId,
      type,
      category,
      amount: numAmount,
      description: description.trim(),
      barber_id: category === 'ADELANTO_BARBERO' ? selectedBarberId : null,
      slug,
    })

    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setAmount('')
      setDescription('')
      setSelectedBarberId('')
      onClose()
      onSuccess?.()
    }
  }

  const currentCategories = type === 'EXPENSE' ? expenseCategories : incomeCategories

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0E15] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                type === 'EXPENSE'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              {type === 'EXPENSE' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {type === 'EXPENSE' ? 'Registrar Salida de Efectivo' : 'Ingreso Extraordinario'}
              </h3>
              <p className="text-xs text-neutral-400">
                Afecta directamente el arqueo esperado de la gaveta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector (Gasto vs Ingreso) */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#090A0E] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'EXPENSE'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Egreso / Gasto Menor</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'INCOME'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ingreso Extra</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount */}
          <div>
            <label htmlFor="field" className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
              Monto en Efectivo (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm">
                S/
              </span>
              <input aria-label="0.00"
                type="number"
                step="0.10"
                min="0.10"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="field" className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <select aria-label="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 transition"
            >
              {currentCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Barber Selection if ADELANTO_BARBERO */}
          {type === 'EXPENSE' && category === 'ADELANTO_BARBERO' && (
            <div>
              <label htmlFor="field" className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                Especialista que recibe el adelanto
              </label>
              <select aria-label="select"
                required
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 transition"
              >
                <option value="">Selecciona al barbero...</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nickname || b.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description / Motivo */}
          <div>
            <label htmlFor="field" className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
              Motivo / Detalle del Comprobante
            </label>
            <textarea aria-label="Ej: Compra de 2 bidones de agua y café para el salón..."
              rows={2}
              required
              placeholder="Ej: Compra de 2 bidones de agua y café para el salón..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 transition resize-none placeholder-neutral-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-300 text-xs font-semibold transition cursor-pointer border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                type === 'EXPENSE'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>{type === 'EXPENSE' ? 'Confirmar Egreso' : 'Confirmar Ingreso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
