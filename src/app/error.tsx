'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  RotateCcw,
  Home,
  Copy,
  Check,
  MessageCircle,
  Scissors,
  RefreshCw,
  Terminal,
  ShieldAlert,
} from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    console.error('Diagnostic error trace:', error)
    setTimestamp(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [error])

  const digestCode = error.digest || 'ERR_INTERNAL_500'

  function handleCopyDigest() {
    navigator.clipboard.writeText(digestCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleRetry() {
    setRetrying(true)
    setTimeout(() => {
      reset()
      setRetrying(false)
    }, 400)
  }

  const supportWaUrl = formatWhatsAppUrl(
    '51987654321',
    `⚠️ Reporte de Excepción BarberOS:
- Código de diagnóstico: ${digestCode}
- Mensaje: ${error.message || 'Error no capturado'}
- Hora: ${timestamp || 'Ahora'}
Por favor su apoyo técnico.`
  )

  return (
    <div className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Ambient Crimson & Amber Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-red-600/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative hairline grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 p-0.5 shadow-lg shadow-red-500/20">
            <div className="w-full h-full bg-[#07080B] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">
              Barber<span className="text-amber-400">OS</span>
            </span>
            <span className="text-[10px] font-mono text-red-400 tracking-wider">
              TELEMETRÍA DE FALLO
            </span>
          </div>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          <span>INCIDENT_RECOVERY</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-2xl mx-auto py-10 sm:py-14 space-y-8 text-center">
        {/* Central Badge */}
        <div className="space-y-4">
          <div className="w-18 h-18 mx-auto rounded-3xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400 shadow-2xl shadow-red-500/20 relative">
            <ShieldAlert className="w-9 h-9" />
            <div className="absolute -inset-1 rounded-3xl border border-red-500/20 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
              <span>Código HTTP 500</span>
              <span className="w-1 h-1 rounded-full bg-red-400" />
              <span>Interrupción de Proceso</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Protocolo de Contingencia Activado
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
              Se produjo un corte en la ejecución de la solicitud. Tu base de datos y registros contables están protegidos. Puedes reintentar la acción de inmediato.
            </p>
          </div>
        </div>

        {/* Telemetry Monospace Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0E15] border border-white/10 text-left space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>TELEMETRÍA_DEL_ERROR</span>
            </div>
            {timestamp && (
              <span className="text-[10px] font-mono text-neutral-500">
                Registrado: {timestamp}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase tracking-wider">
                ID de Diagnóstico (Digest)
              </span>
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#07080B] border border-white/10">
                <code className="text-xs font-mono text-amber-400 select-all font-bold truncate">
                  {digestCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopyDigest}
                  className="py-1 px-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-neutral-300 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error.message && (
              <div>
                <span className="text-[10px] font-mono text-neutral-400 block mb-1 uppercase tracking-wider">
                  Detalle del Incidente
                </span>
                <div className="p-2.5 rounded-xl bg-[#07080B] border border-white/10 text-neutral-300 text-xs font-mono leading-relaxed max-h-24 overflow-y-auto">
                  {error.message}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Suite */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={retrying}
            onClick={handleRetry}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Reintentando...' : 'Reintentar Operación'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#0D0E15] hover:bg-white/[0.08] border border-white/10 text-neutral-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-neutral-400" />
            <span>Recargar Página</span>
          </button>

          <a
            href={supportWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Avisar Soporte WhatsApp</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 border-t border-white/[0.06] text-neutral-500 text-xs gap-3 text-center sm:text-left">
        <Link href="/login" className="hover:text-amber-400 transition flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" />
          <span>Volver al Portal de BarberOS</span>
        </Link>
        <p className="text-[11px] font-mono">
          Fail-Safe Engine · BarberOS Resilience Architecture
        </p>
      </footer>
    </div>
  )
}
