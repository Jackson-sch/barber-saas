'use client'

import React from 'react'
import Link from 'next/link'
import {
  Building2,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'

interface GeneralSettingsTabProps {
  name: string
  customSlug: string
  originalSlug: string
  phone: string
  setPhone: (val: string) => void
  email: string
  setEmail: (val: string) => void
  address: string
  setAddress: (val: string) => void
  city: string
  setCity: (val: string) => void
  openingTime: string
  setOpeningTime: (val: string) => void
  closingTime: string
  setClosingTime: (val: string) => void
  isOwner: boolean
  onNameChange: (newName: string) => void
  onSlugChange: (newSlug: string) => void
}

export default function GeneralSettingsTab({
  name,
  customSlug,
  originalSlug,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  city,
  setCity,
  openingTime,
  setOpeningTime,
  closingTime,
  setClosingTime,
  isOwner,
  onNameChange,
  onSlugChange,
}: GeneralSettingsTabProps) {
  const slugChanged = customSlug.trim().toLowerCase() !== originalSlug.toLowerCase()

  return (
    <div className="space-y-6">
      {/* Sección: Información General del Negocio */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <Building2 className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white text-sm">Información General del Negocio</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Nombre de la Barbería *
            </label>
            <input aria-label="input"
              type="text"
              required
              disabled={!isOwner}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Barbería Deluxe"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Identificador URL (Slug) *
            </label>
            <div className="flex items-center">
              <span className="p-2.5 bg-white/[0.04] border border-r-0 border-white/10 rounded-l-xl text-neutral-500 text-xs font-mono select-none">
                /reservar/
              </span>
              <input aria-label="input"
                type="text"
                required
                disabled={!isOwner}
                value={customSlug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="mi-barberia"
                className="w-full p-2.5 rounded-r-xl bg-[#090A0E] border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {slugChanged && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-amber-300 font-medium">Atención: Cambio de URL</p>
              <p className="text-amber-400/80 mt-0.5">
                Al guardar con un nuevo slug, el enlace público cambiará y serás redirigido a{' '}
                <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">
                  /app/{customSlug}/configuracion
                </code>
                .
              </p>
            </div>
          </div>
        )}

        {/* Link directo de Reservas */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs text-neutral-400">Enlace Público de Reservas:</span>
            <code className="text-xs text-amber-400 font-mono bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/[0.06]">
              /reservar/{originalSlug}
            </code>
          </div>
          <Link
            href={`/reservar/${originalSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium transition"
          >
            <span>Probar Enlace de Clientes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Sección: Contacto y Ubicación */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <MapPin className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white text-sm">Contacto y Ubicación del Local</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Teléfono / WhatsApp de Atención
            </label>
            <input aria-label="input"
              type="tel"
              disabled={!isOwner}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51 987 654 321"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              Email de Contacto
            </label>
            <input aria-label="input"
              type="email"
              disabled={!isOwner}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@barberia.com"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Dirección Física
            </label>
            <input aria-label="input"
              type="text"
              disabled={!isOwner}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Larco 450, Miraflores"
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Ciudad
            </label>
            <input aria-label="input"
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

      {/* Sección: Horarios de Atención */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <Clock className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-white text-sm">Horario de Atención General</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Hora de Apertura
            </label>
            <input aria-label="input"
              type="time"
              disabled={!isOwner}
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Hora de Cierre
            </label>
            <input aria-label="input"
              type="time"
              disabled={!isOwner}
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
