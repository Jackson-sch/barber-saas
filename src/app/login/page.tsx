import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import AuthShowcase from '@/components/auth/AuthShowcase'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — BarberOS',
  description: 'Ingresa a la consola de gestión de tu barbería o salón en BarberOS.',
}

export default function LoginPage() {
  return (
    <main
      suppressHydrationWarning
      className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col lg:flex-row antialiased overflow-x-hidden"
    >
      {/* Left Column: Visual Showcase & Brand Storytelling (hidden on mobile, visible on desktop) */}
      <AuthShowcase />

      {/* Right Column: Interactive Login Form with Suspense for SearchParams */}
      <Suspense
        fallback={
          <div className="w-full lg:w-1/2 xl:w-[48%] flex items-center justify-center min-h-screen bg-[#07080B]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-neutral-400 font-mono">Cargando consola segura...</p>
            </div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  )
}
