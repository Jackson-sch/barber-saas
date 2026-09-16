'use client'

import { useState } from 'react'
import {
  Calendar,
  Printer,
  DollarSign,
  Trophy,
} from 'lucide-react'
import DemoTabAgenda from './DemoTabAgenda'
import DemoTabPos from './DemoTabPos'
import DemoTabCaja from './DemoTabCaja'
import DemoTabLoyalty from './DemoTabLoyalty'

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
          {activeTab === 'agenda' && <DemoTabAgenda />}

          {/* TAB 2: POS & TICKETS 80MM */}
          {activeTab === 'pos' && <DemoTabPos />}

          {/* TAB 3: CONTROL DE CAJA */}
          {activeTab === 'caja' && <DemoTabCaja />}

          {/* TAB 4: FIDELIZACIÓN & SELLOS */}
          {activeTab === 'loyalty' && <DemoTabLoyalty />}
        </div>
      </div>
    </div>
  )
}
