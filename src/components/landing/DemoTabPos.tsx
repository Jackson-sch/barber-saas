export default function DemoTabPos() {
  return (
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
            <div className="py-2 text-center rounded-xl bg-purple-500/20 border border-purple-500 text-purple-300 font-bold text-xs cursor-pointer">
              Yape
            </div>
            <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs cursor-pointer">
              Plin
            </div>
            <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs cursor-pointer">
              Efectivo
            </div>
            <div className="py-2 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-400 text-xs cursor-pointer">
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
  )
}
