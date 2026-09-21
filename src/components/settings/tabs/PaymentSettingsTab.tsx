'use client'

import React, { useState } from 'react'
import {
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  HelpCircle,
  Zap,
  QrCode,
  Smartphone,
  Upload,
  Trash2,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react'
import { testCulqiConnectionAction } from '@/actions/organizations'

const WALLET_PRESETS = ['Yape', 'Plin', 'Yape / Plin', 'Transferencia BCP', 'BBVA', 'Interbank']

interface PaymentSettingsTabProps {
  isOwner: boolean
  culqiEnabled: boolean
  setCulqiEnabled: (val: boolean) => void
  culqiEnvironment: 'test' | 'production'
  setCulqiEnvironment: (val: 'test' | 'production') => void
  culqiPublicKey: string
  setCulqiPublicKey: (val: string) => void
  culqiSecretKey: string
  setCulqiSecretKey: (val: string) => void
  manualPaymentEnabled: boolean
  setManualPaymentEnabled: (val: boolean) => void
  qrImageUrl: string
  setQrImageUrl: (val: string) => void
  handleQrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  paymentPhone: string
  setPaymentPhone: (val: string) => void
  beneficiaryName: string
  setBeneficiaryName: (val: string) => void
  walletType: string
  setWalletType: (val: string) => void
  paymentInstructions: string
  setPaymentInstructions: (val: string) => void
  salonPhone?: string | null
}

export default function PaymentSettingsTab({
  isOwner,
  culqiEnabled,
  setCulqiEnabled,
  culqiEnvironment,
  setCulqiEnvironment,
  culqiPublicKey,
  setCulqiPublicKey,
  culqiSecretKey,
  setCulqiSecretKey,
  manualPaymentEnabled,
  setManualPaymentEnabled,
  qrImageUrl,
  setQrImageUrl,
  handleQrUpload,
  paymentPhone,
  setPaymentPhone,
  beneficiaryName,
  setBeneficiaryName,
  walletType,
  setWalletType,
  paymentInstructions,
  setPaymentInstructions,
  salonPhone,
}: PaymentSettingsTabProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  } | null>(null)
  const [copiedPhone, setCopiedPhone] = useState(false)

  // Validación rápida de formato de llaves Culqi
  const isPkValid =
    !culqiPublicKey ||
    (culqiEnvironment === 'test'
      ? culqiPublicKey.startsWith('pk_test_')
      : culqiPublicKey.startsWith('pk_live_'))

  const isSkValid =
    !culqiSecretKey ||
    (culqiEnvironment === 'test'
      ? culqiSecretKey.startsWith('sk_test_')
      : culqiSecretKey.startsWith('sk_live_'))

  const isCulqiConfigured = culqiPublicKey.trim().length > 10 && culqiSecretKey.trim().length > 10

  async function handleTestConnection() {
    if (!culqiSecretKey.trim()) {
      setTestResult({
        error: 'Ingresa primero la Llave Secreta (sk_...) para verificar la conexión.',
      })
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      const res = await testCulqiConnectionAction(culqiSecretKey)
      if (res?.error) {
        setTestResult({ error: res.error })
      } else {
        setTestResult({
          success: true,
          message: res?.message || '¡Conexión exitosa con Culqi!',
        })
      }
    } catch {
      setTestResult({
        error: 'Error inesperado al contactar el servicio de Culqi.',
      })
    } finally {
      setTestingConnection(false)
    }
  }

  function handleCopyPhone() {
    if (!paymentPhone) return
    navigator.clipboard.writeText(paymentPhone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* ==================================================================== */}
      {/* SECCIÓN 1: COBROS DIRECTOS CON QR (YAPE, PLIN & TRANSFERENCIAS) */}
      {/* ==================================================================== */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Encabezado de la Sección QR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cobros Rápidos con Código QR
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cero Comisiones • Yape & Plin
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
                Permite que tus clientes escaneen tu código QR personal o empresarial de Yape, Plin o banco directamente en el paso final de su reserva online.
              </p>
            </div>
          </div>

          {/* Estado de Cobros con QR */}
          <div className="flex items-center gap-2 shrink-0">
            {manualPaymentEnabled && qrImageUrl ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>QR Activo</span>
              </div>
            ) : manualPaymentEnabled ? (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Falta Imagen QR</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs font-medium">
                Desactivado
              </div>
            )}
          </div>
        </div>

        {/* Switch Principal: Habilitar / Deshabilitar QR */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <label htmlFor="manual_payment_toggle" className="text-sm font-semibold text-white cursor-pointer">
              Habilitar Cobros con QR / Yape / Plin en Reservas
            </label>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mostrará la opción &quot;Pagar con Yape / Plin (QR)&quot; con tu imagen y datos en el portal público de citas.
            </p>
          </div>
          <button
            id="manual_payment_toggle"
            type="button"
            role="switch"
            aria-checked={manualPaymentEnabled}
            disabled={!isOwner}
            onClick={() => setManualPaymentEnabled(!manualPaymentEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
              manualPaymentEnabled ? 'bg-emerald-500 justify-end' : 'bg-neutral-800 justify-start'
            } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md transition" />
          </button>
        </div>

        {manualPaymentEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Columna Izquierda: Vista Previa y Subida del Código QR */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Imagen del Código QR
              </label>

              <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/[0.06] flex flex-col items-center justify-center text-center space-y-4">
                {/* Canvas de alto contraste blanco para máxima legibilidad de lectores QR */}
                <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl p-2.5 shadow-xl border border-neutral-200 flex items-center justify-center overflow-hidden relative group">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="Código QR de Pago"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 p-4 space-y-2">
                      <QrCode className="w-16 h-16 text-neutral-300 stroke-[1.2]" />
                      <span className="text-[11px] font-medium text-neutral-500 leading-tight">
                        Aún no has subido tu código QR
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones de subida */}
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <label className="py-2 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{qrImageUrl ? 'Cambiar Imagen' : 'Subir Imagen QR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!isOwner}
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>

                    {qrImageUrl && (
                      <button
                        type="button"
                        disabled={!isOwner}
                        onClick={() => setQrImageUrl('')}
                        className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        title="Eliminar QR"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Formatos JPG o PNG hasta 2MB. Recomendamos una captura nítida desde tu app de Yape o Plin.
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Datos de Transferencia y Billetera */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tipo de Billetera o Banco */}
              <div className="space-y-1.5">
                <label
                  htmlFor="wallet_type_input"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                >
                  Tipo de Billetera o Cuenta
                </label>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {WALLET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setWalletType(preset)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        walletType === preset
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                          : 'bg-[#12131A] text-neutral-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  id="wallet_type_input"
                  type="text"
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Ej: Yape / Plin, BCP, BBVA..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Número de Celular / Cuenta para Yapear */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="payment_phone_input"
                    className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                  >
                    Número de Celular para Yape / Plin
                  </label>
                  {salonPhone && paymentPhone !== salonPhone && (
                    <button
                      type="button"
                      onClick={() => setPaymentPhone(salonPhone)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Usar teléfono del salón ({salonPhone})</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="payment_phone_input"
                    type="text"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    disabled={!isOwner}
                    placeholder="Ej: 987 654 321"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                  {paymentPhone && (
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                      title="Copiar número"
                    >
                      {copiedPhone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Tus clientes podrán pulsar un botón para copiar este número directo a su portapapeles.
                </p>
              </div>

              {/* Nombre del Titular / Beneficiario */}
              <div className="space-y-1.5">
                <label
                  htmlFor="beneficiary_name_input"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                >
                  Nombre del Titular de la Cuenta
                </label>
                <input
                  id="beneficiary_name_input"
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Ej: Carlos Mendoza / Barbería Uno S.A.C."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[11px] text-neutral-500">
                  Ayuda a que el cliente verifique en su app que está enviando el dinero al destinatario correcto.
                </p>
              </div>

              {/* Instrucciones de Pago */}
              <div className="space-y-1.5">
                <label
                  htmlFor="instructions_input"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                >
                  Instrucciones o Mensaje para el Cliente
                </label>
                <textarea
                  id="instructions_input"
                  rows={2}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  disabled={!isOwner}
                  placeholder="Ej: Yapea el monto exacto y al terminar pulsa Confirmar Cita. Envíanos tu constancia por WhatsApp..."
                  className="w-full p-3 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECCIÓN 2: PASARELA DE PAGOS ONLINE CULQI (TARJETAS DÉBITO/CRÉDITO) */}
      {/* ==================================================================== */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Banner Principal Culqi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Pasarela de Pagos Culqi
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Perú • Tarjetas Visa/Mastercard
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
                Permite que tus clientes paguen con tarjetas de crédito y débito online directamente a <strong>tu propia cuenta bancaria</strong> vía Culqi Checkout.
              </p>
            </div>
          </div>

          {/* Estado Culqi */}
          <div className="flex items-center gap-2 shrink-0">
            {culqiEnabled && isCulqiConfigured ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pasarela Activa</span>
              </div>
            ) : culqiEnabled ? (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Faltan Credenciales</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs font-medium">
                Desactivada
              </div>
            )}
          </div>
        </div>

        {/* Switch Principal Culqi */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <label htmlFor="culqi_enabled_toggle" className="text-sm font-semibold text-white cursor-pointer">
              Habilitar Cobros Online con Culqi
            </label>
            <p className="text-xs text-neutral-400 mt-0.5">
              Muestra la opción de pago con tarjeta en el portal público de reservas de tu barbería.
            </p>
          </div>
          <button
            id="culqi_enabled_toggle"
            type="button"
            role="switch"
            aria-checked={culqiEnabled}
            disabled={!isOwner}
            onClick={() => setCulqiEnabled(!culqiEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
              culqiEnabled ? 'bg-amber-500 justify-end' : 'bg-neutral-800 justify-start'
            } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md transition" />
          </button>
        </div>

        {culqiEnabled && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Selector de Entorno: Pruebas vs Producción */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Entorno de Operación Culqi
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Alterna entre pruebas simuladas (Sandbox) y cobros reales a tarjetas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setCulqiEnvironment('test')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    culqiEnvironment === 'test'
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                      : 'bg-[#12131A] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Modo Pruebas (Sandbox)</span>
                    {culqiEnvironment === 'test' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Usa llaves que inician con <code className="text-amber-300 font-mono">pk_test_</code> y{' '}
                    <code className="text-amber-300 font-mono">sk_test_</code>.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setCulqiEnvironment('production')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    culqiEnvironment === 'production'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                      : 'bg-[#12131A] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Modo Producción (En vivo)</span>
                    {culqiEnvironment === 'production' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Usa llaves que inician con <code className="text-emerald-300 font-mono">pk_live_</code> y{' '}
                    <code className="text-emerald-300 font-mono">sk_live_</code>.
                  </p>
                </button>
              </div>
            </div>

            {/* Formulario de Llaves API */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Credenciales Culqi de tu Barbería</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Copia y pega las llaves desde tu panel de comercio en Culqi.
                </p>
              </div>

              {/* Llave Pública */}
              <div className="space-y-1.5">
                <label
                  htmlFor="culqi_public_key"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                >
                  Llave Pública (Public Key)
                </label>
                <div className="relative">
                  <input
                    id="culqi_public_key"
                    type="text"
                    name="culqi_public_key"
                    value={culqiPublicKey}
                    onChange={(e) => setCulqiPublicKey(e.target.value.trim())}
                    disabled={!isOwner}
                    placeholder={
                      culqiEnvironment === 'test'
                        ? 'pk_test_xxxxxxxxxxxxxxxx'
                        : 'pk_live_xxxxxxxxxxxxxxxx'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl bg-[#12131A] border text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:ring-2 transition ${
                      !isPkValid
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-white/[0.08] focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                </div>
                {!isPkValid && (
                  <p className="text-[11px] text-red-400 font-medium">
                    La llave pública debe comenzar con{' '}
                    <span className="font-mono font-bold">
                      {culqiEnvironment === 'test' ? 'pk_test_' : 'pk_live_'}
                    </span>
                  </p>
                )}
              </div>

              {/* Llave Secreta */}
              <div className="space-y-1.5">
                <label
                  htmlFor="culqi_secret_key"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                >
                  Llave Secreta (Secret Key)
                </label>
                <div className="relative">
                  <input
                    id="culqi_secret_key"
                    type={showSecret ? 'text' : 'password'}
                    name="culqi_secret_key"
                    value={culqiSecretKey}
                    onChange={(e) => setCulqiSecretKey(e.target.value.trim())}
                    disabled={!isOwner}
                    placeholder={
                      culqiEnvironment === 'test'
                        ? 'sk_test_xxxxxxxxxxxxxxxx'
                        : 'sk_live_xxxxxxxxxxxxxxxx'
                    }
                    className={`w-full pl-4 pr-12 py-2.5 rounded-xl bg-[#12131A] border text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:ring-2 transition ${
                      !isSkValid
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-white/[0.08] focus:border-amber-500 focus:ring-amber-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white transition"
                    title={showSecret ? 'Ocultar llave' : 'Mostrar llave'}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isSkValid && (
                  <p className="text-[11px] text-red-400 font-medium">
                    La llave secreta debe comenzar con{' '}
                    <span className="font-mono font-bold">
                      {culqiEnvironment === 'test' ? 'sk_test_' : 'sk_live_'}
                    </span>
                  </p>
                )}
              </div>

              {/* Botón Probar Conexión */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.06]">
                <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Verifica que tus llaves sean aceptadas por Culqi antes de guardar.</span>
                </div>

                <button
                  type="button"
                  disabled={testingConnection || !culqiSecretKey.trim() || !isOwner}
                  onClick={handleTestConnection}
                  className="px-4 py-2 rounded-xl bg-[#161822] hover:bg-[#1D2030] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Probar Conexión con Culqi</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback del Test */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/25 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <div>
                    <p>{testResult.message || testResult.error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Guía Paso a Paso */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Cómo obtener tus llaves de Culqi?</span>
              </h4>
              <ol className="text-xs text-neutral-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Inicia sesión en{' '}
                  <a
                    href="https://panel.culqi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    panel.culqi.com <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>Ve a <strong>Desarrollo &gt; Llaves de API</strong>.</li>
                <li>Copia tu <strong>Llave Pública (pk)</strong> y tu <strong>Llave Secreta (sk)</strong>.</li>
                <li>Pégalas en los campos superiores y haz clic en <strong>Probar Conexión con Culqi</strong>.</li>
              </ol>
            </div>

            {/* Nota de Seguridad */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5 text-xs text-amber-300/80">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Depósito directo:</strong> Los cobros online procesados vía Culqi se depositan directamente en la cuenta bancaria afiliada a tu comercio. BarberOS no retiene tus fondos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
