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
} from 'lucide-react'
import { testCulqiConnectionAction } from '@/actions/organizations'

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
}: PaymentSettingsTabProps) {
  const [showSecret, setShowSecret] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  } | null>(null)

  // Validación rápida de formato de llaves
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

  const isConfigured = culqiPublicKey.trim().length > 10 && culqiSecretKey.trim().length > 10

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
    } catch (err: any) {
      setTestResult({
        error: 'Error inesperado al contactar el servicio de Culqi.',
      })
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner Principal Culqi */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#12131A] to-[#181A26] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Pasarela de Pagos Culqi
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Perú • Tarjetas & Yape
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Permite que tus clientes paguen sus citas online con tarjetas de crédito, débito y Yape
              directamente a <strong>tu propia cuenta bancaria</strong>.
            </p>
          </div>
        </div>

        {/* Estado general */}
        <div className="flex items-center gap-2 shrink-0">
          {culqiEnabled && isConfigured ? (
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

      {/* Switch Principal: Habilitar / Deshabilitar */}
      <div className="p-4 rounded-2xl bg-[#0B0C10] border border-white/[0.08] flex items-center justify-between gap-4">
        <div>
          <label htmlFor="culqi_enabled_toggle" className="text-sm font-semibold text-white cursor-pointer">
            Habilitar Cobros Online con Culqi
          </label>
          <p className="text-xs text-neutral-400 mt-0.5">
            Muestra el botón de pago con tarjeta en el portal público de reservas de tu barbería.
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
          <div className="p-4 rounded-2xl bg-[#0B0C10] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Entorno de Operación
                </label>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Alterna entre pruebas simuladas (Sandbox) y cobros reales a tarjetas.
                </p>
              </div>
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
                  <span className="text-xs font-bold text-amber-400">Modo Pruebas (Test / Sandbox)</span>
                  {culqiEnvironment === 'test' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Usa llaves que inician con <code className="text-amber-300 font-mono">pk_test_</code> y{' '}
                  <code className="text-amber-300 font-mono">sk_test_</code>. No procesa dinero real.
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
                  <code className="text-emerald-300 font-mono">sk_live_</code>. Los pagos entran a tu banco.
                </p>
              </button>
            </div>
          </div>

          {/* Formulario de Llaves API */}
          <div className="p-5 rounded-2xl bg-[#0B0C10] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Credenciales de API de tu Barbería</span>
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
                  La llave pública para el modo actual debe comenzar con{' '}
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
                  La llave secreta para el modo actual debe comenzar con{' '}
                  <span className="font-mono font-bold">
                    {culqiEnvironment === 'test' ? 'sk_test_' : 'sk_live_'}
                  </span>
                </p>
              )}
              <p className="text-[11px] text-neutral-500">
                Esta llave se almacena de forma segura en la base de datos exclusiva de tu barbería y se utiliza únicamente para confirmar los cobros.
              </p>
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
          <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/[0.06] space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>¿Cómo obtener tus llaves de Culqi?</span>
            </h4>
            <ol className="text-xs text-neutral-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Inicia sesión en tu cuenta de comercio en{' '}
                <a
                  href="https://panel.culqi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  panel.culqi.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>En el menú lateral izquierdo, haz clic en <strong>Desarrollo &gt; Llaves de API</strong>.</li>
              <li>
                Copia tu <strong>Llave Pública (pk)</strong> y tu <strong>Llave Secreta (sk)</strong>.
              </li>
              <li>Pégalas en los campos superiores y haz clic en <strong>Probar Conexión con Culqi</strong>.</li>
            </ol>
          </div>

          {/* Nota de Seguridad */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5 text-xs text-amber-300/80">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Tu dinero, tu control:</strong> Los pagos que tus clientes realicen online se depositan directamente en la cuenta bancaria que tienes afiliada en Culqi. BarberOS no retiene comisiones bancarias ni tiene acceso a retirar tus fondos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
