'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Scissors,
  Home,
  ArrowLeft,
  Search,
  MessageCircle,
  Shield,
  Sparkles,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'

export default function NotFound() {
  const router = useRouter()
  const [salonQuery, setSalonQuery] = useState('')
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = salonQuery
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
    if (clean) {
      router.push(`/reservar/${clean}`)
    }
  }

  const supportWaUrl = formatWhatsAppUrl(
    '51987654321',
    `💈 Hola equipo de soporte BarberOS. Estaba navegando y la página o salón ${
      currentPath ? `("${currentPath}")` : ''
    } no fue encontrada. ¿Podrían asistirme?`
  )

  return (
    <div className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Background Lighting & Luxury Radial Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative hairline grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#07080B] rounded-[10px] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block leading-none">
              Barber<span className="text-amber-400">OS</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
              DARK LUXURY SUITE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.length > 1 ? window.history.back() : router.push('/')}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Volver atrás</span>
          </button>
        </div>
      </header>

      {/* Center Hero Showcase */}
      <main className="relative z-10 w-full max-w-4xl mx-auto py-12 sm:py-16 text-center space-y-10">
        {/* Large 404 Display with Gold Crest */}
        <div className="relative inline-block">
          <div className="text-[96px] sm:text-[140px] font-black tracking-tighter leading-none bg-gradient-to-b from-amber-100 via-amber-400 to-amber-800 bg-clip-text text-transparent select-none drop-shadow-[0_20px_60px_rgba(245,158,11,0.2)]">
            404
          </div>

          {/* Floating Luxury Status Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0E1017] border border-amber-500/30 text-amber-300 shadow-xl shadow-amber-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
                Coordenada No Encontrada
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Copy */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            El sillón está vacío o la ruta ha cambiado
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            La página, barbería o cita que buscas no se encuentra en esta dirección. Es posible que el enlace haya caducado o el nombre del salón haya sido actualizado.
          </p>
        </div>

        {/* Bento Help & Orientation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          {/* Bento Card 1: Salón Locator */}
          <div className="p-5 rounded-2xl bg-[#0D0E15] border border-white/[0.08] hover:border-amber-500/30 transition shadow-xl space-y-3 flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Buscar Portal de Reservas</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Ingresa el nombre o identificador (slug) de tu salón para abrir su portal.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-2 pt-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                <input aria-label="input"
                  type="text"
                  value={salonQuery}
                  onChange={(e) => setSalonQuery(e.target.value)}
                  placeholder="Ej: ibs, elite..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-amber-500 hover:text-black text-neutral-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ir a Reservas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Bento Card 2: Staff & Barber Access */}
          <div className="p-5 rounded-2xl bg-[#0D0E15] border border-white/[0.08] hover:border-amber-500/30 transition shadow-xl space-y-3 flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Acceso al Sistema</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Si eres barbero, cajero o dueño, ingresa a tu panel operativo con tus credenciales.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ingresar al Workspace</span>
              </Link>
            </div>
          </div>

          {/* Bento Card 3: VIP Concierge WhatsApp */}
          <div className="p-5 rounded-2xl bg-[#0D0E15] border border-white/[0.08] hover:border-emerald-500/30 transition shadow-xl space-y-3 flex flex-col justify-between group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Atención & Soporte VIP</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                ¿No encuentras lo que buscas? Chatea directamente con nuestro equipo por WhatsApp.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={supportWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contactar Soporte</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 border-t border-white/[0.06] text-neutral-500 text-xs gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">Plataforma Operativa BarberOS v2026.1 · All systems nominal</span>
        </div>
        <p className="text-[11px]">
          Alta Barbería Digital · Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
