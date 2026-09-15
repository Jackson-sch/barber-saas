'use client'

import { useState } from 'react'
import {
  Calendar,
  Printer,
  DollarSign,
  Trophy,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  Scissors,
} from 'lucide-react'

export default function InteractiveProductDemo() {
  const [activeTab, setActiveTab] = useState<'agenda' | 'pos' | 'caja' | 'loyalty'>('agenda')

  return (
    <div id="demo-en-vivo" className="relative mt-16 max-w-6xl mx-auto scroll-mt-28">
      {/* Glow behind mockup */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-purple-600/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container Window */}
      <div className="relative rounded-3xl border border-white/[0.12] bg-[#0E1017] shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Window Topbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#090A0E]/90 text-xs">
          {/* Window Buttons & Virtual URL */}
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-sm shadow-red-500/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm shadow-amber-500/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm shadow-emerald-500/50" />
            <div className="ml-3 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-neutral-400 font-mono text-[11px] hidden sm:flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">barberos.app</span>
              <span className="text-neutral-500">/</span>
              <span>the-royal-club</span>
              <span className="text-neutral-500">/</span>
              <span className="text-white">{activeTab}</span>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Caja Abierta: S/ 680.00
            </span>
            <span className="text-neutral-400 hidden md:inline">Sábado • Turno Tarde</span>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex border-b border-white/[0.08] bg-black/40 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold font-mono transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'agenda'
                ? 'border-amber-500 text-amber-400 bg-white/[0.04]'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Agenda & WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold font-mono transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pos'
                ? 'border-amber-500 text-amber-400 bg-white/[0.04]'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>2. POS & Tickets 80mm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('caja')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold font-mono transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'caja'
                ? 'border-amber-500 text-amber-400 bg-white/[0.04]'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>3. Control de Caja & Gastos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold font-mono transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'loyalty'
                ? 'border-amber-500 text-amber-400 bg-white/[0.04]'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>4. Fidelización & Sellos</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-4 sm:p-7 min-h-[420px] bg-gradient-to-b from-transparent to-black/30">
          {/* TAB 1: AGENDA & WHATSAPP */}
          {activeTab === 'agenda' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Agenda Interactiva por Sillas de Barberos
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Arrastra citas, cambia estados en tiempo real y notifica recordatorios por WhatsApp con 1 clic.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    2 En Silla
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    4 Confirmadas
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Chair 1 */}
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div>
                      <span className="text-xs font-bold text-white block">Silla 1 • Carlitos Fade</span>
                      <span className="text-[10px] text-neutral-400 font-mono">50% Comisión • 6 Citas</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Appointment En Silla */}
                  <div className="p-3 rounded-xl bg-[#14161F] border border-purple-500/40 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-400 font-mono">15:30 - 16:15</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono uppercase">
                        En Silla
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Jorge Mendoza</p>
                      <p className="text-[11px] text-neutral-400">Mid Fade a navaja + Perfilado de Barba</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white font-mono">S/ 55.00</span>
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Recordado
                      </span>
                    </div>
                  </div>

                  {/* Appointment Next */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5 opacity-80">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-neutral-400 font-mono">16:30 - 17:00</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-mono uppercase">
                        Confirmada
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white">Gonzalo Silva</p>
                    <p className="text-[11px] text-neutral-500">Corte Clásico Ejecutivo</p>
                  </div>
                </div>

                {/* Chair 2 */}
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div>
                      <span className="text-xs font-bold text-white block">Silla 2 • Mateo &quot;Master&quot;</span>
                      <span className="text-[10px] text-neutral-400 font-mono">50% Comisión • 5 Citas</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Appointment En Silla */}
                  <div className="p-3 rounded-xl bg-[#14161F] border border-purple-500/40 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-400 font-mono">15:00 - 16:00</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono uppercase">
                        En Silla
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Rodrigo Benítez</p>
                      <p className="text-[11px] text-neutral-400">Low Taper Fade + Toalla Caliente & Vapor</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white font-mono">S/ 65.00</span>
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Appointment Walk-in */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-400 font-mono">16:15 - 16:45</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono uppercase">
                        Walk-in
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white">Cliente Presencial</p>
                    <p className="text-[11px] text-neutral-500">Ritual de Barba & Navaja</p>
                  </div>
                </div>

                {/* WhatsApp Interactive Preview Column */}
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08] flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        Voucher / Recordatorio WhatsApp
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">Simulación</span>
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="p-3.5 rounded-xl bg-[#075E54]/30 border border-emerald-500/30 text-xs space-y-2">
                      <p className="text-white text-[11px] leading-relaxed">
                        💈 *THE ROYAL BARBER CLUB*<br />
                        ¡Hola *Jorge*! Tu cita de *Mid Fade + Barba* está confirmada hoy a las *3:30 PM* con *Carlitos Fade*.<br /><br />
                        📍 Av. Benavides 1240, Miraflores<br />
                        ✂️ ¡Te esperamos!
                      </p>
                      <div className="text-[9px] text-emerald-300/70 text-right font-mono flex items-center justify-end gap-1">
                        <span>15:10</span>
                        <span>✓✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                        ⚡ 99.4% Tasa de Asistencia Registrada
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POS & TICKETS 80MM */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* POS Interface Demo */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">
                    Punto de Venta (POS) Táctil & Cobro Express
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Cobra en menos de 5 segundos con Yape, Plin, Efectivo o Tarjeta.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs">
                    <span className="text-neutral-400">Cliente: <strong className="text-white">Carlos Silva</strong></span>
                    <span className="text-neutral-400">Atendido por: <strong className="text-amber-400">Carlitos Fade</strong></span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-neutral-300">1x Corte Degradado Signature</span>
                      <span className="font-mono text-white font-bold">S/ 45.00</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-neutral-300">1x Cera Modeladora Mate 100ml</span>
                      <span className="font-mono text-white font-bold">S/ 35.00</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-400">
                      <span>Propina voluntaria para barbero:</span>
                      <span className="font-mono font-bold">+S/ 10.00</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">Comisión Barbero (50%)</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">S/ 32.50 + S/ 10 propina</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block uppercase font-mono">Total a Cobrar</span>
                      <span className="text-xl font-extrabold text-amber-400 font-mono">S/ 90.00</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="py-2 text-center rounded-xl bg-purple-500/20 border border-purple-500 text-purple-300 font-bold text-xs">
                      Yape
                    </div>
                    <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs">
                      Plin
                    </div>
                    <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs">
                      Efectivo
                    </div>
                    <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs">
                      Tarjeta
                    </div>
                  </div>
                </div>
              </div>

              {/* Thermal Receipt Mockup */}
              <div className="md:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px] bg-white text-black p-4 rounded-xl shadow-2xl font-mono text-[10px] leading-tight space-y-2 border border-neutral-300">
                  <div className="text-center pb-2 border-b border-dashed border-neutral-400 space-y-0.5">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mx-auto text-xs font-bold mb-1">
                      ✂️
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-tight">THE ROYAL BARBER CLUB</h4>
                    <p className="text-[9px] text-neutral-600">Av. Benavides 1240, Miraflores</p>
                    <p className="text-[9px] text-neutral-600">Tel: +51 987 654 321</p>
                  </div>
                  <div className="py-1 border-b border-dashed border-neutral-400 text-[9px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>TICKET: #A8F9301B</span>
                      <span>15:45 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLIENTE: Carlos Silva</span>
                      <span>YAPE</span>
                    </div>
                    <div>BARBERO: Carlitos Fade</div>
                  </div>
                  <div className="space-y-1 py-1 border-b border-dashed border-neutral-400">
                    <div className="flex justify-between font-bold">
                      <span>Corte Signature</span>
                      <span>S/ 45.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cera Mate 100ml</span>
                      <span>S/ 35.00</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Propina Barbero</span>
                      <span>S/ 10.00</span>
                    </div>
                  </div>
                  <div className="pt-1 flex justify-between font-bold text-xs">
                    <span>TOTAL PAGADO:</span>
                    <span>S/ 90.00</span>
                  </div>
                  <div className="pt-2 text-center text-[8px] text-neutral-500 border-t border-neutral-200">
                    ¡Gracias por tu preferencia!<br />
                    barberos.app/reservar/the-royal-club
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTROL DE CAJA */}
          {activeTab === 'caja' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  Control de Caja Menor & Arqueo Cero Descuadres
                </h3>
                <p className="text-xs text-neutral-400">
                  Conciliación matemática que incluye fondo inicial, ventas en efectivo y gastos menores de insumos.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08]">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Fondo Inicial</span>
                  <span className="text-lg font-bold text-white font-mono">S/ 150.00</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08]">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Ventas Efectivo</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">+S/ 480.00</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.08]">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono block">Gastos / Retiros</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">-S/ 75.00</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 uppercase font-mono block font-bold">Esperado en Gaveta</span>
                  <span className="text-lg font-black text-amber-400 font-mono">S/ 555.00</span>
                </div>
              </div>

              {/* Cash Movements table preview */}
              <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/[0.08] space-y-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                  Movimientos de Caja Registrados en el Turno
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">GASTO</span>
                      <span className="text-neutral-300">Compra de toallas y hojas de navaja (Insumos)</span>
                    </div>
                    <span className="text-rose-400 font-mono font-bold">-S/ 25.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">ADELANTO</span>
                      <span className="text-neutral-300">Adelanto quincenal para barbero Carlitos Fade</span>
                    </div>
                    <span className="text-rose-400 font-mono font-bold">-S/ 50.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FIDELIZACIÓN & SELLOS */}
          {activeTab === 'loyalty' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">
                    Programa de Fidelización: Sellos por Visita
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Aumenta la recurrencia de tus clientes hasta un 35% con recompensas automatizadas.
                  </p>
                </div>

                {/* Digital Stamp Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1D27] to-[#0D0E15] border border-amber-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono uppercase font-bold tracking-wider">Tarjeta de Lealtad VIP</span>
                      <h4 className="text-sm font-bold text-white">The Royal Barber Club</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                      6 de 8 Sellos
                    </span>
                  </div>

                  {/* Stamp Circles */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <div key={num} className="aspect-square rounded-xl bg-amber-500/20 border border-amber-500 flex flex-col items-center justify-center text-amber-400">
                        <Scissors className="w-4 h-4" />
                        <span className="text-[9px] font-mono font-bold mt-0.5">Visita {num}</span>
                      </div>
                    ))}
                    <div className="aspect-square rounded-xl bg-white/[0.04] border border-dashed border-white/[0.2] flex flex-col items-center justify-center text-neutral-500">
                      <span className="text-xs font-mono font-bold">7</span>
                    </div>
                    <div className="aspect-square rounded-xl bg-amber-500/10 border-2 border-amber-400 flex flex-col items-center justify-center text-amber-400 animate-pulse">
                      <Trophy className="w-4 h-4" />
                      <span className="text-[8px] font-bold mt-0.5 text-center leading-none">Corte Gratis</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Al completar 8 visitas, el sistema aplica automáticamente el descuento del premio en el POS.
                  </p>
                </div>
              </div>

              {/* White Label Showcase */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">
                    Personalización de Marca Blanca
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Tu salón luce como una app propia con tu logo, colores corporativos y portada.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090A0E] border border-white/[0.08] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-xl font-mono shadow-lg">
                      R
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">The Royal Barber Club</h4>
                      <p className="text-xs text-amber-400 font-medium">Estilo y distinción para caballeros</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Paleta Corporativa:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500 border border-white/20 inline-block" />
                        <span className="font-mono text-white text-[11px]">Oro Imperial (#F59E0B)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Logo en Tickets Térmicos:</span>
                      <span className="text-emerald-400 font-mono text-[11px]">Activado (Escala de Grises)</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Enlace Web Directo:</span>
                      <span className="font-mono text-amber-400 text-[11px]">/reservar/the-royal-club</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
