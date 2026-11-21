import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'

export const metadata: Metadata = {
  title: 'Política de Privacidad y Seguridad — BarberOS',
  description: 'Cómo recopilamos, protegemos y aislamos los datos de barberías y clientes en BarberOS.',
}

const SECTIONS = [
  {
    title: '1. Información que Recopilamos',
    body: 'Para operar el servicio recopilamos datos de registro de la barbería (nombre comercial, teléfono, correo, dirección y ciudad), datos operativos del staff (nombre, rol y comisiones), y datos ingresados para agendar o atender citas (nombre del cliente, teléfono, correo opcional, preferencias de estilo e historial de visitas y ventas).',
  },
  {
    title: '2. Seguridad Técnica y Aislamiento Multi-Tenant',
    body: 'Toda comunicación entre tu navegador y nuestros servidores viaja cifrada mediante HTTPS/TLS. En base de datos aplicamos Row Level Security (RLS) en PostgreSQL para aislar estrictamente la información de cada barbería, además de bóvedas separadas en servidor (organization_secrets y platform_secrets) para que las llaves privadas de pasarelas, WhatsApp o Cloudinary nunca queden expuestas al navegador.',
  },
  {
    title: '3. Uso de Servicios de Terceros',
    body: 'Para brindar funcionalidades de nube, mensajería y pagos nos apoyamos en infraestructura especializada como Supabase (autenticación y base de datos), Vercel (alojamiento), Cloudinary (almacenamiento optimizado de imágenes y comprobantes) y, cuando cada barbería los habilita, proveedores como Meta WhatsApp Cloud API, Culqi o Web Push del navegador.',
  },
  {
    title: '4. Notificaciones Push y Permisos del Dispositivo',
    body: 'Las notificaciones push nativas para barberos y administradores son estrictamente opcionales y requieren autorización explícita del usuario en su navegador o PWA instalada. Puedes revocar el permiso en cualquier momento desde la campana de notificaciones o desde los ajustes de tu dispositivo.',
  },
  {
    title: '5. Derechos de Acceso, Rectificación y Eliminación',
    body: 'Los titulares de cuentas y clientes finales pueden solicitar la actualización o eliminación de sus datos personales comunicándose directamente con la barbería correspondiente o con el equipo de soporte de BarberOS.',
  },
]

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#090A0E] text-neutral-100 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090A0E]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size={34} compact />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacidad & Seguridad</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidad y Seguridad
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Última actualización: noviembre de 2026 • Compromiso de protección de datos en BarberOS.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((sec) => (
            <section
              key={sec.title}
              className="p-5 sm:p-6 rounded-2xl bg-[#0D0E15] border border-white/[0.08] space-y-2"
            >
              <h2 className="text-sm sm:text-base font-bold text-white">{sec.title}</h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{sec.body}</p>
            </section>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-300 leading-relaxed">
              Revisa también las condiciones comerciales y de uso de la plataforma.
            </p>
          </div>
          <Link
            href="/terminos"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition text-center shrink-0"
          >
            Ver Términos y Condiciones
          </Link>
        </div>
      </main>
    </div>
  )
}
