'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/actions/auth'
import {
  Scissors,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import ForgotPasswordModal from './ForgotPasswordModal'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || ''
  const errorParam = searchParams.get('error')
  const resetParam = searchParams.get('reset')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [forgotModalOpen, setForgotModalOpen] = useState(false)

  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'No tienes permisos para acceder a esta barbería.'
      : errorParam === 'pending_approval'
      ? 'Tu barbería está en proceso de revisión por el equipo de BarberOS. Te notificaremos en cuanto tu cuenta sea aprobada.'
      : errorParam === 'suspended'
      ? 'Esta barbería ha sido suspendida. Contacta a soporte para reactivar el acceso.'
      : null
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
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
      // Re-lanzar si Next.js hace redirect()
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        throw err
      }
      setError('Ocurrió un error al iniciar sesión. Inténtalo nuevamente.')
      setLoading(false)
    }
  }

  // Carga rápida de credenciales para demostración / testing
  function handleFillDemo() {
    setEmail('admin@barberos.com')
    setPassword('barber123')
    setError(null)
  }

  return (
    <div
      suppressHydrationWarning
      className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 xl:p-16 min-h-screen bg-[#07080B] relative z-10 selection:bg-amber-500 selection:text-black"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition group py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Mobile Brand (visible when showcase is hidden) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white font-mono">
            Barber<span className="text-amber-500">OS</span>
          </span>
        </div>
      </div>

      {/* Center Form Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="space-y-6">
          {/* Headline */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Consola de Gestión</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Ingresa tus credenciales para acceder a tu panel de control, agenda y punto de venta.
            </p>
          </div>

          {/* Banner si viene de restablecimiento exitoso */}
          {resetParam === 'success' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Tu contraseña ha sido restablecida. Ingresa con tus nuevas credenciales.</span>
            </div>
          )}

          {/* Banner de error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@barberia.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-amber-400/90 hover:text-amber-300 transition font-medium cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0D0E15] border-white/[0.15] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-neutral-400 font-medium">Recordarme en este equipo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando en BarberOS...</span>
                </>
              ) : (
                <>
                  <span>Entrar a mi Barbería</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access pill */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] text-neutral-400 hover:text-amber-400 text-[11px] font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>¿Probando la plataforma? Cargar credenciales Demo</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="pt-4 border-t border-white/[0.06] text-center">
            <p className="text-xs text-neutral-400">
              ¿Aún no tienes una barbería registrada?{' '}
              <Link
                href="/registro-barberia"
                className="text-amber-400 hover:text-amber-300 font-bold transition inline-flex items-center gap-1"
              >
                <span>Crea tu barbería gratis</span>
                <span className="text-[10px] text-amber-400/80 font-mono">(14 días Pro)</span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/[0.06] text-[11px] text-neutral-500">
        <span>BarberOS Cloud Platform</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-neutral-300 transition">
            Términos
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-neutral-300 transition">
            Privacidad
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-neutral-300 transition">
            Soporte
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        initialEmail={email}
      />
    </div>
  )
}
