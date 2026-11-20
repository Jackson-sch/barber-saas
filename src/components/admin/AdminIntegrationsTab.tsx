'use client'

import React, { useState } from 'react'
import {
  Cloud,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { updatePlatformSecretsAction } from '@/actions/platform'
import type { PlatformSecretsSafeView } from '@/lib/platform-secrets'

interface AdminIntegrationsTabProps {
  initialSecrets: PlatformSecretsSafeView
}

function SecretBadge({ configured }: { configured: boolean }) {
  if (!configured) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
      <Lock className="w-2.5 h-2.5" />
      Configurado
    </span>
  )
}

export default function AdminIntegrationsTab({ initialSecrets }: AdminIntegrationsTabProps) {
  const [secretsView, setSecretsView] = useState<PlatformSecretsSafeView>(initialSecrets)

  // Cloudinary
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState(initialSecrets.cloudinary_enabled)
  const [cloudName, setCloudName] = useState(initialSecrets.cloudinary_cloud_name)
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(initialSecrets.cloudinary_api_key)
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('')
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState(
    initialSecrets.cloudinary_upload_preset
  )
  const [cloudinaryFolder, setCloudinaryFolder] = useState(initialSecrets.cloudinary_folder)

  // Email
  const [emailProvider, setEmailProvider] = useState<'NONE' | 'RESEND' | 'SMTP'>(
    initialSecrets.email_provider
  )
  const [emailFromName, setEmailFromName] = useState(initialSecrets.email_from_name)
  const [emailFromAddress, setEmailFromAddress] = useState(initialSecrets.email_from_address)
  const [resendApiKey, setResendApiKey] = useState('')
  const [smtpHost, setSmtpHost] = useState(initialSecrets.smtp_host)
  const [smtpPort, setSmtpPort] = useState(String(initialSecrets.smtp_port || 587))
  const [smtpUser, setSmtpUser] = useState(initialSecrets.smtp_user)
  const [smtpPassword, setSmtpPassword] = useState('')

  // WhatsApp
  const [whatsappProvider, setWhatsappProvider] = useState<
    'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY'
  >(initialSecrets.whatsapp_provider)
  const [whatsappPhoneId, setWhatsappPhoneId] = useState(initialSecrets.whatsapp_phone_number_id)
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('')
  const [whatsappGatewayUrl, setWhatsappGatewayUrl] = useState(initialSecrets.whatsapp_gateway_url)
  const [whatsappAdminPhone, setWhatsappAdminPhone] = useState(
    initialSecrets.whatsapp_admin_notify_phone
  )

  // Pasarelas SaaS & Automatización
  const [culqiPublicKey, setCulqiPublicKey] = useState(initialSecrets.culqi_public_key)
  const [culqiSecretKey, setCulqiSecretKey] = useState('')
  const [mpPublicKey, setMpPublicKey] = useState(initialSecrets.mercadopago_public_key)
  const [mpAccessToken, setMpAccessToken] = useState('')
  const [cronSecret, setCronSecret] = useState('')
  const [webhookNotifyUrl, setWebhookNotifyUrl] = useState(initialSecrets.webhook_notify_url)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await updatePlatformSecretsAction({
      cloudinary_enabled: cloudinaryEnabled,
      cloudinary_cloud_name: cloudName,
      cloudinary_api_key: cloudinaryApiKey,
      cloudinary_api_secret: cloudinaryApiSecret || null,
      cloudinary_upload_preset: cloudinaryUploadPreset,
      cloudinary_folder: cloudinaryFolder,

      email_provider: emailProvider,
      email_from_name: emailFromName,
      email_from_address: emailFromAddress,
      resend_api_key: resendApiKey || null,
      smtp_host: smtpHost,
      smtp_port: parseInt(smtpPort, 10) || 587,
      smtp_user: smtpUser,
      smtp_password: smtpPassword || null,

      whatsapp_provider: whatsappProvider,
      whatsapp_phone_number_id: whatsappPhoneId,
      whatsapp_access_token: whatsappAccessToken || null,
      whatsapp_gateway_url: whatsappGatewayUrl,
      whatsapp_admin_notify_phone: whatsappAdminPhone,

      culqi_public_key: culqiPublicKey,
      culqi_secret_key: culqiSecretKey || null,
      mercadopago_public_key: mpPublicKey,
      mercadopago_access_token: mpAccessToken || null,

      cron_secret: cronSecret || null,
      webhook_notify_url: webhookNotifyUrl,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      if (res.secretsView) {
        setSecretsView(res.secretsView)
      }
      setCloudinaryApiSecret('')
      setResendApiKey('')
      setSmtpPassword('')
      setWhatsappAccessToken('')
      setCulqiSecretKey('')
      setMpAccessToken('')
      setCronSecret('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Credenciales e integraciones globales guardadas en{' '}
            <code className="font-mono">platform_secrets</code>.
          </span>
        </div>
      )}

      {/* Barra superior Bento: Aviso de seguridad + Botón Guardar */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 text-xs text-neutral-300">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-neutral-400 leading-snug">
            <strong className="text-amber-300">Bóveda SuperAdmin:</strong> los secretos guardados
            permanecen ocultos por seguridad; deja un campo secreto vacío para conservar su valor actual.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Guardar Llaves</span>
        </button>
      </div>

      {/* Bento Grid 2x2 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* 1. Cloudinary de la Plataforma */}
        <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Cloudinary Plataforma</h2>
                <p className="text-[11px] text-neutral-400">
                  Vouchers de suscripción y QR oficial ({cloudinaryFolder || 'barberos-saas'}/vouchers).
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
              <input
                type="checkbox"
                checked={cloudinaryEnabled}
                onChange={(e) => setCloudinaryEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-[11px] font-semibold text-neutral-200">Activo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="plat_cloud_name"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Cloud Name
              </label>
              <input
                id="plat_cloud_name"
                type="text"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                placeholder="ej. mi-barberos-saas"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_cloud_folder"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Carpeta Base
              </label>
              <input
                id="plat_cloud_folder"
                type="text"
                value={cloudinaryFolder}
                onChange={(e) => setCloudinaryFolder(e.target.value)}
                placeholder="barberos-saas"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_cloud_api_key"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                API Key
              </label>
              <input
                id="plat_cloud_api_key"
                type="text"
                value={cloudinaryApiKey}
                onChange={(e) => setCloudinaryApiKey(e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="plat_cloud_api_secret"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                >
                  API Secret
                </label>
                <SecretBadge configured={secretsView.has_cloudinary_api_secret} />
              </div>
              <input
                id="plat_cloud_api_secret"
                type="password"
                value={cloudinaryApiSecret}
                onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                placeholder={
                  secretsView.has_cloudinary_api_secret ? '•••••••• (mantener)' : 'API Secret'
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="plat_cloud_preset"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Upload Preset Unsigned (Opcional)
              </label>
              <input
                id="plat_cloud_preset"
                type="text"
                value={cloudinaryUploadPreset}
                onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                placeholder="ej. barberos_vouchers_preset"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Correo Transaccional */}
        <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Correo Transaccional</h2>
              <p className="text-[11px] text-neutral-400">
                Bienvenidas, aprobación de pagos y avisos de vencimiento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="plat_email_provider"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Proveedor
              </label>
              <select
                id="plat_email_provider"
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value as 'NONE' | 'RESEND' | 'SMTP')}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="NONE">Desactivado</option>
                <option value="RESEND">Resend (Recomendado)</option>
                <option value="SMTP">SMTP Personalizado</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="plat_email_from_name"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Nombre Remitente
              </label>
              <input
                id="plat_email_from_name"
                type="text"
                value={emailFromName}
                onChange={(e) => setEmailFromName(e.target.value)}
                placeholder="BarberOS"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_email_from_address"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Correo Remitente
              </label>
              <input
                id="plat_email_from_address"
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="no-reply@tudominio.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {emailProvider === 'RESEND' && (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="plat_resend_api_key"
                    className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                  >
                    Resend API Key
                  </label>
                  <SecretBadge configured={secretsView.has_resend_api_key} />
                </div>
                <input
                  id="plat_resend_api_key"
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder={
                    secretsView.has_resend_api_key ? 're_•••••••• (mantener)' : 're_xxxxxxxxx'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {emailProvider === 'SMTP' && (
              <>
                <div>
                  <label
                    htmlFor="plat_smtp_host"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    SMTP Host
                  </label>
                  <input
                    id="plat_smtp_host"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="plat_smtp_port"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    SMTP Puerto
                  </label>
                  <input
                    id="plat_smtp_port"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="plat_smtp_user"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    SMTP Usuario
                  </label>
                  <input
                    id="plat_smtp_user"
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="usuario@dominio.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="plat_smtp_password"
                      className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                    >
                      SMTP Password
                    </label>
                    <SecretBadge configured={secretsView.has_smtp_password} />
                  </div>
                  <input
                    id="plat_smtp_password"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder={
                      secretsView.has_smtp_password ? '•••••••• (mantener)' : 'Contraseña SMTP'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. WhatsApp Oficial del SaaS */}
        <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">WhatsApp Oficial del SaaS</h2>
              <p className="text-[11px] text-neutral-400">
                Avisos a dueños de barberías y alertas de nuevos comprobantes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="plat_wa_provider"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Motor WhatsApp
              </label>
              <select
                id="plat_wa_provider"
                value={whatsappProvider}
                onChange={(e) =>
                  setWhatsappProvider(e.target.value as 'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY')
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="NONE">Desactivado</option>
                <option value="META_CLOUD">Meta Cloud API</option>
                <option value="CUSTOM_GATEWAY">Gateway Propio (Evolution / WPP)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="plat_wa_admin_phone"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Teléfono Alertas SuperAdmin
              </label>
              <input
                id="plat_wa_admin_phone"
                type="text"
                value={whatsappAdminPhone}
                onChange={(e) => setWhatsappAdminPhone(e.target.value)}
                placeholder="Ej: 51999888777"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {whatsappProvider === 'META_CLOUD' && (
              <>
                <div>
                  <label
                    htmlFor="plat_wa_phone_id"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Phone Number ID
                  </label>
                  <input
                    id="plat_wa_phone_id"
                    type="text"
                    value={whatsappPhoneId}
                    onChange={(e) => setWhatsappPhoneId(e.target.value)}
                    placeholder="109876543210987"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="plat_wa_token"
                      className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                    >
                      Access Token
                    </label>
                    <SecretBadge configured={secretsView.has_whatsapp_access_token} />
                  </div>
                  <input
                    id="plat_wa_token"
                    type="password"
                    value={whatsappAccessToken}
                    onChange={(e) => setWhatsappAccessToken(e.target.value)}
                    placeholder={
                      secretsView.has_whatsapp_access_token
                        ? 'EAA•••••••• (mantener)'
                        : 'EAAxxxxxx...'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            {whatsappProvider === 'CUSTOM_GATEWAY' && (
              <>
                <div>
                  <label
                    htmlFor="plat_wa_gateway_url"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    URL del Gateway
                  </label>
                  <input
                    id="plat_wa_gateway_url"
                    type="url"
                    value={whatsappGatewayUrl}
                    onChange={(e) => setWhatsappGatewayUrl(e.target.value)}
                    placeholder="https://api.tugateway.com/message/sendText"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="plat_wa_gw_token"
                      className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                    >
                      Token Gateway
                    </label>
                    <SecretBadge configured={secretsView.has_whatsapp_access_token} />
                  </div>
                  <input
                    id="plat_wa_gw_token"
                    type="password"
                    value={whatsappAccessToken}
                    onChange={(e) => setWhatsappAccessToken(e.target.value)}
                    placeholder={
                      secretsView.has_whatsapp_access_token
                        ? '•••••••• (mantener)'
                        : 'Token del gateway'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Pasarelas de Pago SaaS & Automatización */}
        <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Pasarelas SaaS & Automatización</h2>
              <p className="text-[11px] text-neutral-400">
                Culqi, MercadoPago, Cron Secret y Webhook de alertas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="plat_culqi_pk"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Culqi Public Key
              </label>
              <input
                id="plat_culqi_pk"
                type="text"
                value={culqiPublicKey}
                onChange={(e) => setCulqiPublicKey(e.target.value)}
                placeholder="pk_live_..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="plat_culqi_sk"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                >
                  Culqi Secret Key
                </label>
                <SecretBadge configured={secretsView.has_culqi_secret_key} />
              </div>
              <input
                id="plat_culqi_sk"
                type="password"
                value={culqiSecretKey}
                onChange={(e) => setCulqiSecretKey(e.target.value)}
                placeholder={
                  secretsView.has_culqi_secret_key ? 'sk_•••••••• (mantener)' : 'sk_live_...'
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_mp_pk"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                MercadoPago Public Key
              </label>
              <input
                id="plat_mp_pk"
                type="text"
                value={mpPublicKey}
                onChange={(e) => setMpPublicKey(e.target.value)}
                placeholder="APP_USR-..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="plat_mp_token"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                >
                  MercadoPago Token
                </label>
                <SecretBadge configured={secretsView.has_mercadopago_access_token} />
              </div>
              <input
                id="plat_mp_token"
                type="password"
                value={mpAccessToken}
                onChange={(e) => setMpAccessToken(e.target.value)}
                placeholder={
                  secretsView.has_mercadopago_access_token
                    ? 'APP_USR-•••• (mantener)'
                    : 'APP_USR-...'
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="plat_cron_secret"
                  className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
                >
                  Cron Secret
                </label>
                <SecretBadge configured={secretsView.has_cron_secret} />
              </div>
              <input
                id="plat_cron_secret"
                type="password"
                value={cronSecret}
                onChange={(e) => setCronSecret(e.target.value)}
                placeholder={
                  secretsView.has_cron_secret ? '•••••••• (mantener)' : 'Token /api/cron/*'
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_webhook_url"
                className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
              >
                Webhook Alertas
              </label>
              <input
                id="plat_webhook_url"
                type="url"
                value={webhookNotifyUrl}
                onChange={(e) => setWebhookNotifyUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
