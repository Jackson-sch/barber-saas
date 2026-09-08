'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Scissors } from 'lucide-react'
import { createServiceAction, updateServiceAction, type ServiceInput } from '@/actions/services'
import type { Service, ServiceCategory } from '@/types/database.types'

interface ServiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  service?: Service | null
  categories: ServiceCategory[]
  organizationId: string
  slug: string
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  service,
  categories,
  organizationId,
  slug,
}: ServiceFormModalProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('35')
  const [duration, setDuration] = useState('30')
  const [commission, setCommission] = useState('40')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (service) {
      setName(service.name)
      setCategoryId(service.category_id || '')
      setDescription(service.description || '')
      setPrice(String(service.price))
      setDuration(String(service.duration_minutes))
      setCommission(String(service.commission_percent))
      setIsActive(service.is_active)
    } else {
      setName('')
      setCategoryId(categories[0]?.id || '')
      setDescription('')
      setPrice('35')
      setDuration('30')
      setCommission('40')
      setIsActive(true)
    }
    setError(null)
  }, [service, categories, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const input: ServiceInput = {
      id: service?.id,
      organization_id: organizationId,
      category_id: categoryId || null,
      name,
      description,
      price: parseFloat(price) || 0,
      duration_minutes: parseInt(duration, 10) || 30,
      commission_percent: parseFloat(commission) || 0,
      is_active: isActive,
      slug,
    }

    const res = service ? await updateServiceAction(input) : await createServiceAction(input)

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
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {service ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <p className="text-xs text-neutral-400">Configura precio, duración y comisión</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
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
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte Fade + Barba Ritual"
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              >
                <option value="">Sin Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Precio (S/ PEN) *
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Duración (Minutos) *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              >
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="40">40 min</option>
                <option value="45">45 min</option>
                <option value="50">50 min</option>
                <option value="60">60 min (1h)</option>
                <option value="75">75 min (1h 15m)</option>
                <option value="90">90 min (1h 30m)</option>
                <option value="120">120 min (2h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Comisión Barbero (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Descripción Corta (Visible en Portal de Reservas)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el procedimiento, productos usados, etc."
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Servicio Activo (Disponible para reservas y en POS)
            </label>
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
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{service ? 'Guardar Cambios' : 'Crear Servicio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
