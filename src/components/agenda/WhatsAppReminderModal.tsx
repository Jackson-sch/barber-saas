'use client'

import { useState, useEffect } from 'react'
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Send,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Scissors,
  Phone,
  RotateCcw,
} from 'lucide-react'
import type { AppointmentWithDetails } from './AppointmentDetailModal'
import type { WhatsAppNotificationSettings } from '@/types/database.types'
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  replaceAppointmentVariables,
  formatWhatsAppUrl,
  type AppointmentDataForWhatsApp,
} from '@/lib/whatsapp'

type TemplateType = 'reminder' | 'confirmation' | 'reschedule' | 'followup'

interface WhatsAppReminderModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentWithDetails | null
  barberiaName: string
  barberiaAddress?: string | null
  customTemplates?: WhatsAppNotificationSettings | null
}

export default function WhatsAppReminderModal({
  isOpen,
  onClose,
  appointment,
  barberiaName,
  barberiaAddress,
  customTemplates,
}: WhatsAppReminderModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('reminder')
  const [customMessage, setCustomMessage] = useState('')
  const [copied, setCopied] = useState(false)

  // Preparar datos de la cita para el template
  const appointmentData: AppointmentDataForWhatsApp | null = appointment
    ? {
        clientName: appointment.client?.full_name || 'Cliente',
        clientPhone: appointment.client?.phone || '',
        barberName: appointment.barber?.nickname || appointment.barber?.full_name || 'Especialista',
        serviceName: appointment.service?.name || 'Servicio de Barbería',
        servicePrice: Number(appointment.total_price || appointment.service?.price || 0),
        startTime: appointment.start_time,
        barberiaName: barberiaName || 'Barbería',
        barberiaAddress: barberiaAddress || null,
      }
    : null

  // Cargar texto según plantilla seleccionada
  useEffect(() => {
    if (!appointmentData) return

    let templateStr = DEFAULT_WHATSAPP_TEMPLATES[selectedTemplate]
    if (customTemplates) {
      if (selectedTemplate === 'reminder' && customTemplates.reminder_template) {
        templateStr = customTemplates.reminder_template
      } else if (selectedTemplate === 'confirmation' && customTemplates.confirmation_template) {
        templateStr = customTemplates.confirmation_template
      } else if (selectedTemplate === 'reschedule' && customTemplates.reschedule_template) {
        templateStr = customTemplates.reschedule_template
      } else if (selectedTemplate === 'followup' && customTemplates.followup_template) {
        templateStr = customTemplates.followup_template
      }
    }

    setCustomMessage(replaceAppointmentVariables(templateStr, appointmentData))
    setCopied(false)
  }, [selectedTemplate, appointment, barberiaName, barberiaAddress, customTemplates])

  if (!isOpen || !appointment || !appointmentData) return null

  const phoneClean = appointment.client?.phone?.replace(/\D/g, '') || ''
  const waUrl = formatWhatsAppUrl(appointment.client?.phone || '', customMessage)

  function handleCopy() {
    navigator.clipboard.writeText(customMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleResetTemplate() {
    if (!appointmentData) return
    const rawTemplate = DEFAULT_WHATSAPP_TEMPLATES[selectedTemplate]
    setCustomMessage(replaceAppointmentVariables(rawTemplate, appointmentData))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0d0e15]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Notificación vía WhatsApp
              </h3>
              <p className="text-xs text-neutral-400">
                Para: <span className="text-white font-medium">{appointment.client?.full_name}</span>{' '}
                ({appointment.client?.phone || 'Sin teléfono'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Selector de Plantilla */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Tipo de Mensaje
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'reminder', label: 'Recordatorio', icon: Clock },
                  { id: 'confirmation', label: 'Confirmación', icon: CheckCircle2 },
                  { id: 'reschedule', label: 'Reprogramación', icon: RefreshCw },
                  { id: 'followup', label: 'Agradecimiento', icon: Scissors },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const isActive = selectedTemplate === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tab.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Editor de Mensaje */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Mensaje a Enviar (Editable)
              </label>
              <button
                type="button"
                onClick={handleResetTemplate}
                className="text-[11px] text-neutral-400 hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                title="Restaurar texto predeterminado"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar</span>
              </button>
            </div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-none"
              placeholder="Escribe el mensaje..."
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Puedes agregar emojis o detalles adicionales antes de enviar el mensaje al cliente.
            </p>
          </div>

          {/* Simulación Visual de Burbuja WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Vista Previa en WhatsApp
            </label>
            <div className="p-4 rounded-xl bg-[#0b141a] border border-[#1f2c34] relative overflow-hidden">
              {/* WhatsApp Chat Bubble */}
              <div className="max-w-[90%] sm:max-w-[82%] ml-auto bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none shadow-md space-y-2">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{customMessage}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-white/70">
                  <span>
                    {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-sky-300">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-[#0d0e15] gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-neutral-400 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Cerrar
            </button>

            {phoneClean ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Abrir WhatsApp</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="py-2.5 px-4 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-semibold cursor-not-allowed opacity-60"
              >
                Sin Teléfono
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
