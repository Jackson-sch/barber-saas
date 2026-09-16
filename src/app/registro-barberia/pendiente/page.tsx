import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Scissors,
  Store,
  CalendarCheck,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro en Revisión — BarberOS',
  description: 'Tu solicitud de barbería ha sido recibida y está en proceso de validación.',
}

interface PendingRegistrationPageProps {
  searchParams: Promise<{
    slug?: string
    name?: string
  }>
}

export default async function PendingRegistrationPage({ searchParams }: PendingRegistrationPageProps) {
  const params = await searchParams
  const barbershopName = params.name ? decodeURIComponent(params.name) : 'Tu Barbería'
  const slug = params.slug || ''

  const whatsappMessage = encodeURIComponent(
    `💈 Hola equipo de BarberOS, acabo de registrar mi barbería "${barbershopName}" (slug: ${slug}) y me gustaría solicitar la activación de mi cuenta para comenzar mi prueba gratuita.`
  )
  const whatsappUrl = `https://wa.me/51987654321?text=${whatsappMessage}`

  return (
    <main className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 space-y-8 text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-neutral-400 font-medium">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Scissors className="w-3 h-3" />
          </div>
          <span>BarberOS Cloud Platform</span>
        </div>

        {/* Status Icon with pulsating effect */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-neutral-900 border-2 border-[#07080B] flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            ¡Registro recibido con éxito!
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 max-w-md mx-auto leading-relaxed">
            Tu cuenta para <span className="text-amber-400 font-semibold">{barbershopName}</span> ha sido creada. Nuestro equipo está revisando la solicitud para habilitar tu acceso exclusivo.
          </p>
        </div>

        {/* Card Details */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-xl text-left space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
            <span className="text-xs text-neutral-400 font-medium">Estado de la cuenta</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Pendiente de Aprobación
            </span>
          </div>

          <div className="space-y-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Prueba de 14 días gratis reservada (inicia al ser activado)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Base de datos aislada y portal de reservas preparado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Catálogo demo y 3 servicios iniciales pre-configurados</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            💡 <span className="font-semibold text-amber-300">¿Por qué este paso?</span> Para garantizar la seguridad de la plataforma y evitar registros automatizados, un administrador verifica cada salón antes de activar el panel.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Agilizar activación vía WhatsApp</span>
          </a>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-200 border border-white/10 font-semibold text-sm transition"
          >
            <span>Ir al Inicio de Sesión</span>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-xs text-neutral-500">
          ¿Dudas o consultas directas? Escríbenos a{' '}
          <span className="text-neutral-400">soporte@barberos.com</span>
        </p>
      </div>
    </main>
  )
}
