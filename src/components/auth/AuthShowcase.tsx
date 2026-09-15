'use client'

import { Scissors, ShieldCheck, Sparkles, MessageCircle, Printer, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function AuthShowcase() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] relative flex-col justify-between p-10 xl:p-14 bg-[#0A0B10] border-r border-white/[0.08] overflow-hidden select-none">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shadow-lg shadow-amber-500/10">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight font-mono">
                Barber<span className="text-amber-500">OS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              El Sistema Operativo para Salones de Alta Gama
            </p>
          </div>
        </Link>

        {/* Live status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistemas Operativos 100%</span>
        </div>
      </div>

      {/* Center Value Proposition & Live Cards */}
      <div className="relative z-10 my-auto py-8 space-y-8">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Diseñado para dueños de salones exigentes</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Eleva tu barbería con una plataforma de{' '}
            <span className="text-amber-400">
              gestión implacable.
            </span>
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Centraliza reservas inteligentes, cobros rápidos en POS, liquidación de comisiones de barberos y fidelización de clientes en una sola interfaz cinematográfica.
          </p>
        </div>

        {/* 3 Metric / Feature Highlight Cards */}
        <div className="grid grid-cols-1 gap-3 max-w-lg">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Recordatorios WhatsApp
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">99.4% Asistencia</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Confirmación y re-agendamiento en un clic. Reduce inasistencias a cero.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  POS & Arqueo de Caja
                </h4>
                <span className="text-[10px] text-amber-400 font-bold font-mono">Tickets 80mm/58mm</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Vouchers térmicos, control de gastos en caja chica y registro de propinas.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Fidelización & Marca Blanca
                </h4>
                <span className="text-[10px] text-blue-400 font-bold font-mono">+35% Retención</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Tarjetas de sellos, catálogo de premios y portal público con tu logo y banner.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] max-w-lg space-y-2">
          <div className="flex items-center gap-1 text-amber-400 text-xs">
            {'★'.repeat(5)}
          </div>
          <p className="text-xs text-neutral-300 italic leading-relaxed">
            &ldquo;BarberOS transformó por completo nuestro salón. El cuadre de caja diario es exacto al centavo y nuestros clientes reservan 24/7 sin interrumpir a los barberos.&rdquo;
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <div>
              <p className="text-xs font-bold text-white">Carlos Mendoza</p>
              <p className="text-[10px] text-neutral-500">Fundador & Master Barber • The Royal Club</p>
            </div>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Cliente Verificado
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Trust & Compliance */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Cifrado SSL 256-Bit</span>
          </span>
          <span>•</span>
          <span>Aislamiento Multi-Tenant</span>
          <span>•</span>
          <span>Respaldos Automáticos</span>
        </div>
        <span className="font-mono text-[11px] text-neutral-400">© 2026 BarberOS</span>
      </div>
    </div>
  )
}
