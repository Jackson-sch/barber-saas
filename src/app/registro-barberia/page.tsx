import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import RegisterShowcase from '@/components/auth/RegisterShowcase'
import RegisterForm from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comienza tu Prueba Gratis de 14 Días — BarberOS',
  description:
    'Configura tu barbería o salón en 2 minutos. Agenda WhatsApp, punto de venta táctil, comisiones y portal de reservas.',
}

export default function RegistroBarberiaPage() {
  return (
    <main
      suppressHydrationWarning
      className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col lg:flex-row antialiased overflow-x-hidden"
    >
      {/* Left Column: Visual Showcase & Onboarding Highlights */}
      <RegisterShowcase />

      {/* Right Column: Interactive Registration Form with Suspense */}
      <Suspense
        fallback={
          <div className="w-full lg:w-1/2 xl:w-[50%] flex items-center justify-center min-h-screen bg-[#07080B]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-neutral-400 font-mono">Cargando registro seguro...</p>
            </div>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </main>
  )
}
