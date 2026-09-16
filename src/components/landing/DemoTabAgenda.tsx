import { MessageCircle } from 'lucide-react'

export default function DemoTabAgenda() {
  return (
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
                className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition cursor-pointer"
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
  )
}
