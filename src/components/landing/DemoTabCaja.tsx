export default function DemoTabCaja() {
  return (
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
  )
}
