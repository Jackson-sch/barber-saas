'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Building2,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Save,
  ExternalLink,
  Shield,
  RefreshCw,
} from 'lucide-react'
import { updateTenantSettingsAction } from '@/actions/organizations'
import { slugify } from '@/lib/utils'
import Link from 'next/link'

interface SalonSettingsProps {
  organization: {
    id: string
    name: string
    slug: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
    openingTime: string
    closingTime: string
  }
  isOwner: boolean
  slug: string
}

export default function SalonSettingsClient({ organization, isOwner, slug }: SalonSettingsProps) {
  const router = useRouter()
  const [name, setName] = useState(organization.name)
  const [customSlug, setCustomSlug] = useState(organization.slug)
  const [phone, setPhone] = useState(organization.phone || '')
  const [email, setEmail] = useState(organization.email || '')
  const [address, setAddress] = useState(organization.address || '')
  const [city, setCity] = useState(organization.city || '')
  const [openingTime, setOpeningTime] = useState(organization.openingTime)
  const [closingTime, setClosingTime] = useState(organization.closingTime)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const slugChanged = customSlug.trim().toLowerCase() !== organization.slug.toLowerCase()

  function handleNameChange(newName: string) {
    setName(newName)
    setCustomSlug(slugify(newName))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!isOwner) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await updateTenantSettingsAction({
      organizationId: organization.id,
      currentSlug: slug,
      name,
      newSlug: customSlug,
      phone,
      email,
      address,
      city,
      openingTime,
      closingTime,
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.success) {
      setLoading(false)
      setSuccess(true)
      if (res.slugChanged && res.newSlug) {
        setTimeout(() => {
          router.push(`/app/${res.newSlug}/configuracion`)
        }, 1200)
      } else {
        router.refresh()
      }
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider">
              Ajustes Generales
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-neutral-400 font-mono">Identidad Comercial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configuración del Salón
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Administra el nombre de tu barbería, enlace público, horarios y datos de contacto.
          </p>
        </div>

        <Link
          href={`/reservar/${slug}`}
          target="_blank"
          className="py-2.5 px-4 rounded-xl bg-[#12131A] border border-white/10 hover:bg-[#1A1D2B] text-neutral-200 text-xs font-medium transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>Ver Portal Público</span>
        </Link>
      </div>

      {!isOwner && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Solo el <strong>Dueño</strong> de la barbería tiene permisos para modificar la identidad comercial y configuración del salón.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {slugChanged
              ? 'Configuración actualizada y slug modificado. Redirigiendo a la nueva URL...'
              : 'Configuración actualizada con éxito.'}
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sección 1: Identidad y URL */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Identidad y Enlace Web</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Nombre Comercial *
              </label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Fígaro Barber Studio"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Nombre que verán tus clientes en el portal de reservas y comprobantes.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-neutral-300">
                    Slug Personalizado (URL) *
                  </label>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setCustomSlug(slugify(name))}
                      title="Sincronizar slug automáticamente con el nombre"
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-mono transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Auto-generar</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  /reservar/{customSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')}
                </span>
              </div>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="figaro-barber"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Letras minúsculas, números y guiones. Sin espacios.
              </p>
            </div>
          </div>

          {slugChanged && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-white">Precaución al cambiar el Slug</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Si cambias tu slug de <span className="text-amber-300 font-mono font-bold">/{organization.slug}</span> a{' '}
                  <span className="text-amber-300 font-mono font-bold">/{customSlug}</span>, los enlaces que hayas compartido en redes sociales o códigos QR físicos dejarán de funcionar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sección 2: Contacto y Ubicación */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Contacto y Ubicación del Local</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Teléfono / WhatsApp de Atención
              </label>
              <input
                type="tel"
                disabled={!isOwner}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email de Contacto
              </label>
              <input
                type="email"
                disabled={!isOwner}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@barberia.com"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Dirección Física
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Larco 450, Miraflores"
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Ciudad
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lima, Trujillo, Arequipa..."
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Horarios de Atención */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Horario de Atención General</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Hora de Apertura
              </label>
              <input
                type="time"
                disabled={!isOwner}
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Hora de Cierre
              </label>
              <input
                type="time"
                disabled={!isOwner}
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        {isOwner && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Guardar Configuración</span>
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
