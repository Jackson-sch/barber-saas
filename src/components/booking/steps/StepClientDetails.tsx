'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  CreditCard,
  Store,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Info,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { ManualPaymentSettings } from '../types'

interface StepClientDetailsProps {
  clientName: string
  setClientName: (v: string) => void
  clientPhone: string
  setClientPhone: (v: string) => void
  clientEmail: string
  setClientEmail: (v: string) => void
  clientNotes: string
  setClientNotes: (v: string) => void
  paymentMode: 'IN_PERSON' | 'QR_WALLET' | 'CULQI_ONLINE'
  setPaymentMode: (mode: 'IN_PERSON' | 'QR_WALLET' | 'CULQI_ONLINE') => void
  culqiAvailable: boolean
  qrAvailable: boolean
  manualPaymentSettings?: ManualPaymentSettings | null
  paymentReference: string
  setPaymentReference: (v: string) => void
  voucherImage: string
  setVoucherImage: (v: string) => void
  voucherFileName: string
  handleVoucherUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  loading: boolean
  activeServiceName?: string
  activeServicePrice?: number
  activeBarberName?: string
  selectedDate: string
  selectedTime: string
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function StepClientDetails({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  clientNotes,
  setClientNotes,
  paymentMode,
  setPaymentMode,
  culqiAvailable,
  qrAvailable,
  manualPaymentSettings,
  paymentReference,
  setPaymentReference,
  voucherImage,
  setVoucherImage,
  voucherFileName,
  handleVoucherUpload,
  loading,
  activeServiceName,
  activeServicePrice,
  activeBarberName,
  selectedDate,
  selectedTime,
  onBack,
  onSubmit,
}: StepClientDetailsProps) {
  const [copiedPhone, setCopiedPhone] = useState(false)
  const hasDigitalOptions = culqiAvailable || qrAvailable

  function handleCopyPhone(phoneToCopy: string) {
    navigator.clipboard.writeText(phoneToCopy)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const payPhone = manualPaymentSettings?.paymentPhone || ''
  const beneficiary = manualPaymentSettings?.beneficiaryName || ''
  const walletType = manualPaymentSettings?.walletType || 'Yape / Plin'
  const qrImage = manualPaymentSettings?.qrImageUrl || ''
  const instructions =
    manualPaymentSettings?.instructions ||
    'Escanea el código QR o transfiere al número indicado. Luego confirma tu cita para asegurar tu horario.'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Tus Datos de Reserva</h2>
        <p className="text-xs text-neutral-400 mt-1">Ingresa tus datos para registrar y recordarte tu cita</p>
      </div>

      {/* Ticket preview */}
      <div className="rounded-xl bg-[#090A0E] border border-white/10 p-3.5 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-neutral-400">
          <span>Servicio:</span>
          <span className="text-white font-medium">{activeServiceName}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400">
          <span>Especialista:</span>
          <span className="text-white font-medium">{activeBarberName}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400">
          <span>Fecha & Horario:</span>
          <span className="text-amber-400 font-mono font-medium">
            {selectedDate} - {selectedTime}
          </span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 pt-1.5 border-t border-dashed border-white/10">
          <span>Importe a Pagar:</span>
          <span className="text-amber-400 font-mono font-bold text-sm">
            {formatPrice(Number(activeServicePrice || 0))}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="client_name_input" className="block text-xs font-medium text-neutral-300 mb-1.5">
          Nombre Completo
        </label>
        <input
          id="client_name_input"
          type="text"
          required
          placeholder="Ej: Rodrigo Valenzuela"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div>
        <label htmlFor="client_phone_input" className="block text-xs font-medium text-neutral-300 mb-1.5">
          WhatsApp / Celular
        </label>
        <input
          id="client_phone_input"
          type="tel"
          required
          placeholder="+51 987 654 321"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      <div>
        <label htmlFor="client_notes_input" className="block text-xs font-medium text-neutral-300 mb-1.5">
          Notas o Preferencias (Opcional)
        </label>
        <input
          id="client_notes_input"
          type="text"
          placeholder="Ej: Preferencia de corte o barba..."
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {/* Selector de Modalidad de Pago */}
      {hasDigitalOptions && (
        <div className="pt-3 border-t border-white/10 space-y-3">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
            Modalidad de Pago
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Opción 1: En el Salón */}
            <button
              type="button"
              onClick={() => setPaymentMode('IN_PERSON')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                paymentMode === 'IN_PERSON'
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                  : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
              }`}
            >
              <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-white">Pagar en el Salón</span>
                <span className="text-[11px] text-neutral-400 block mt-0.5 leading-snug">
                  Efectivo, POS físico o Yape al llegar al local.
                </span>
              </div>
            </button>

            {/* Opción 2: QR / Yape / Plin */}
            {qrAvailable && (
              <button
                type="button"
                onClick={() => setPaymentMode('QR_WALLET')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  paymentMode === 'QR_WALLET'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Pagar con QR</span>
                    <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                      {walletType}
                    </span>
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5 leading-snug">
                    Escanea el código QR o transfiere a su número.
                  </span>
                </div>
              </button>
            )}

            {/* Opción 3: Culqi Online */}
            {culqiAvailable && (
              <button
                type="button"
                onClick={() => setPaymentMode('CULQI_ONLINE')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  paymentMode === 'CULQI_ONLINE'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                    : 'bg-[#090A0E] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Tarjeta Online</span>
                    <span className="text-[9px] font-mono font-bold px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      Culqi
                    </span>
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5 leading-snug">
                    Tarjeta Débito/Crédito en vivo.
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* DETALLES DE PAGO CON CÓDIGO QR */}
          {paymentMode === 'QR_WALLET' && qrAvailable && (
            <div className="p-4 rounded-2xl bg-[#090A0E] border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Escanea y Paga ({walletType})
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total: {formatPrice(Number(activeServicePrice || 0))}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Visualizador del Código QR con fondo blanco de alto contraste */}
                {qrImage ? (
                  <div className="w-40 h-40 sm:w-44 sm:h-44 bg-white p-2.5 rounded-2xl shadow-xl border border-neutral-200 shrink-0 flex items-center justify-center">
                    <img
                      src={qrImage}
                      alt={`QR ${walletType}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 bg-neutral-900 border border-white/10 rounded-2xl p-3 shrink-0 flex flex-col items-center justify-center text-center text-neutral-400">
                    <QrCode className="w-10 h-10 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-neutral-400">Transfiere directo al número</span>
                  </div>
                )}

                {/* Datos del Beneficiario y Teléfono */}
                <div className="flex-1 space-y-2.5 w-full text-left">
                  {beneficiary && (
                    <div className="text-xs">
                      <span className="text-neutral-400 block text-[11px]">Titular:</span>
                      <span className="text-white font-semibold">{beneficiary}</span>
                    </div>
                  )}

                  {payPhone && (
                    <div className="text-xs">
                      <span className="text-neutral-400 block text-[11px]">Número para transferir:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                          {payPhone}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(payPhone)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedPhone ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {instructions && (
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-neutral-300 flex items-start gap-1.5 leading-relaxed">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{instructions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subida de Captura de Pantalla del Comprobante */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="voucher_file_input" className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Captura de Pantalla del Comprobante</span>
                  </label>
                  {manualPaymentSettings?.requireVoucher ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Obligatorio
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Recomendado
                    </span>
                  )}
                </div>

                {voucherImage ? (
                  <div className="p-3 rounded-xl bg-[#07080B] border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                        <img
                          src={voucherImage}
                          alt="Comprobante de pago"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Comprobante Adjunto</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate max-w-[180px] sm:max-w-xs">
                          {voucherFileName || 'captura_de_pago.jpg'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label htmlFor="voucher_file_input" className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Cambiar</span>
                        <input
                          id="voucher_file_input"
                          type="file"
                          accept="image/*"
                          onChange={handleVoucherUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherImage('')
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                        title="Quitar comprobante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="voucher_file_input" className="p-4 rounded-xl border border-dashed border-white/20 hover:border-emerald-500/50 bg-[#07080B]/60 hover:bg-emerald-500/[0.03] transition flex flex-col items-center justify-center text-center cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                      Subir foto o captura del pago
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">
                      Adjunta la constancia de tu Yape o Plin (PNG, JPG hasta 8MB)
                    </span>
                    <input
                      id="voucher_file_input"
                      type="file"
                      accept="image/*"
                      onChange={handleVoucherUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Referencia adicional */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <label htmlFor="payment_reference_input" className="block text-xs font-medium text-neutral-300">
                  N° de Operación o Celular desde el que pagas (Opcional)
                </label>
                <input
                  id="payment_reference_input"
                  type="text"
                  placeholder="Ej: Op. #123456 o tu número Yape"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* DETALLES DE CULQI EMAIL */}
          {paymentMode === 'CULQI_ONLINE' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label htmlFor="client_email" className="block text-xs font-medium text-neutral-300">
                Correo Electrónico (para tu comprobante Culqi)
              </label>
              <input
                id="client_email"
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 rounded-xl bg-neutral-900 border border-white/5 hover:bg-neutral-800 text-neutral-300 font-medium text-xs flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg ${
            paymentMode === 'QR_WALLET'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {paymentMode === 'CULQI_ONLINE'
                  ? 'Conectando con Culqi...'
                  : 'Confirmando Cita...'}
              </span>
            </>
          ) : (
            <>
              {paymentMode === 'CULQI_ONLINE' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar {formatPrice(Number(activeServicePrice || 0))} con Culqi</span>
                </>
              ) : paymentMode === 'QR_WALLET' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Cita con {walletType}</span>
                </>
              ) : (
                <>
                  <span>Confirmar Reserva</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
