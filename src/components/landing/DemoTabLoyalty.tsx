import { Scissors, Trophy } from 'lucide-react'

export default function DemoTabLoyalty() {
  return (
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
  )
}
