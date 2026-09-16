'use client'

import React, { useState } from 'react'
import {
  MessageCircle,
  Database,
  Send,
  Key,
  Radio,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { AVAILABLE_WHATSAPP_VARIABLES } from '@/lib/whatsapp'
import { testWhatsAppCredentialsAction } from '@/actions/whatsapp'

interface WhatsAppSettingsTabProps {
  organizationId: string
  organizationName: string
  isOwner: boolean
  waProvider: 'MANUAL' | 'META_CLOUD_API' | 'CUSTOM_GATEWAY'
  setWaProvider: (val: 'MANUAL' | 'META_CLOUD_API' | 'CUSTOM_GATEWAY') => void
  waPhoneNumberId: string
  setWaPhoneNumberId: (val: string) => void
  waAccessToken: string
  setWaAccessToken: (val: string) => void
  waWebhookUrl: string
  setWaWebhookUrl: (val: string) => void
  waWebhookBearerToken: string
  setWaWebhookBearerToken: (val: string) => void
  reminderTemplate: string
  setReminderTemplate: (val: string) => void
  confirmationTemplate: string
  setConfirmationTemplate: (val: string) => void
  rescheduleTemplate: string
  setRescheduleTemplate: (val: string) => void
  followupTemplate: string
  setFollowupTemplate: (val: string) => void
  initialPhone?: string | null
}

export default function WhatsAppSettingsTab({
  organizationId,
  organizationName,
  isOwner,
  waProvider,
  setWaProvider,
  waPhoneNumberId,
  setWaPhoneNumberId,
  waAccessToken,
  setWaAccessToken,
  waWebhookUrl,
  setWaWebhookUrl,
  waWebhookBearerToken,
  setWaWebhookBearerToken,
  reminderTemplate,
  setReminderTemplate,
  confirmationTemplate,
  setConfirmationTemplate,
  rescheduleTemplate,
  setRescheduleTemplate,
  followupTemplate,
  setFollowupTemplate,
  initialPhone,
}: WhatsAppSettingsTabProps) {
  const [activeWaTab, setActiveWaTab] = useState<'reminder' | 'confirmation' | 'reschedule' | 'followup'>('reminder')
  const [testPhone, setTestPhone] = useState(initialPhone || '')
  const [testingWa, setTestingWa] = useState(false)
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleTestWhatsApp() {
    if (!testPhone.trim()) {
      setWaTestResult({ success: false, message: 'Ingresa un número de celular de prueba con código de país (ej. +51 987 654 321).' })
      return
    }
    setTestingWa(true)
    setWaTestResult(null)
    try {
      const res = await testWhatsAppCredentialsAction({
        testPhone,
        organizationName,
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

  return (
    <div className="space-y-6">
      {/* Banner de Aislamiento y Exclusividad en Base de Datos */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0e1017] to-neutral-900 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">
              Credenciales Aisladas y Guardadas en Base de Datos
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Las claves de API, ID de teléfono y tokens son 100% privados y exclusivos para <span className="text-white font-semibold">{organizationName}</span>. Se almacenan de forma segura en PostgreSQL por organización (<code className="text-emerald-400 text-[10px]">organizations.settings</code>).
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Tenant ID: {organizationId.slice(0, 8)}...
        </span>
      </div>

      {/* Tarjeta Principal de Configuración */}
      <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MessageCircle className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Notificaciones de WhatsApp (Motor Híbrido)
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
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Meta Cloud API (Oficial)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    100% Auto
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Despacho desatendido en segundo plano usando la API directa de Meta Cloud. Requiere WhatsApp Business Platform.
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
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    Gateway / Webhook
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-bold">
                    Avanzado
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Conecta tu propio bot o gateway HTTP externo (Baileys, Evolution API, Z-API o n8n).
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Campos condicionales según el proveedor seleccionado */}
        {waProvider === 'META_CLOUD_API' && (
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Credenciales Meta Cloud API
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Phone Number ID (ID del número de teléfono)
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={waPhoneNumberId}
                  onChange={(e) => setWaPhoneNumberId(e.target.value)}
                  placeholder="Ej. 109283746592019"
                  className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Obtenlo en Meta Developers &gt; WhatsApp &gt; Configuración de la API.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Access Token Permanente (Bearer)
                </label>
                <input
                  type="password"
                  disabled={!isOwner}
                  value={waAccessToken}
                  onChange={(e) => setWaAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Token de usuario del sistema con permisos <code>whatsapp_business_messaging</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {waProvider === 'CUSTOM_GATEWAY' && (
          <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Endpoint de Gateway Externo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Webhook / Endpoint URL
                </label>
                <input
                  type="url"
                  disabled={!isOwner}
                  value={waWebhookUrl}
                  onChange={(e) => setWaWebhookUrl(e.target.value)}
                  placeholder="https://api.tudominio.com/send-message"
                  className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Bearer Token de Autenticación (Opcional)
                </label>
                <input
                  type="password"
                  disabled={!isOwner}
                  value={waWebhookBearerToken}
                  onChange={(e) => setWaWebhookBearerToken(e.target.value)}
                  placeholder="Bearer token o secret key..."
                  className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Probador de Conexión en Vivo */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              Probar Envío de WhatsApp en Vivo
            </span>
            <span className="text-[11px] text-neutral-400">
              Verifica tus credenciales antes de activar clientes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Número de celular (+51 987 654 321)"
              className="w-full sm:flex-1 p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="button"
              disabled={testingWa}
              onClick={handleTestWhatsApp}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testingWa ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Probar Conexión</span>
            </button>
          </div>

          {waTestResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                waTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {waTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              )}
              <p className="leading-relaxed">{waTestResult.message}</p>
            </div>
          )}
        </div>

        {/* Editor de Plantillas de Mensajes */}
        <div className="space-y-4 pt-2 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Plantillas de Mensajes Automatizados
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Personaliza los textos que se envían o copian a los clientes en cada etapa de su cita.
              </p>
            </div>
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <Info className="w-3 h-3" />
              Soporta etiquetas dinámicas {'{{variable}}'}
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
    </div>
  )
}
