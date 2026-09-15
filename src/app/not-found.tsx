import Link from 'next/link'
import { Scissors, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        {/* Emblem & Code */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10 animate-pulse">
            <Scissors className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            <span>Error 404</span>
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span>Recurso No Encontrado</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Página o Salón Fuera de Rango
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
            La dirección web solicitada no existe en el sistema, el enlace del salón fue actualizado o la cita ha sido removida del registro.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Portal de Acceso</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#0D0E15] hover:bg-white/[0.06] border border-white/10 text-neutral-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página de Inicio</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-neutral-400 pt-6 border-t border-white/[0.06]">
          BarberOS © 2026 — Plataforma de Gestión Integral para Barberías de Alto Rendimiento.
        </p>
      </div>
    </div>
  )
}
