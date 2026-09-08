'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/actions/auth'
import { Scissors, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || ''
  const errorParam = searchParams.get('error')

  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'No tienes permisos para acceder a esta barbería'
      : errorParam === 'suspended'
      ? 'Esta barbería ha sido suspendida. Contacta a soporte para reactivar el acceso.'
      : null
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (redirect) {
      formData.append('redirect', redirect)
    }

    try {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
    } catch (err: unknown) {
      // Si Next.js hace redirect(), lanza una excepción interna que se debe re-lanzar
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        throw err
      }
      setError('Ocurrió un error al iniciar sesión. Inténtalo nuevamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-black">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Barber<span className="text-amber-500">OS</span>
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-200">Iniciar Sesión</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ingresa a tu panel de gestión de barbería
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ejemplo@barberia.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  Entrar a mi Barbería
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
            <p className="text-sm text-neutral-400">
              ¿Aún no tienes cuenta?{' '}
              <Link
                href="/registro-barberia"
                className="text-amber-400 hover:text-amber-300 font-medium transition"
              >
                Crea tu barbería gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

