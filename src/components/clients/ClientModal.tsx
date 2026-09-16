'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, User, Phone, Mail } from 'lucide-react'
import { createClientAction, updateClientAction, type ClientInput } from '@/actions/clients'
import type { Client } from '@/types/database.types'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
  organizationId: string
  slug: string
}

export default function ClientModal({
  isOpen,
  onClose,
  client,
  organizationId,
  slug,
}: ClientModalProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (client) {
      setFullName(client.full_name)
      setPhone(client.phone)
      setEmail(client.email || '')
      setNotes(client.notes || '')
    } else {
      setFullName('')
      setPhone('')
      setEmail('')
      setNotes('')
    }
    setError(null)
  }, [client, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const input: ClientInput = {
      id: client?.id,
      organization_id: organizationId,
      full_name: fullName,
      phone,
      email: email || null,
      notes: notes || null,
      slug,
    }

    const res = client ? await updateClientAction(input) : await createClientAction(input)

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
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <p className="text-xs text-neutral-400">Datos de contacto para agenda y recordatorios</p>
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
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input aria-label="input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Miguel Ángel Torres"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Teléfono / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input aria-label="input"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="999888777"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico (Opcional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input aria-label="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="miguel@ejemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Notas Generales
            </label>
            <textarea aria-label="textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferencias de horario, cómo conoció la barbería, etc."
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition resize-none"
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
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{client ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
