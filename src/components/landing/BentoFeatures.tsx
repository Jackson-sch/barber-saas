'use client'

import {
  MessageCircle,
  Printer,
  DollarSign,
  Trophy,
  Users,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react'
import Link from 'next/link'

export default function BentoFeatures() {
  return (
    <section id="superpoderes" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06] scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ecosistema Operativo Integral</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Diseñado exclusivamente para el día a día de una barbería moderna.
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl mx-auto">
          Cada funcionalidad resuelve un problema real de la silla, el mostrador y el bolsillo de los dueños y barberos.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bento 1: WhatsApp */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-emerald-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Recordatorios WhatsApp 1-Clic</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dispara notificaciones de confirmación, recordatorios previos o agradecimientos personalizados por WhatsApp directamente al celular de tus clientes.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 inline-block">
              Reduce inasistencias a &lt; 1%
            </span>
          </div>
        </div>

        {/* Bento 2: POS & Tickets */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-amber-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Printer className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">POS & Tickets Térmicos 80mm</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Cobra en segundos con Yape, Plin, Efectivo o Tarjeta. Imprime comprobantes térmicos profesionales con el logo de tu salón o envíalos como voucher digital.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block">
              Compatible con impresoras USB, Bluetooth y Red
            </span>
          </div>
        </div>

        {/* Bento 3: Caja Chica & Gastos */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-purple-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Control de Caja & Gastos Menores</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Registra compras de insumos, limpieza, delivery o adelantos de nómina a barberos durante el turno. Al cerrar, el arqueo matemático es exacto al centavo.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20 inline-block">
              Cero diferencias entre sistema y dinero físico
            </span>
          </div>
        </div>

        {/* Bento 4: Fidelización & Sellos */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-blue-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Tarjetas Digitales de Fidelización</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tus clientes acumulan sellos por cada corte o visita. Al alcanzar la meta, canjean premios automáticos en el checkout sin cupones de papel.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 inline-block">
              +35% de recurrencia en clientes regulares
            </span>
          </div>
        </div>

        {/* Bento 5: Comisiones */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-rose-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Liquidación de Comisiones Clara</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Configura porcentajes o tarifas fijas por barbero y servicio. Cada miembro del equipo sabe exactamente cuánto ha generado en el día con total transparencia.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 inline-block">
              Elimina discusiones y horas de cuadre manual
            </span>
          </div>
        </div>

        {/* Bento 6: Marca Blanca */}
        <div className="p-7 rounded-3xl bg-[#0E1017] border border-white/[0.08] hover:border-amber-500/40 transition duration-300 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Portal Web con tu Propia Marca</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Personaliza tu página pública de reservas con tu logo oficial, colores corporativos, slogan y banner. Tus clientes reservan 24/7 sin instalar aplicaciones.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 inline-block">
              Tu enlace listo para tu bio de Instagram y TikTok
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
