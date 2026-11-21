import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — BarberOS',
  description: 'Términos de servicio, uso de la plataforma SaaS, suscripciones y responsabilidades en BarberOS.',
}

const SECTIONS = [
  {
    title: '1. Objeto del Servicio',
    body: 'BarberOS proporciona una plataforma en la nube (Software as a Service) diseñada para la gestión integral de barberías y salones, incluyendo agenda de citas, portal público de reservas, punto de venta (POS), control de caja, cálculo de comisiones, inventario y fidelización de clientes.',
  },
  {
    title: '2. Registro, Cuentas y Período de Prueba (Trial)',
    body: 'Al registrar una barbería, el titular declara que la información proporcionada es veraz y que cuenta con autorización para representar al establecimiento. Toda cuenta nueva puede acceder a un período de prueba gratuito sujeto a aprobación administrativa. El uso de la plataforma es personal e intransferible por organización (tenant).',
  },
  {
    title: '3. Planes, Suscripciones y Pagos',
    body: 'Finalizado el período de prueba, la continuidad del servicio requiere mantener una suscripción activa conforme a las tarifas vigentes publicadas en el módulo de Suscripción. Los pagos realizados por transferencia, Yape, Plin o pasarela se validan mediante comprobante y extienden el período contratado. La falta de renovación podrá conllevar la suspensión temporal del acceso operativo hasta regularizar el abono.',
  },
  {
    title: '4. Responsabilidad de las Barberías y Clientes Finales',
    body: 'BarberOS actúa exclusivamente como proveedor tecnológico. Cada barbería es única responsable de la calidad de sus servicios presenciales, precios exhibidos, cumplimiento tributario, emisión de comprobantes legales, políticas de cancelación y gestión de pagos recibidos directamente de sus clientes finales.',
  },
  {
    title: '5. Propiedad de los Datos y Contenido',
    body: 'Cada barbería conserva la plena titularidad sobre su cartera de clientes, historial de citas, ventas, catálogo de servicios e imágenes cargadas. BarberOS no vende ni comercializa bases de datos de clientes de los establecimientos registrados.',
  },
  {
    title: '6. Uso Aceptable y Disponibilidad',
    body: 'Queda prohibido utilizar la plataforma para envío de spam, suplantación de identidad, almacenamiento de contenido ilícito o intentos de vulnerar el aislamiento multi-tenant. BarberOS realiza esfuerzos continuos para mantener alta disponibilidad del servicio, sin perjuicio de mantenimientos programados o incidencias de proveedores externos.',
  },
  {
    title: '7. Modificaciones y Contacto',
    body: 'BarberOS podrá actualizar estos Términos y Condiciones para reflejar mejoras técnicas o cambios normativos, publicando la versión vigente en esta página. Para consultas legales o soporte puedes comunicarte mediante los canales oficiales de la plataforma.',
  },
]

export default function TerminosPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Documento Legal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Términos y Condiciones de Servicio
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Última actualización: noviembre de 2026 • Aplicable a todos los usuarios y barberías de BarberOS.
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

        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-300 leading-relaxed">
              Consulta también cómo protegemos tus datos en nuestra Política de Privacidad y Seguridad.
            </p>
          </div>
          <Link
            href="/privacidad"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition text-center shrink-0"
          >
            Ver Política de Privacidad
          </Link>
        </div>
      </main>
    </div>
  )
}
