'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error para observabilidad
    console.error('Captured exception in global error.tsx:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Emblem & Code */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-2xl shadow-red-500/10">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
            <span>Interrupción del Sistema</span>
            <span className="w-1 h-1 rounded-full bg-red-400" />
            <span>Código 500</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Algo inesperado ha ocurrido
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
            La operación fue interrumpida debido a una anomalía momentánea. Puedes reintentar la solicitud o volver al panel de inicio.
          </p>
        </div>

        {/* Technical Digest pill */}
        {error?.digest && (
          <div className="p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-left max-w-md mx-auto">
            <span className="text-[10px] font-mono text-neutral-500 block mb-0.5">ID de diagnóstico:</span>
            <code className="text-xs font-mono text-amber-400 break-all select-all">{error.digest}</code>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar Operación</span>
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#0D0E15] hover:bg-white/[0.06] border border-white/10 text-neutral-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-neutral-400 pt-6 border-t border-white/[0.06]">
          BarberOS — Monitoreo de contingencia y resiliencia en tiempo real.
        </p>
      </div>
    </div>
  )
}
