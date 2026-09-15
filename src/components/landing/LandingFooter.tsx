'use client'

import Link from 'next/link'
import { Scissors, ArrowRight, ShieldCheck, Heart } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07080B] relative overflow-hidden">
      {/* Glow effect in footer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* High-Impact Closing CTA Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 relative z-10">
        <div className="p-8 sm:p-12 xl:p-16 rounded-3xl bg-gradient-to-br from-[#1A1D29] via-[#10121C] to-[#0A0B10] border border-white/[0.12] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              Comienza en 2 Minutos
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              ¿Listo para transformar la gestión de tu barbería?
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Únete a las barberías y salones de alta gama que ya automatizaron su agenda, cuadran su caja al centavo y retienen a sus clientes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/registro-barberia"
              className="w-full sm:w-auto py-4 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/25 active:scale-[0.99]"
            >
              <span>Crear mi Barbería Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto py-4 px-7 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/[0.1] text-xs font-bold transition"
            >
              Acceder a mi Cuenta
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-neutral-500 flex-wrap">
            <span>✓ 14 días de prueba completa</span>
            <span>✓ Sin tarjeta de crédito</span>
            <span>✓ Soporte en español por WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-4 gap-8 text-xs relative z-10">
        {/* Col 1: Brand */}
        <div className="space-y-3 md:col-span-2 max-w-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white font-mono">
              Barber<span className="text-amber-500">OS</span>
            </span>
          </Link>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            El sistema operativo integral para la gestión de salones y barberías de alta gama en Latinoamérica. Diseñado para ofrecer precisión, control y máxima rentabilidad.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistemas Cloud 100% Operativos</span>
          </div>
        </div>

        {/* Col 2: Ecosistema */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
            Ecosistema
          </h4>
          <ul className="space-y-2 text-neutral-400 text-xs">
            <li>
              <a href="#demo-en-vivo" className="hover:text-amber-400 transition">Agenda & Sillas</a>
            </li>
            <li>
              <a href="#demo-en-vivo" className="hover:text-amber-400 transition">Punto de Venta POS</a>
            </li>
            <li>
              <a href="#demo-en-vivo" className="hover:text-amber-400 transition">Tickets Térmicos 80mm</a>
            </li>
            <li>
              <a href="#demo-en-vivo" className="hover:text-amber-400 transition">Arqueo de Caja Chica</a>
            </li>
            <li>
              <a href="#demo-en-vivo" className="hover:text-amber-400 transition">Fidelización por Sellos</a>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & Soporte */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[11px]">
            Plataforma
          </h4>
          <ul className="space-y-2 text-neutral-400 text-xs">
            <li>
              <a href="#precios" className="hover:text-amber-400 transition">Planes & Tarifas</a>
            </li>
            <li>
              <a href="#calculadora" className="hover:text-amber-400 transition">Calculadora ROI</a>
            </li>
            <li>
              <a href="#faq" className="hover:text-amber-400 transition">Preguntas Frecuentes</a>
            </li>
            <li>
              <Link href="/login" className="hover:text-amber-400 transition">Acceso Clientes</Link>
            </li>
            <li>
              <Link href="/registro-barberia" className="hover:text-amber-400 transition">Registro Gratis</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 relative z-10">
        <p>© {new Date().getFullYear()} BarberOS Cloud Platform. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          <span>Diseñado con pasión para barberos y estilistas</span>
        </p>
      </div>
    </footer>
  )
}
