import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AuthShowcase from '@/components/auth/AuthShowcase'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión — BarberOS',
  description: 'Ingresa a la consola de gestión de tu barbería o salón en BarberOS.',
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams

  if (!resolvedParams?.error) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.is_super_admin) {
        redirect('/admin')
      }

      const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organization:organizations(slug, is_active)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      const orgData = Array.isArray(membership?.organization)
        ? membership?.organization[0]
        : membership?.organization

      if (orgData?.slug && orgData.is_active) {
        const target =
          resolvedParams?.redirect && resolvedParams.redirect.startsWith(`/app/${orgData.slug}`)
            ? resolvedParams.redirect
            : membership?.role === 'BARBER'
            ? `/app/${orgData.slug}/agenda`
            : `/app/${orgData.slug}/dashboard`
        redirect(target)
      }
    }
  }

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
