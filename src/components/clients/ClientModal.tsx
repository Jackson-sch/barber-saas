'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, User, Phone, Mail, FileText } from 'lucide-react'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">
                {client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <p className="text-xs text-neutral-400">
                Datos de contacto para agenda, fidelización y recordatorios WhatsApp
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="client_modal_name"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="client_modal_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Miguel Ángel Torres"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="client_modal_phone"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="client_modal_phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 999 888 777"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="client_modal_email"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Correo Electrónico (Opcional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="client_modal_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="miguel@ejemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="client_modal_notes"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Notas Generales
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                id="client_modal_notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferencias de horario, cómo conoció la barbería, bebidas favoritas..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition resize-none"
              />
            </div>
          </div>

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
              <span>{client ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
