'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerBarbershopAction } from '@/actions/onboarding'
import { slugify } from '@/lib/utils'
import {
  Scissors,
  User,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  Globe,
  Check,
} from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formLoadedAt] = useState(() => Date.now())

  // Form states for interactive feedback
  const [barbershopName, setBarbershopName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(true)

  const computedSlug = slugify(barbershopName) || 'mi-barberia'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!acceptTerms) {
      setError('Debes aceptar los Términos de Servicio para continuar.')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const ownerName = formData.get('ownerName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string
    const honeypot = (formData.get('company_website') as string) || ''

    try {
      const res = await registerBarbershopAction({
        ownerName,
        barbershopName,
        email,
        password,
        phone,
        city,
        honeypot,
        formLoadedAt,
      })

      if (res?.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      if (res?.success && res.slug) {
        router.push(
          `/registro-barberia/pendiente?slug=${encodeURIComponent(res.slug)}&name=${encodeURIComponent(
            barbershopName
          )}`
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        throw err
      }
      setError('Ocurrió un error al registrar la barbería. Inténtalo nuevamente.')
      setLoading(false)
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="w-full lg:w-1/2 xl:w-[50%] flex flex-col justify-between p-6 sm:p-10 xl:p-14 min-h-screen bg-[#07080B] relative z-10 selection:bg-amber-500 selection:text-black overflow-y-auto"
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

        {/* Mobile Brand */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white font-mono">
            Barber<span className="text-amber-500">OS</span>
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-lg mx-auto my-auto py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Prueba Pro Gratuita • 14 Días</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crea tu Barbería
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Configura tu espacio de trabajo en 2 minutos. Sin tarjeta de crédito requerida.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Trampa Anti-Spam / Anti-Bot (Honeypot) */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
              <label htmlFor="company_website">Website</label>
              <input
                type="text"
                id="company_website"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Grid 1: Owner & Barbershop Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Nombre del Dueño
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input aria-label="ownerName"
                    type="text"
                    name="ownerName"
                    required
                    placeholder="Carlos Mendoza"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Nombre de la Barbería
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input aria-label="barbershopName"
                    type="text"
                    name="barbershopName"
                    required
                    value={barbershopName}
                    onChange={(e) => setBarbershopName(e.target.value)}
                    placeholder="Imperio Barber Studio"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                  />
                </div>
              </div>
            </div>

            {/* Live Slug Preview */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-400 overflow-hidden">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] font-mono truncate">
                  Tu link: <span className="text-neutral-500">reservar/</span>
                  <span className="text-amber-400 font-bold">{computedSlug}</span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Check className="w-3 h-3" />
                <span>Disponible</span>
              </span>
            </div>

            {/* Grid 2: Phone & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  WhatsApp / Celular
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input aria-label="phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="+51 987 654 321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Ciudad o Distrito
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input aria-label="city"
                    type="text"
                    name="city"
                    placeholder="Lima, Miraflores"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Correo Electrónico de Acceso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input aria-label="email"
                  type="email"
                  name="email"
                  required
                  placeholder="contacto@imperiobarber.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="field" className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Contraseña de Administrador
                </label>
                <span className="text-[11px] text-neutral-400">Mínimo 6 caracteres</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input aria-label="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D0E15] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition hover:border-white/[0.15]"
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

            {/* Terms and conditions checkbox */}
            <div className="pt-1">
              <label htmlFor="field" className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-neutral-400">
                <input aria-label="input"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-[#0D0E15] border-white/[0.15] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 transition cursor-pointer accent-amber-500"
                />
                <span className="leading-relaxed">
                  Acepto los Términos de Servicio y la Política de Privacidad de BarberOS.
                </span>
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
                  <span>Configurando tu Barbería en la Nube...</span>
                </>
              ) : (
                <>
                  <span>Crear mi Barbería & Comenzar Prueba Gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-3 border-t border-white/[0.06] text-center">
            <p className="text-xs text-neutral-400">
              ¿Ya tienes una barbería registrada?{' '}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-bold transition inline-flex items-center gap-1"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06] text-[11px] text-neutral-500">
        <span>BarberOS Onboarding</span>
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
    </div>
  )
}
