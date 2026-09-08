import Link from 'next/link'
import {
  Scissors,
  Calendar,
  CreditCard,
  UserCheck,
  Users,
  Clock,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  CheckCircle2,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090A0E] text-neutral-100 font-sans">
      {/* Subtle warm ambient glow behind hero */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-amber-600/[0.07] rounded-full blur-[160px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-30 border-b border-white/[0.06] bg-[#090A0E]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-200">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight leading-none">
                Barber<span className="text-amber-500">OS</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-0.5">
                Salon & Studio System
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <a href="#agenda" className="hover:text-white transition">
              Agenda & Sillas
            </a>
            <a href="#ficha-tecnica" className="hover:text-white transition">
              Ficha Técnica
            </a>
            <a href="#pos-caja" className="hover:text-white transition">
              Caja & POS
            </a>
            <a href="#precios" className="hover:text-white transition">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-2 transition"
            >
              Ingresar
            </Link>
            <Link
              href="/registro-barberia"
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              Probar 14 Días Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-white/[0.08] text-amber-400 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>El Sistema Operativo Multi-Tenant para Barberías de Alto Rendimiento</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-[-0.03em] leading-[1.08] max-w-4xl mx-auto mb-6">
          Precisión quirúrgica para la agenda, caja y comisiones de tu barbería.
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Reemplaza cuadernos de papel, chats caóticos de WhatsApp y cálculos manuales de comisiones los fines de semana. Todo el flujo operativo en una sola pantalla.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/registro-barberia"
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/20 group cursor-pointer"
          >
            <span>Crear mi Barbería Ahora</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#agenda"
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-neutral-900/80 border border-white/[0.08] hover:border-neutral-700 text-neutral-300 font-semibold text-sm transition"
          >
            Ver Demostración en Vivo
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            14 días de prueba con todas las funciones
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Sin tarjeta de crédito requerida
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Paga con Yape, Plin o Transferencia
          </span>
        </div>

        {/* Live System Preview Mockup */}
        <div className="mt-16 rounded-2xl border border-white/[0.1] bg-[#111318]/90 p-3 sm:p-5 shadow-2xl backdrop-blur-xl text-left overflow-hidden">
          {/* Mockup Window Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-neutral-500 hidden sm:inline">
                barberos.app/barberia-elite/agenda
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                Caja Abierta: S/ 485.00
              </span>
              <span className="font-semibold text-white text-xs">Sábado, Turno Tarde</span>
            </div>
          </div>

          {/* Mockup Chairs Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Chair 1 */}
            <div className="p-3.5 rounded-xl bg-[#090A0E] border border-white/[0.06]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2.5">
                <div>
                  <span className="text-[11px] font-bold text-white block">Silla 1 • Carlitos Fade</span>
                  <span className="text-[10px] text-neutral-500">40% Comisión • 6 Citas</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#14161D] border border-purple-500/40">
                  <div className="flex justify-between text-[11px] font-bold text-amber-400">
                    <span>15:30 - 16:15</span>
                    <span className="text-purple-300 font-normal text-[10px]">En Silla</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Jorge Mendoza</p>
                  <p className="text-[11px] text-neutral-400">Mid Fade a navaja + Arreglo de Barba</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111318] border border-white/[0.04]">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                    <span>16:30 - 17:00</span>
                    <span className="text-blue-400 text-[10px]">Confirmada</span>
                  </div>
                  <p className="text-xs font-medium text-white mt-1">Gonzalo Silva</p>
                  <p className="text-[11px] text-neutral-400">Corte Clásico Texturizado</p>
                </div>
              </div>
            </div>

            {/* Chair 2 */}
            <div className="p-3.5 rounded-xl bg-[#090A0E] border border-white/[0.06]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2.5">
                <div>
                  <span className="text-[11px] font-bold text-white block">Silla 2 • Mateo "Master"</span>
                  <span className="text-[10px] text-neutral-500">50% Comisión • 5 Citas</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#14161D] border border-purple-500/40">
                  <div className="flex justify-between text-[11px] font-bold text-amber-400">
                    <span>15:00 - 16:00</span>
                    <span className="text-purple-300 font-normal text-[10px]">En Silla</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Rodrigo Benítez</p>
                  <p className="text-[11px] text-neutral-400">Low Taper Fade + Toalla Caliente</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111318] border border-white/[0.04]">
                  <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                    <span>16:15 - 16:45</span>
                    <span className="text-amber-400 text-[10px]">Walk-in</span>
                  </div>
                  <p className="text-xs font-medium text-white mt-1">Cliente Presencial</p>
                  <p className="text-[11px] text-neutral-400">Perfilado de Barba Ritual</p>
                </div>
              </div>
            </div>

            {/* Quick POS Snapshot */}
            <div className="p-3.5 rounded-xl bg-[#090A0E] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2.5">
                  <span className="text-[11px] font-bold text-white">Último Cobro en POS</span>
                  <span className="text-[10px] text-emerald-400 font-mono">15:18</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111318] border border-white/[0.04] space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Servicio:</span>
                    <strong className="text-white">Corte Fade + Barba</strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Método de Pago:</span>
                    <strong className="text-purple-400">Yape</strong>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Comisión Barbero (50%):</span>
                    <strong className="text-emerald-400">S/ 27.50</strong>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold text-sm text-white">
                    <span>Total Cobrado:</span>
                    <span className="text-amber-400">S/ 55.00</span>
                  </div>
                </div>
              </div>
              <div className="pt-3">
                <span className="text-[11px] text-neutral-400 block text-center">
                  Arqueo en tiempo real • Sin descuadres
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section id="agenda" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] leading-tight mb-4">
            Construido exactamente para el día a día de una barbería.
          </h2>
          <p className="text-neutral-400 text-base leading-relaxed">
            Nada de módulos innecesarios de consultoría o corporativos. Cada pantalla responde a las necesidades de la silla, el mostrador y la billetera del barbero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl bg-[#111318] border border-white/[0.06] hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Agenda de Sillas en Tiempo Real</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Cada barbero ve sus clientes en su propia columna. Cambia estados con un toque (Pendiente ➔ Confirmada ➔ En Silla ➔ Completada) y abre WhatsApp directo con el cliente si hay un retraso.
            </p>
          </div>

          {/* Pillar 2 */}
          <div id="ficha-tecnica" className="p-8 rounded-2xl bg-[#111318] border border-white/[0.06] hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Fichas Técnicas de Estilo</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Registra el tipo exacto de degradado (Low, Mid, High Fade), número de peine guía, largo superior y estilo de barba. Si el barbero habitual no está, cualquier colega del equipo le cortará idéntico.
            </p>
          </div>

          {/* Pillar 3 */}
          <div id="pos-caja" className="p-8 rounded-2xl bg-[#111318] border border-white/[0.06] hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Punto de Venta & Comisiones Transparentes</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Cobra servicios y productos en 3 segundos. Acepta Yape, Plin, Efectivo o Tarjeta. La comisión del barbero se calcula y acredita automáticamente sin errores de suma ni discusiones.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-2xl bg-[#111318] border border-white/[0.06] hover:border-neutral-700 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Portal de Reservas para tu Bio de Instagram</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Tu enlace único <span className="font-mono text-amber-400">/reservar/tu-barberia</span> donde tus clientes eligen servicio, barbero y horario disponible sin tener que instalar aplicaciones.
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="precios" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Planes claros, sin comisiones ocultas por corte.
          </h2>
          <p className="text-sm text-neutral-400">
            Comienza hoy con 14 días gratis. Sin tarjeta. Renueva fácilmente mediante Yape, Plin o transferencia bancaria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Starter */}
          <div className="p-6 rounded-2xl bg-[#111318] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Starter</h3>
              <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">
                Para barberos independientes o estudios de hasta 3 sillas.
              </p>
              <div className="my-6">
                <span className="text-3xl font-black text-white">S/ 59</span>
                <span className="text-xs text-neutral-400"> / mes</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hasta 3 barberos activos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Agenda interactiva en vivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Punto de Venta (POS) rápido</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Portal público para tu Instagram</span>
                </li>
              </ul>
            </div>
            <Link
              href="/registro-barberia"
              className="mt-8 block text-center py-3 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition"
            >
              Comenzar Prueba
            </Link>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-2xl bg-[#161820] border-2 border-amber-500 flex flex-col justify-between relative shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
              Más Recomendado
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">
                Para barberías consolidadas que necesitan control total y comisiones.
              </p>
              <div className="my-6">
                <span className="text-3xl font-black text-white">S/ 99</span>
                <span className="text-xs text-neutral-400"> / mes</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hasta 8 barberos activos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Control de Caja & Arqueos de turno</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Cálculo automático de comisiones</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Fichas Técnicas de Estilo para clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Acceso directo a WhatsApp</span>
                </li>
              </ul>
            </div>
            <Link
              href="/registro-barberia"
              className="mt-8 block text-center py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition shadow-lg shadow-amber-500/20"
            >
              Comenzar Prueba Pro Gratis
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-2xl bg-[#111318] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enterprise</h3>
              <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">
                Para franquicias, cadenas y negocios con alto flujo continuo.
              </p>
              <div className="my-6">
                <span className="text-3xl font-black text-white">S/ 179</span>
                <span className="text-xs text-neutral-400"> / mes</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Barberos ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Múltiples sucursales y sedes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Exportación de reportes contables</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Soporte prioritario 24/7 por WhatsApp</span>
                </li>
              </ul>
            </div>
            <Link
              href="/registro-barberia"
              className="mt-8 block text-center py-3 rounded-xl bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 text-neutral-200 text-xs font-bold transition"
            >
              Comenzar Prueba
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#090A0E] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">BarberOS</span>
            <span>— Diseñado para barberías que buscan la excelencia.</span>
          </div>
          <p>© {new Date().getFullYear()} BarberOS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
