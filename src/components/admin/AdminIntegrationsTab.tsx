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
  Info,
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
      // Limpiar inputs de llaves secretas tras guardar
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Credenciales e integraciones globales guardadas de forma segura en{' '}
            <code className="font-mono">platform_secrets</code>.
          </span>
        </div>
      )}

      {/* Aviso de seguridad */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-300 space-y-1">
          <p className="font-semibold text-amber-300">
            Almacenamiento Privado de SuperAdmin
          </p>
          <p className="text-neutral-400 leading-relaxed">
            Estas llaves se guardan aisladas en <code className="text-amber-300">platform_secrets</code>{' '}
            con acceso exclusivo del servidor y SuperAdmin. Los campos secretos ya configurados se
            muestran vacíos por seguridad: déjalos en blanco si deseas conservar el valor actual.
          </p>
        </div>
      </div>

      {/* 1. Cloudinary de la Plataforma */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cloudinary de la Plataforma (SuperAdmin)</h2>
              <p className="text-xs text-neutral-400">
                Almacena los comprobantes de pago de suscripciones y el QR oficial sin saturar Supabase.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={cloudinaryEnabled}
              onChange={(e) => setCloudinaryEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-950 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs font-semibold text-neutral-200">Habilitado</span>
          </label>
        </div>

        <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-start gap-2.5 text-xs text-neutral-300">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            Cuando una barbería sube su voucher de Yape/Plin/Transferencia, el servidor lo firma y sube
            automáticamente a <strong>tu Cloudinary</strong> bajo la carpeta{' '}
            <code className="text-sky-300">{cloudinaryFolder || 'barberos-saas'}/vouchers/</code>.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="plat_cloud_name"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Cloud Name
            </label>
            <input
              id="plat_cloud_name"
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              placeholder="ej. mi-barberos-saas"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="plat_cloud_folder"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Carpeta Base
            </label>
            <input
              id="plat_cloud_folder"
              type="text"
              value={cloudinaryFolder}
              onChange={(e) => setCloudinaryFolder(e.target.value)}
              placeholder="barberos-saas"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="plat_cloud_api_key"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              API Key (Firma Server-Side)
            </label>
            <input
              id="plat_cloud_api_key"
              type="text"
              value={cloudinaryApiKey}
              onChange={(e) => setCloudinaryApiKey(e.target.value)}
              placeholder="123456789012345"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plat_cloud_api_secret"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
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
                secretsView.has_cloudinary_api_secret
                  ? '•••••••••••• (dejar vacío para mantener)'
                  : 'Ingresa tu API Secret'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="plat_cloud_preset"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Upload Preset Unsigned (Opcional, respaldo si no usas API Key/Secret)
            </label>
            <input
              id="plat_cloud_preset"
              type="text"
              value={cloudinaryUploadPreset}
              onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
              placeholder="ej. barberos_vouchers_preset"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Correo Transaccional (Resend / SMTP) */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Servicio de Correo Transaccional</h2>
            <p className="text-xs text-neutral-400">
              Para envíos de bienvenida, aprobación/rechazo de suscripciones y alertas de vencimiento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="plat_email_provider"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Proveedor
            </label>
            <select
              id="plat_email_provider"
              value={emailProvider}
              onChange={(e) => setEmailProvider(e.target.value as 'NONE' | 'RESEND' | 'SMTP')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="NONE">Desactivado</option>
              <option value="RESEND">Resend (Recomendado)</option>
              <option value="SMTP">SMTP Personalizado</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="plat_email_from_name"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Nombre Remitente
            </label>
            <input
              id="plat_email_from_name"
              type="text"
              value={emailFromName}
              onChange={(e) => setEmailFromName(e.target.value)}
              placeholder="BarberOS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="plat_email_from_address"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Correo Remitente
            </label>
            <input
              id="plat_email_from_address"
              type="email"
              value={emailFromAddress}
              onChange={(e) => setEmailFromAddress(e.target.value)}
              placeholder="no-reply@tudominio.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {emailProvider === 'RESEND' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plat_resend_api_key"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
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
                secretsView.has_resend_api_key
                  ? 're_•••••••••••• (dejar vacío para mantener)'
                  : 're_xxxxxxxxx'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {emailProvider === 'SMTP' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="plat_smtp_host"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                SMTP Host
              </label>
              <input
                id="plat_smtp_host"
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_smtp_port"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                SMTP Puerto
              </label>
              <input
                id="plat_smtp_port"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="plat_smtp_user"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                SMTP Usuario
              </label>
              <input
                id="plat_smtp_user"
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="usuario@dominio.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="plat_smtp_password"
                  className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                >
                  SMTP Contraseña / App Password
                </label>
                <SecretBadge configured={secretsView.has_smtp_password} />
              </div>
              <input
                id="plat_smtp_password"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder={
                  secretsView.has_smtp_password
                    ? '•••••••••••• (dejar vacío para mantener)'
                    : 'Contraseña SMTP'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. WhatsApp Oficial de la Plataforma */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">WhatsApp Oficial del SaaS (SuperAdmin)</h2>
            <p className="text-xs text-neutral-400">
              Línea corporativa para avisar a dueños de barberías sobre suscripciones y recibir alertas de nuevos comprobantes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="plat_wa_provider"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Motor WhatsApp
            </label>
            <select
              id="plat_wa_provider"
              value={whatsappProvider}
              onChange={(e) =>
                setWhatsappProvider(e.target.value as 'NONE' | 'META_CLOUD' | 'CUSTOM_GATEWAY')
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="NONE">Desactivado</option>
              <option value="META_CLOUD">Meta Cloud API (Oficial)</option>
              <option value="CUSTOM_GATEWAY">Gateway Propio (Evolution API / WPPConnect)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="plat_wa_admin_phone"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Teléfono SuperAdmin para Alertas
            </label>
            <input
              id="plat_wa_admin_phone"
              type="text"
              value={whatsappAdminPhone}
              onChange={(e) => setWhatsappAdminPhone(e.target.value)}
              placeholder="Ej: 51999888777"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          {whatsappProvider === 'META_CLOUD' && (
            <>
              <div>
                <label
                  htmlFor="plat_wa_phone_id"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  Phone Number ID (Meta)
                </label>
                <input
                  id="plat_wa_phone_id"
                  type="text"
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                  placeholder="109876543210987"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="plat_wa_token"
                    className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                  >
                    Access Token Permanente
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
                      ? 'EAA•••••••••••• (dejar vacío para mantener)'
                      : 'EAAxxxxxx...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          {whatsappProvider === 'CUSTOM_GATEWAY' && (
            <>
              <div>
                <label
                  htmlFor="plat_wa_gateway_url"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
                >
                  URL del Gateway
                </label>
                <input
                  id="plat_wa_gateway_url"
                  type="url"
                  value={whatsappGatewayUrl}
                  onChange={(e) => setWhatsappGatewayUrl(e.target.value)}
                  placeholder="https://api.tugateway.com/message/sendText"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="plat_wa_gw_token"
                    className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                  >
                    API Key / Token del Gateway
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
                      ? '•••••••••••• (dejar vacío para mantener)'
                      : 'Token del gateway'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Pasarelas de Pago SaaS & Automatización */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Pasarela de Cobro SaaS & Automatización</h2>
            <p className="text-xs text-neutral-400">
              Llaves para cobro automático con tarjeta (Culqi / MercadoPago), Cron Jobs y Webhooks de alertas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="plat_culqi_pk"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Culqi Public Key (SaaS)
            </label>
            <input
              id="plat_culqi_pk"
              type="text"
              value={culqiPublicKey}
              onChange={(e) => setCulqiPublicKey(e.target.value)}
              placeholder="pk_live_..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plat_culqi_sk"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
              >
                Culqi Secret Key (SaaS)
              </label>
              <SecretBadge configured={secretsView.has_culqi_secret_key} />
            </div>
            <input
              id="plat_culqi_sk"
              type="password"
              value={culqiSecretKey}
              onChange={(e) => setCulqiSecretKey(e.target.value)}
              placeholder={
                secretsView.has_culqi_secret_key
                  ? 'sk_•••••••••••• (dejar vacío para mantener)'
                  : 'sk_live_...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="plat_mp_pk"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              MercadoPago Public Key (SaaS)
            </label>
            <input
              id="plat_mp_pk"
              type="text"
              value={mpPublicKey}
              onChange={(e) => setMpPublicKey(e.target.value)}
              placeholder="APP_USR-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plat_mp_token"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
              >
                MercadoPago Access Token (SaaS)
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
                  ? 'APP_USR-•••••••• (dejar vacío para mantener)'
                  : 'APP_USR-...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plat_cron_secret"
                className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
              >
                Cron Secret (Tareas Programadas)
              </label>
              <SecretBadge configured={secretsView.has_cron_secret} />
            </div>
            <input
              id="plat_cron_secret"
              type="password"
              value={cronSecret}
              onChange={(e) => setCronSecret(e.target.value)}
              placeholder={
                secretsView.has_cron_secret
                  ? '•••••••••••• (dejar vacío para mantener)'
                  : 'Token secreto para /api/cron/*'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="plat_webhook_url"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Webhook de Alertas (Discord / Slack / n8n)
            </label>
            <input
              id="plat_webhook_url"
              type="url"
              value={webhookNotifyUrl}
              onChange={(e) => setWebhookNotifyUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Llaves e Integraciones</span>
        </button>
      </div>
    </form>
  )
}
