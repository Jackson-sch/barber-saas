'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Wallet } from 'lucide-react'
import { openCashShiftAction } from '@/actions/pos'

interface OpenShiftModalProps {
  isOpen: boolean
  onClose: () => void
  organizationId: string
  slug: string
}

export default function OpenShiftModal({
  isOpen,
  onClose,
  organizationId,
  slug,
}: OpenShiftModalProps) {
  const router = useRouter()
  const [initialCash, setInitialCash] = useState('50.00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await openCashShiftAction(
      organizationId,
      parseFloat(initialCash) || 0,
      notes || null,
      slug
    )

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      router.refresh()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Apertura de Caja</h3>
              <p className="text-xs text-neutral-400">Inicia el turno ingresando el fondo inicial</p>
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
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Monto Inicial en Efectivo (S/ PEN) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              required
              value={initialCash}
              onChange={(e) => setInitialCash(e.target.value)}
              placeholder="50.00"
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Fondo en caja chica para dar cambio a los clientes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Observaciones / Notas (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Turno mañana, billetes de 10 y 20"
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
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Abrir Turno de Caja</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
