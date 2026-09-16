'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Palette,
  Award,
  MessageCircle,
  ExternalLink,
  Shield,
  CheckCircle2,
  Loader2,
  Save,
  CreditCard,
} from 'lucide-react'
import { updateTenantSettingsAction } from '@/actions/organizations'
import { slugify } from '@/lib/utils'
import { DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/whatsapp'
import type { SalonSettingsProps, SettingsTab } from './types'

import GeneralSettingsTab from './tabs/GeneralSettingsTab'
import BrandingSettingsTab from './tabs/BrandingSettingsTab'
import LoyaltySettingsTab from './tabs/LoyaltySettingsTab'
import WhatsAppSettingsTab from './tabs/WhatsAppSettingsTab'
import PaymentSettingsTab from './tabs/PaymentSettingsTab'

export default function SalonSettingsClient({ organization, isOwner, slug }: SalonSettingsProps) {
  const router = useRouter()

  // 1. General & Local
  const [name, setName] = useState(organization.name)
  const [customSlug, setCustomSlug] = useState(organization.slug)
  const [phone, setPhone] = useState(organization.phone || '')
  const [email, setEmail] = useState(organization.email || '')
  const [address, setAddress] = useState(organization.address || '')
  const [city, setCity] = useState(organization.city || '')
  const [openingTime, setOpeningTime] = useState(organization.openingTime)
  const [closingTime, setClosingTime] = useState(organization.closingTime)

  // 2. Identidad Visual y Marca Blanca
  const [logoUrl, setLogoUrl] = useState(organization.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor || '#F59E0B')
  const [bannerUrl, setBannerUrl] = useState(organization.bannerUrl || '')
  const [tagline, setTagline] = useState(organization.tagline || '')

  // 3. Programa de Fidelización
  const lp = organization.loyaltyProgram
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(lp?.enabled ?? true)
  const [programType, setProgramType] = useState<'VISITS' | 'POINTS'>(lp?.program_type || 'VISITS')
  const [targetVisits, setTargetVisits] = useState(String(lp?.target_visits ?? 8))
  const [rewardTitle, setRewardTitle] = useState(lp?.reward_title || 'Corte Clásico Gratis')
  const [rewardDiscount, setRewardDiscount] = useState(String(lp?.reward_discount ?? 25))
  const [pointsPerPen, setPointsPerPen] = useState(String(lp?.points_per_pen ?? 1))
  const [targetPoints, setTargetPoints] = useState(String(lp?.target_points ?? 100))
  const [pointsRewardDiscount, setPointsRewardDiscount] = useState(String(lp?.points_reward_discount ?? 10))

  // 4. Plantillas y Configuración Híbrida de WhatsApp (En BD exclusiva por barbería)
  const ws = organization.whatsappSettings
  const [waProvider, setWaProvider] = useState<'MANUAL' | 'META_CLOUD_API' | 'CUSTOM_GATEWAY'>(
    ws?.provider || 'MANUAL'
  )
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(ws?.phoneNumberId || '')
  const [waAccessToken, setWaAccessToken] = useState(ws?.accessToken || '')
  const [waWebhookUrl, setWaWebhookUrl] = useState(ws?.webhookUrl || '')
  const [waWebhookBearerToken, setWaWebhookBearerToken] = useState(ws?.webhookBearerToken || '')
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

  // 5. Pasarela de Pagos Culqi (BYOK - Cada barbería con sus propias credenciales)
  const cs = organization.culqiSettings
  const [culqiEnabled, setCulqiEnabled] = useState(cs?.enabled ?? false)
  const [culqiEnvironment, setCulqiEnvironment] = useState<'test' | 'production'>(
    cs?.environment || 'test'
  )
  const [culqiPublicKey, setCulqiPublicKey] = useState(cs?.public_key || '')
  const [culqiSecretKey, setCulqiSecretKey] = useState(cs?.secret_key || '')

  // Navegación por pestañas y estados de formulario
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
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

    try {
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
        culqiSettings: {
          enabled: culqiEnabled,
          environment: culqiEnvironment,
          public_key: culqiPublicKey.trim(),
          secret_key: culqiSecretKey.trim(),
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
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al guardar la configuración.')
      setLoading(false)
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
            Administra el nombre de tu barbería, identidad de marca, fidelización y motor de WhatsApp.
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
            Solo el <strong>Dueño</strong> de la barbería tiene permisos para modificar la configuración del salón.
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
              : 'Configuración guardada exitosamente en la base de datos.'}
          </span>
        </div>
      )}

      {/* Selector de Pestañas de Configuración */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090A0E] border border-white/[0.08] overflow-x-auto select-none">
        {[
          {
            id: 'general',
            label: 'General & Local',
            icon: Building2,
            desc: 'Nombre, contacto y horarios',
          },
          {
            id: 'branding',
            label: 'Marca & Identidad',
            icon: Palette,
            desc: 'Logo, portada y colores',
          },
          {
            id: 'loyalty',
            label: 'Fidelización',
            icon: Award,
            desc: 'Sellos y recompensas',
          },
          {
            id: 'whatsapp',
            label: 'WhatsApp API',
            icon: MessageCircle,
            desc: 'Credenciales en BD y plantillas',
            badge: waProvider !== 'MANUAL' ? 'API Activa' : undefined,
          },
          {
            id: 'payments',
            label: 'Pasarela Culqi',
            icon: CreditCard,
            desc: 'Tarjetas, Yape y pagos online',
            badge: culqiEnabled && culqiPublicKey ? 'Culqi Activo' : undefined,
          },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <span className="block leading-tight">{tab.label}</span>
                <span
                  className={`text-[10px] hidden sm:block font-normal mt-0.5 ${
                    isActive ? 'text-black/80' : 'text-neutral-500'
                  }`}
                >
                  {tab.desc}
                </span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ml-1 ${
                    isActive
                      ? 'bg-black/20 text-black'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Formulario Modular */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'general' && (
          <GeneralSettingsTab
            name={name}
            customSlug={customSlug}
            originalSlug={organization.slug}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            openingTime={openingTime}
            setOpeningTime={setOpeningTime}
            closingTime={closingTime}
            setClosingTime={setClosingTime}
            isOwner={isOwner}
            onNameChange={handleNameChange}
            onSlugChange={setCustomSlug}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingSettingsTab
            name={name}
            phone={phone}
            tagline={tagline}
            setTagline={setTagline}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            bannerUrl={bannerUrl}
            setBannerUrl={setBannerUrl}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            isOwner={isOwner}
            handleLogoUpload={handleLogoUpload}
            handleBannerUpload={handleBannerUpload}
          />
        )}

        {activeTab === 'loyalty' && (
          <LoyaltySettingsTab
            loyaltyEnabled={loyaltyEnabled}
            setLoyaltyEnabled={setLoyaltyEnabled}
            programType={programType}
            setProgramType={setProgramType}
            targetVisits={targetVisits}
            setTargetVisits={setTargetVisits}
            rewardTitle={rewardTitle}
            setRewardTitle={setRewardTitle}
            rewardDiscount={rewardDiscount}
            setRewardDiscount={setRewardDiscount}
            pointsPerPen={pointsPerPen}
            setPointsPerPen={setPointsPerPen}
            targetPoints={targetPoints}
            setTargetPoints={setTargetPoints}
            pointsRewardDiscount={pointsRewardDiscount}
            setPointsRewardDiscount={setPointsRewardDiscount}
            isOwner={isOwner}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppSettingsTab
            organizationId={organization.id}
            organizationName={name}
            isOwner={isOwner}
            waProvider={waProvider}
            setWaProvider={setWaProvider}
            waPhoneNumberId={waPhoneNumberId}
            setWaPhoneNumberId={setWaPhoneNumberId}
            waAccessToken={waAccessToken}
            setWaAccessToken={setWaAccessToken}
            waWebhookUrl={waWebhookUrl}
            setWaWebhookUrl={setWaWebhookUrl}
            waWebhookBearerToken={waWebhookBearerToken}
            setWaWebhookBearerToken={setWaWebhookBearerToken}
            reminderTemplate={reminderTemplate}
            setReminderTemplate={setReminderTemplate}
            confirmationTemplate={confirmationTemplate}
            setConfirmationTemplate={setConfirmationTemplate}
            rescheduleTemplate={rescheduleTemplate}
            setRescheduleTemplate={setRescheduleTemplate}
            followupTemplate={followupTemplate}
            setFollowupTemplate={setFollowupTemplate}
            initialPhone={organization.phone}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentSettingsTab
            isOwner={isOwner}
            culqiEnabled={culqiEnabled}
            setCulqiEnabled={setCulqiEnabled}
            culqiEnvironment={culqiEnvironment}
            setCulqiEnvironment={setCulqiEnvironment}
            culqiPublicKey={culqiPublicKey}
            setCulqiPublicKey={setCulqiPublicKey}
            culqiSecretKey={culqiSecretKey}
            setCulqiSecretKey={setCulqiSecretKey}
          />
        )}

        {/* Botón Guardar - Siempre accesible al pie de cualquier pestaña */}
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
