'use client'

import { Scissors, Calendar, Printer, Users, Globe, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterShowcase() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[50%] relative flex-col justify-between p-10 xl:p-14 bg-[#0A0B10] border-r border-white/[0.08] overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Header */}
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
                Pro 14 Días
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">
              El Sistema Operativo para Salones de Alta Gama
            </p>
          </div>
        </Link>

        {/* Free trial guarantee badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Sin Tarjeta de Crédito</span>
        </div>
      </div>

      {/* Center Value Proposition & 4 Pillars */}
      <div className="relative z-10 my-auto py-6 space-y-6">
        <div className="space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Onboarding Instantáneo en 2 Minutos</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Digitaliza tu barbería con una plataforma diseñada para{' '}
            <span className="text-amber-400">crecer sin límites.</span>
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Tu cuenta incluye catálogo de servicios demo, barberos de ejemplo y portal web preconfigurado para que comiences a agendar hoy mismo.
          </p>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Agenda & WhatsApp
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Recordatorios automáticos en 1-clic que reducen ausencias a casi cero.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              POS & Tickets Térmicos
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Vouchers de 80mm/58mm, caja menor, propinas y arqueo diario exacto.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Comisiones de Barberos
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Cálculo transparente de comisiones por servicio y reportes de rendimiento.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Portal Marca Blanca
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Tu propio enlace público de reservas con logo, colores y banner corporativo.
            </p>
          </div>
        </div>

        {/* 3 Step Timeline */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] max-w-lg">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="font-medium text-white">Registro (30s)</span>
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-amber-400 font-bold flex items-center justify-center text-[10px] border border-amber-500/30">
                2
              </span>
              <span className="text-neutral-400">Personaliza</span>
            </div>
            <span className="text-neutral-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-500/30">
                3
              </span>
              <span className="text-neutral-400">¡Agenda y Cobra!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Row */}
      <div className="relative z-10 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Infraestructura Segura</span>
          </span>
          <span>•</span>
          <span>Cancelación Libre</span>
          <span>•</span>
          <span>Soporte VIP por WhatsApp</span>
        </div>
        <span className="font-mono text-[11px] text-neutral-400">© 2026 BarberOS</span>
      </div>
    </div>
  )
}
