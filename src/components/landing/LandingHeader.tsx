'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, Menu, X, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#090A0E]/80 backdrop-blur-xl transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-amber-500/10">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight leading-none font-mono">
                Barber<span className="text-amber-500">OS</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 font-mono">
                v2.4
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-semibold mt-0.5">
              Salon & Barbershop OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
          <a href="#demo-en-vivo" className="hover:text-amber-400 transition">
            Demo en Vivo
          </a>
          <a href="#superpoderes" className="hover:text-amber-400 transition">
            Funcionalidades
          </a>
          <a href="#calculadora" className="hover:text-amber-400 transition flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Calculadora ROI</span>
          </a>
          <a href="#precios" className="hover:text-amber-400 transition">
            Planes
          </a>
          <a href="#faq" className="hover:text-amber-400 transition">
            Preguntas
          </a>
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-white/[0.04] transition font-mono"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro-barberia"
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-xs font-black transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>Probar 14 Días Gratis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/registro-barberia"
            className="py-1.5 px-3 rounded-lg bg-amber-500 text-black text-xs font-bold"
          >
            Probar
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.06] bg-[#0D0E15] px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
            <a
              href="#demo-en-vivo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/[0.04] transition"
            >
              Demo en Vivo
            </a>
            <a
              href="#superpoderes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/[0.04] transition"
            >
              Funcionalidades
            </a>
            <a
              href="#calculadora"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/[0.04] transition flex items-center justify-between"
            >
              <span>Calculadora ROI</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Nuevo</span>
            </a>
            <a
              href="#precios"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/[0.04] transition"
            >
              Planes & Tarifas
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/[0.04] transition"
            >
              Preguntas Frecuentes
            </a>
          </nav>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2.5 rounded-xl border border-white/[0.1] text-xs font-bold text-white hover:bg-white/[0.04] transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro-barberia"
              className="w-full text-center py-3 rounded-xl bg-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/20"
            >
              Crear mi Barbería (14 Días Gratis)
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
