'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, Play } from 'lucide-react'

export default function LandingHero() {
  return (
    <section className="relative isolate pt-20 sm:pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Cinematic Hero Background Image with low opacity & gradient masks */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/barber-hero.jpg"
          alt="Barbero profesional cortando con tijeras y perfilando en salón"
          className="w-full h-full object-cover object-[50%_25%] opacity-30 filter brightness-105 contrast-115"
        />
        {/* Cinematic gradient fade: seamless blend into luxury dark background #07080B */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080B]/75 via-[#07080B]/55 to-[#07080B]" />
        {/* Radial spotlight vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#07080B_85%)]" />
        {/* Warm amber ambient light glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/15 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-amber-400 text-xs font-mono font-semibold mb-8 shadow-inner shadow-amber-500/10">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>El Sistema Operativo para Barberías de Alto Rendimiento</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-[-0.03em] leading-[1.08] max-w-5xl mx-auto mb-6">
          Precisión quirúrgica para la agenda, caja y comisiones de tu{' '}
          <span className="text-amber-400">barbería.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Reemplaza cuadernos de papel, chats caóticos de WhatsApp y cálculos manuales de comisiones los fines de semana. Automatiza recordatorios, imprime tickets térmicos y gestiona tu equipo en una sola interfaz cinematográfica.
        </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/registro-barberia"
          className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/25 group cursor-pointer active:scale-[0.99]"
        >
          <span>Crear mi Barbería Ahora</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a
          href="#demo-en-vivo"
          className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] text-neutral-200 font-bold text-sm transition flex items-center justify-center gap-2"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Explorar Demo Interactiva</span>
        </a>
      </div>

      {/* Trust guarantees row */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          14 días de prueba Pro completa
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          Sin tarjeta de crédito
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          Paga con Yape, Plin o Transferencia
        </span>
      </div>

      {/* Real-time KPI Stats Ticker */}
      <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
            +450
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Barberías Activas</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono block">
            +180K
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Cortes Gestionados</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block">
            99.4%
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Asistencia con WhatsApp</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono block">
            S/ 3.2M+
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Facturados en POS</span>
        </div>
      </div>
    </div>
  </section>
)
}
