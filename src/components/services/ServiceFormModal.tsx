'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Scissors, Clock, Percent, Tag } from 'lucide-react'
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

const DURATION_PRESETS = ['20', '30', '45', '60', '90']
const COMMISSION_PRESETS = ['40', '50', '60']

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">
                {service ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <p className="text-xs text-neutral-400">
                Configura tarifa, duración estimada y comisión del especialista
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="service_name_input"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Nombre del Servicio *
            </label>
            <div className="relative">
              <Scissors className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="service_name_input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Corte Fade + Barba Ritual"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="service_category_select"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Categoría
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="service_category_select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="">Sin Categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="service_price_input"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Precio al Público (PEN) *
              </label>
              <div className="relative">
                <span className="text-neutral-500 text-xs font-mono absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  S/
                </span>
                <input
                  id="service_price_input"
                  type="number"
                  step="0.50"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="service_duration_select"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                >
                  Duración *
                </label>
                <div className="flex items-center gap-1">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border transition cursor-pointer ${
                        duration === d
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#090A0E] text-neutral-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Clock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="service_duration_select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="service_commission_input"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                >
                  Comisión Barbero (%)
                </label>
                <div className="flex items-center gap-1">
                  {COMMISSION_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommission(pct)}
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border transition cursor-pointer ${
                        commission === pct
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#090A0E] text-neutral-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="service_commission_input"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="service_description_input"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Descripción Corta (Visible en Portal de Reservas)
            </label>
            <textarea
              id="service_description_input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el procedimiento, productos incluidos, toalla caliente, etc."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <label
            htmlFor="isActiveCheck"
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.07] cursor-pointer hover:border-white/15 transition"
          >
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                Servicio Activo (Disponible en reservas online y POS)
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Si lo desactivas, se ocultará del portal público sin perder su historial de ventas.
              </span>
            </div>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
