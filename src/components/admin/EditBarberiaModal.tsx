'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Building2, AlertTriangle, Check, Link as LinkIcon, RefreshCw } from 'lucide-react'
import { updateOrganizationByAdminAction } from '@/actions/organizations'
import { slugify } from '@/lib/utils'
import type { OrgWithSubscription } from './AdminBarberiasClient'

interface EditBarberiaModalProps {
  isOpen: boolean
  onClose: () => void
  org: OrgWithSubscription | null
}

export default function EditBarberiaModal({ isOpen, onClose, org }: EditBarberiaModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (org) {
      setName(org.name || '')
      setSlug(org.slug || '')
      setPhone(org.phone || '')
      setEmail(org.email || '')
      setAddress(org.address || '')
      setCity(org.city || '')
      setError(null)
      setSuccess(false)
    }
  }, [org])

  if (!isOpen || !org) return null

  function handleNameChange(newName: string) {
    setName(newName)
    setSlug(slugify(newName))
  }

  const slugChanged = slug.trim().toLowerCase() !== org.slug.toLowerCase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await updateOrganizationByAdminAction({
      orgId: org.id,
      name,
      slug,
      phone,
      email,
      address,
      city,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0D0E15] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Editar Barbería (Tenant)</h3>
              <p className="text-xs text-neutral-400">Modificación autorizada como SuperAdmin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Datos actualizados con éxito. Recargando...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Nombre Comercial */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Nombre Comercial de la Barbería *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Fígaro Barber Studio"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Slug URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-neutral-300 font-medium">
                  Slug Identificador (URL) *
                </label>
                <button
                  type="button"
                  onClick={() => setSlug(slugify(name))}
                  title="Sincronizar slug automáticamente con el nombre"
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Auto-generar</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-amber-400" />
                /reservar/{slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')}
              </span>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="figaro-barber"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 transition"
            />
            {slugChanged && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Atención: Modificar el slug cambiará la URL del portal de reservas y la ruta de acceso al panel para todo el staff.
                </span>
              </div>
            )}
          </div>

          {/* Teléfono y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lima, Trujillo, Arequipa..."
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Email y Dirección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">Email de Contacto</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@barberia.com"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">Dirección del Local</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Larco 450, Miraflores"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
