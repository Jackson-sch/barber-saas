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
  MessageCircle,
  Palette,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  Send,
  Key,
  Radio,
  Info,
} from 'lucide-react'
import { updateTenantSettingsAction } from '@/actions/organizations'
import { testWhatsAppCredentialsAction } from '@/actions/whatsapp'
import { slugify, formatPrice } from '@/lib/utils'
import type { LoyaltyProgramSettings, WhatsAppNotificationSettings } from '@/types/database.types'
import { DEFAULT_WHATSAPP_TEMPLATES, AVAILABLE_WHATSAPP_VARIABLES } from '@/lib/whatsapp'
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
    whatsappSettings?: WhatsAppNotificationSettings | null
    logoUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    bannerUrl?: string | null
    tagline?: string | null
  }
  isOwner: boolean
  slug: string
}

const COLOR_PRESETS = [
  { name: 'Ámbar Imperial', hex: '#F59E0B' },
  { name: 'Azul Zafiro', hex: '#3B82F6' },
  { name: 'Verde Esmeralda', hex: '#10B981' },
  { name: 'Rojo Rubí', hex: '#EF4444' },
  { name: 'Púrpura Amatista', hex: '#8B5CF6' },
  { name: 'Platino Cromo', hex: '#E5E5E5' },
]

const BANNER_PRESETS = [
  {
    name: 'Madera & Cuero',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Estación Moderna',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Navaja Vintage',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sillón Clásico',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80',
  },
]

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

  // Identidad Visual y Marca Blanca
  const [logoUrl, setLogoUrl] = useState(organization.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor || '#F59E0B')
  const [bannerUrl, setBannerUrl] = useState(organization.bannerUrl || '')
  const [tagline, setTagline] = useState(organization.tagline || '')

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

  // Plantillas de Notificaciones WhatsApp
  const ws = organization.whatsappSettings
  const [reminderTemplate, setReminderTemplate] = useState(
    ws?.reminder_template || DEFAULT_WHATSAPP_TEMPLATES.reminder
  )
  const [confirmationTemplate, setConfirmationTemplate] = useState(
    ws?.confirmation_template || DEFAULT_WHATSAPP_TEMPLATES.confirmation
  )
  const [rescheduleTemplate, setRescheduleTemplate] = useState(
    ws?.reschedule_template || DEFAULT_WHATSAPP_TEMPLATES.reschedule
  )
  const [followupTemplate, setFollowupTemplate] = useState(
    ws?.followup_template || DEFAULT_WHATSAPP_TEMPLATES.followup
  )
  const [activeWaTab, setActiveWaTab] = useState<'reminder' | 'confirmation' | 'reschedule' | 'followup'>('reminder')

  // Configuración Híbrida de WhatsApp (Meta Cloud API / Gateway / Manual)
  const [waProvider, setWaProvider] = useState<'MANUAL' | 'META_CLOUD_API' | 'CUSTOM_GATEWAY'>(
    ws?.provider || 'MANUAL'
  )
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(ws?.phoneNumberId || '')
  const [waAccessToken, setWaAccessToken] = useState(ws?.accessToken || '')
  const [waWebhookUrl, setWaWebhookUrl] = useState(ws?.webhookUrl || '')
  const [waWebhookBearerToken, setWaWebhookBearerToken] = useState(ws?.webhookBearerToken || '')
  const [testPhone, setTestPhone] = useState(organization.phone || '')
  const [testingWa, setTestingWa] = useState(false)
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleTestWhatsApp() {
    if (!testPhone.trim()) {
      setWaTestResult({ success: false, message: 'Ingresa un número de celular de prueba' })
      return
    }
    setTestingWa(true)
    setWaTestResult(null)
    try {
      const res = await testWhatsAppCredentialsAction({
        testPhone,
        organizationName: name,
        settings: {
          provider: waProvider,
          phoneNumberId: waPhoneNumberId.trim() || undefined,
          accessToken: waAccessToken.trim() || undefined,
          webhookUrl: waWebhookUrl.trim() || undefined,
          webhookBearerToken: waWebhookBearerToken.trim() || undefined,
        },
      })

      if (res.success && res.mode !== 'MANUAL') {
        setWaTestResult({
          success: true,
          message: `¡Mensaje enviado con éxito vía ${res.mode === 'API' ? 'Meta Cloud API' : 'Gateway'}! Revisa el WhatsApp de ${testPhone}.`,
        })
      } else if (res.mode === 'MANUAL') {
        setWaTestResult({
          success: true,
          message: 'Modo manual activo. El sistema abrirá la conversación directamente en WhatsApp Web o App.',
        })
      } else {
        setWaTestResult({
          success: false,
          message: res.error || 'No se pudo despachar el mensaje mediante la API. Revisa las credenciales ingresadas.',
        })
      }
    } catch (e: any) {
      setWaTestResult({
        success: false,
        message: e.message || 'Error al ejecutar la prueba de WhatsApp.',
      })
    } finally {
      setTestingWa(false)
    }
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)


  const slugChanged = customSlug.trim().toLowerCase() !== organization.slug.toLowerCase()

  function handleNameChange(newName: string) {
    setName(newName)
    setCustomSlug(slugify(newName))
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo de imagen no debe superar los 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      setError('La imagen de portada no debe superar los 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
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
      whatsappSettings: {
        provider: waProvider,
        phoneNumberId: waPhoneNumberId.trim() || undefined,
        accessToken: waAccessToken.trim() || undefined,
        webhookUrl: waWebhookUrl.trim() || undefined,
        webhookBearerToken: waWebhookBearerToken.trim() || undefined,
        reminder_template: reminderTemplate.trim(),
        confirmation_template: confirmationTemplate.trim(),
        reschedule_template: rescheduleTemplate.trim(),
        followup_template: followupTemplate.trim(),
      },
      logoUrl: logoUrl.trim() || null,
      primaryColor: primaryColor.trim() || '#F59E0B',
      bannerUrl: bannerUrl.trim() || null,
      tagline: tagline.trim() || null,
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

        {/* Sección: Marca Blanca & Identidad Visual */}
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Palette className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-white text-sm">Marca Blanca & Identidad Visual</h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Personaliza el logotipo, imagen de portada y color corporativo que verán tus clientes en el portal de reservas y en los tickets.
            </p>
          </div>

          {/* 1. Logotipo del Salón */}
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
            <label className="block text-xs font-semibold text-neutral-200">
              Logotipo Oficial del Salón
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview */}
              <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Salón"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-amber-400">
                    {name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer border border-white/10">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Subir Imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!isOwner}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {logoUrl && (
                    <button
                      type="button"
                      disabled={!isOwner}
                      onClick={() => setLogoUrl('')}
                      className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition flex items-center gap-1.5 border border-red-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar Logo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    disabled={!isOwner}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="O pega la URL directa del logo (https://...)"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Recomendado: Imagen cuadrada (PNG o WebP) con fondo transparente o color sólido.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Portada / Banner de Fondo */}
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-neutral-200">
                Portada de Fondo para Portal de Reservas
              </label>
              {bannerUrl && (
                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setBannerUrl('')}
                  className="text-[11px] text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar portada</span>
                </button>
              )}
            </div>

            {/* Banner Preview */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Banner Salón"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-6 h-6 text-neutral-600 mx-auto mb-1" />
                  <span className="text-xs text-neutral-500">Sin imagen de portada configurada</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Presets de Portada */}
            <div>
              <p className="text-[11px] text-neutral-400 mb-2">
                O selecciona una de nuestras portadas predeterminadas de barbería:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BANNER_PRESETS.map((bp) => (
                  <button
                    key={bp.name}
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setBannerUrl(bp.url)}
                    className={`relative rounded-lg overflow-hidden border transition text-left cursor-pointer group h-14 ${
                      bannerUrl === bp.url
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={bp.url}
                      alt={bp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                      <span className="text-[10px] font-semibold text-white truncate leading-tight">
                        {bp.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <label className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer border border-white/10 shrink-0 w-full sm:w-auto justify-center">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Subir Portada</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!isOwner}
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
              <input
                type="url"
                disabled={!isOwner}
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="O ingresa una URL de imagen..."
                className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* 3. Paleta de Color Corporativo */}
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
            <label className="block text-xs font-semibold text-neutral-200">
              Color de Acento de la Marca
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((cp) => {
                const isSelected = primaryColor.toUpperCase() === cp.hex.toUpperCase()
                return (
                  <button
                    key={cp.hex}
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setPrimaryColor(cp.hex)}
                    className={`py-2 px-3 rounded-xl border transition flex items-center gap-2.5 text-xs font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white shadow-sm'
                        : 'bg-[#0D0E15] border-white/10 text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{ backgroundColor: cp.hex }}
                    />
                    <span className="truncate">{cp.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white ml-auto shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Custom Color input */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-neutral-400">Color Personalizado:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  disabled={!isOwner}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
                />
                <input
                  type="text"
                  disabled={!isOwner}
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 p-1.5 rounded-lg bg-[#0D0E15] border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Slogan / Lema Comercial */}
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-2">
            <label className="block text-xs font-semibold text-neutral-200">
              Slogan o Lema Comercial (Opcional)
            </label>
            <input
              type="text"
              disabled={!isOwner}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. El arte del corte clásico y cuidado masculino de alta gama"
              className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
            />
            <p className="text-[11px] text-neutral-400">
              Aparecerá en el portal de reservas debajo del nombre de tu salón.
            </p>
          </div>

          {/* 5. Vista Previa en Vivo */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-white/10 relative overflow-hidden shadow-xl space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Vista Previa en Vivo de tu Marca
            </span>

            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0e1017] p-5">
              {bannerUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs pointer-events-none"
                  style={{ backgroundImage: `url(${bannerUrl})` }}
                />
              )}
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div
                  className="w-16 h-16 rounded-2xl border flex items-center justify-center overflow-hidden shadow-xl shrink-0"
                  style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}15` }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black" style={{ color: primaryColor }}>
                      {name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">{name}</h3>
                  {tagline ? (
                    <p className="text-xs text-neutral-300 italic mt-0.5">{tagline}</p>
                  ) : (
                    <p className="text-xs text-neutral-400 mt-0.5">Barbería & Salón Exclusivo</p>
                  )}
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-bold text-black shadow-sm inline-block"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Reservar Cita
                    </span>
                    <span className="text-xs text-neutral-400">
                      {phone || '+51 987 654 321'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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

        {/* SECCIÓN 5: Notificaciones de WhatsApp (Híbrido API & Manual) */}
        <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white tracking-tight">
                  5. Notificaciones de WhatsApp (Motor Híbrido)
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Envía recordatorios y confirmaciones automáticas por API oficial o mediante enlace directo manual 1-clic con fallback automático.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto">
              {waProvider === 'MANUAL'
                ? '📱 Modo Manual (wa.me)'
                : waProvider === 'META_CLOUD_API'
                  ? '⚡ Meta Cloud API'
                  : '🌐 Custom Gateway'}
            </span>
          </div>

          {/* Selector de Modo de Despacho */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2.5">
              Canal de Despacho de WhatsApp
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={!isOwner}
                onClick={() => setWaProvider('MANUAL')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  waProvider === 'MANUAL'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5'
                    : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      1-Clic Manual (wa.me)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Sin Costo
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Abre WhatsApp Web o App en 1 clic con el mensaje preformateado. 100% gratuito sin requerir registro en Meta.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={!isOwner}
                onClick={() => setWaProvider('META_CLOUD_API')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  waProvider === 'META_CLOUD_API'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5'
                    : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Meta Cloud API (Oficial)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                      Automático
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Envío en segundo plano mediante la API oficial de Meta Graph. Requiere Phone Number ID y System Token.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={!isOwner}
                onClick={() => setWaProvider('CUSTOM_GATEWAY')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  waProvider === 'CUSTOM_GATEWAY'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5'
                    : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      Gateway / Webhook
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Conecta con Evolution API, Baileys, Z-API o un webhook HTTP propio.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Credenciales Meta Cloud API */}
          {waProvider === 'META_CLOUD_API' && (
            <div className="p-4 rounded-xl bg-[#090A0E] border border-sky-500/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Key className="w-4 h-4" />
                <span>Credenciales de Meta WhatsApp Business Cloud API</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Obtén estas credenciales en tu panel de <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">Meta for Developers</a> en la sección WhatsApp &gt; Configuración de la API.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Phone Number ID *
                  </label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={waPhoneNumberId}
                    onChange={(e) => setWaPhoneNumberId(e.target.value)}
                    placeholder="Ej. 102948572819203"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Permanent Access Token (System User) *
                  </label>
                  <input
                    type="password"
                    disabled={!isOwner}
                    value={waAccessToken}
                    onChange={(e) => setWaAccessToken(e.target.value)}
                    placeholder="EAA..."
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Credenciales Custom Gateway */}
          {waProvider === 'CUSTOM_GATEWAY' && (
            <div className="p-4 rounded-xl bg-[#090A0E] border border-purple-500/20 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <Radio className="w-4 h-4" />
                <span>Configuración de Gateway HTTP / Webhook</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Endpoint URL (POST) *
                  </label>
                  <input
                    type="url"
                    disabled={!isOwner}
                    value={waWebhookUrl}
                    onChange={(e) => setWaWebhookUrl(e.target.value)}
                    placeholder="https://api.mi-barberia.com/whatsapp/send"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Bearer Token / API Secret (Opcional)
                  </label>
                  <input
                    type="password"
                    disabled={!isOwner}
                    value={waWebhookBearerToken}
                    onChange={(e) => setWaWebhookBearerToken(e.target.value)}
                    placeholder="Tu secret key"
                    className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Banco de Prueba en Vivo (Ping Tester) */}
          <div className="p-4 rounded-xl bg-[#07080B] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Prueba de Conexión en Tiempo Real
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Fallback manual: <strong className="text-emerald-400">Activado</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Número celular de prueba (ej: 987654321)"
                className="w-full sm:flex-1 p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="button"
                disabled={testingWa || !isOwner}
                onClick={handleTestWhatsApp}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 cursor-pointer"
              >
                {testingWa ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Enviar Ping de Prueba</span>
              </button>
            </div>

            {waTestResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  waTestResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {waTestResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{waTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Plantillas de Mensajes */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Personalización de Plantillas
              </label>
              <span className="text-[11px] text-neutral-400">
                Variables dinámicas disponibles abajo
              </span>
            </div>

            {/* Selector de Plantilla a Editar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'reminder', label: '⏰ Recordatorio Previo' },
                { id: 'confirmation', label: '✅ Confirmación de Cita' },
                { id: 'reschedule', label: '🔄 Reprogramación' },
                { id: 'followup', label: '✂️ Agradecimiento' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveWaTab(tab.id as any)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeWaTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#090A0E] text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Textarea de la plantilla activa */}
            <div className="space-y-2">
              <textarea
                rows={4}
                disabled={!isOwner}
                value={
                  activeWaTab === 'reminder'
                    ? reminderTemplate
                    : activeWaTab === 'confirmation'
                      ? confirmationTemplate
                      : activeWaTab === 'reschedule'
                        ? rescheduleTemplate
                        : followupTemplate
                }
                onChange={(e) => {
                  const val = e.target.value
                  if (activeWaTab === 'reminder') setReminderTemplate(val)
                  else if (activeWaTab === 'confirmation') setConfirmationTemplate(val)
                  else if (activeWaTab === 'reschedule') setRescheduleTemplate(val)
                  else setFollowupTemplate(val)
                }}
                className="w-full p-3 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-none font-sans"
                placeholder="Escribe la plantilla del mensaje..."
              />

              {/* Variable Pills */}
              <div>
                <p className="text-[11px] text-neutral-400 mb-1.5">
                  Haz clic en una etiqueta para insertarla dinámicamente:
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVAILABLE_WHATSAPP_VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => {
                        if (!isOwner) return
                        const append = (current: string) =>
                          current + (current.endsWith(' ') ? '' : ' ') + v.tag + ' '
                        if (activeWaTab === 'reminder') setReminderTemplate(append(reminderTemplate))
                        else if (activeWaTab === 'confirmation') setConfirmationTemplate(append(confirmationTemplate))
                        else if (activeWaTab === 'reschedule') setRescheduleTemplate(append(rescheduleTemplate))
                        else setFollowupTemplate(append(followupTemplate))
                      }}
                      className="py-1 px-2 rounded-lg bg-white/[0.05] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-[11px] font-mono font-medium text-emerald-400 transition cursor-pointer"
                      title={`Insertar ${v.desc}`}
                    >
                      +{v.tag}
                    </button>
                  ))}
                </div>
              </div>
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
