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
  Award,
  Sparkles,
  Gift,
  Star,
} from 'lucide-react'
import { updateTenantSettingsAction } from '@/actions/organizations'
import { slugify, formatPrice } from '@/lib/utils'
import type { LoyaltyProgramSettings } from '@/types/database.types'
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
    loyaltyProgram?: LoyaltyProgramSettings | null
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

  // Programa de Fidelización
  const lp = organization.loyaltyProgram
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(lp?.enabled ?? true)
  const [programType, setProgramType] = useState<'VISITS' | 'POINTS'>(lp?.program_type || 'VISITS')
  const [targetVisits, setTargetVisits] = useState(String(lp?.target_visits ?? 8))
  const [rewardTitle, setRewardTitle] = useState(lp?.reward_title || 'Corte Clásico Gratis')
  const [rewardDiscount, setRewardDiscount] = useState(String(lp?.reward_discount ?? 25))
  const [pointsPerPen, setPointsPerPen] = useState(String(lp?.points_per_pen ?? 1))
  const [targetPoints, setTargetPoints] = useState(String(lp?.target_points ?? 100))
  const [pointsRewardDiscount, setPointsRewardDiscount] = useState(String(lp?.points_reward_discount ?? 10))

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
      loyaltyProgram: {
        enabled: loyaltyEnabled,
        program_type: programType,
        target_visits: Math.max(1, parseInt(targetVisits) || 8),
        reward_title: rewardTitle.trim() || 'Corte Clásico Gratis',
        reward_discount: Math.max(0, parseFloat(rewardDiscount) || 25),
        points_per_pen: Math.max(0.1, parseFloat(pointsPerPen) || 1),
        target_points: Math.max(10, parseInt(targetPoints) || 100),
        points_reward_discount: Math.max(0, parseFloat(pointsRewardDiscount) || 10),
      },
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

        {/* Sección 4: Programa de Fidelización de Clientes */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">Programa de Fidelización de Clientes</h2>
                <p className="text-xs text-neutral-400">Premia la recurrencia con tarjetas digitales de sellos o puntos por corte</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={!isOwner}
                checked={loyaltyEnabled}
                onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2.5 text-xs font-semibold text-neutral-300">
                {loyaltyEnabled ? 'Activado' : 'Desactivado'}
              </span>
            </label>
          </div>

          {loyaltyEnabled ? (
            <div className="space-y-5">
              {/* Selector de Modalidad */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Modalidad del Programa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setProgramType('VISITS')}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      programType === 'VISITS'
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5'
                        : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Por Visitas / Sellos
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      El cliente acumula 1 sello por cada corte. Al completar la meta (ej. 8 visitas), recibe su recompensa gratis o con descuento.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setProgramType('POINTS')}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      programType === 'POINTS'
                        ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5'
                        : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" />
                        Por Puntos de Consumo
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Otorga puntos proporcionales al monto pagado en Soles (PEN) que se pueden canjear por descuentos futuros.
                    </p>
                  </button>
                </div>
              </div>

              {/* Campos dinámicos según modalidad */}
              {programType === 'VISITS' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090A0E] border border-white/[0.06]">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Meta de Visitas (Sellos) *
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      disabled={!isOwner}
                      value={targetVisits}
                      onChange={(e) => setTargetVisits(e.target.value)}
                      placeholder="8"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Ej: 8 o 10 cortes</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Título de la Recompensa *
                    </label>
                    <input
                      type="text"
                      disabled={!isOwner}
                      value={rewardTitle}
                      onChange={(e) => setRewardTitle(e.target.value)}
                      placeholder="Corte Clásico Gratis"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Visible en comprobante y POS</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Descuento Máximo al Canjear (S/ PEN) *
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      disabled={!isOwner}
                      value={rewardDiscount}
                      onChange={(e) => setRewardDiscount(e.target.value)}
                      placeholder="25.00"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Monto deducido al aplicar el canje</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#090A0E] border border-white/[0.06]">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Puntos por cada S/ 1 gastado
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      disabled={!isOwner}
                      value={pointsPerPen}
                      onChange={(e) => setPointsPerPen(e.target.value)}
                      placeholder="1"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Puntos para Canje *
                    </label>
                    <input
                      type="number"
                      min="10"
                      disabled={!isOwner}
                      value={targetPoints}
                      onChange={(e) => setTargetPoints(e.target.value)}
                      placeholder="100"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Descuento Otorgado (S/ PEN) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      disabled={!isOwner}
                      value={pointsRewardDiscount}
                      onChange={(e) => setPointsRewardDiscount(e.target.value)}
                      placeholder="10.00"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-emerald-400 font-bold text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Título del Beneficio *
                    </label>
                    <input
                      type="text"
                      disabled={!isOwner}
                      value={rewardTitle}
                      onChange={(e) => setRewardTitle(e.target.value)}
                      placeholder="Vale de Descuento"
                      className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Vista Previa de Tarjeta Digital */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border border-amber-500/20 space-y-2">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  Vista Previa del Beneficio para Clientes
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-white text-sm">{rewardTitle || 'Corte Gratis'}</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      {programType === 'VISITS'
                        ? `Alcanza ${targetVisits || 8} visitas para canjear tu premio de hasta S/ ${rewardDiscount || 25}.`
                        : `Canjea ${targetPoints || 100} puntos por S/ ${pointsRewardDiscount || 10} de descuento directo.`}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shrink-0 text-center">
                    Valor: S/ {programType === 'VISITS' ? rewardDiscount || 25 : pointsRewardDiscount || 10}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">
              El programa de fidelización se encuentra pausado. Los clientes no acumularán nuevos sellos o puntos hasta que lo reactives.
            </p>
          )}
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
