'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registerBarbershopAction } from '@/actions/onboarding'
import { Scissors, User, Building2, Mail, Lock, Phone, MapPin, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegistroBarberiaPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const ownerName = formData.get('ownerName') as string
    const barbershopName = formData.get('barbershopName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string

    try {
      const res = await registerBarbershopAction({
        ownerName,
        barbershopName,
        email,
        password,
        phone,
        city,
      })

      if (res?.error) {
        setError(res.error)
        setLoading(false)
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
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-black">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 group mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Barber<span className="text-amber-500">OS</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Comienza tus 14 días de prueba gratis
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-sm">
            Configura tu barbería en segundos. Sin tarjeta de crédito requerida.
          </p>
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-neutral-300">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Agenda & POS</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Link de Citas Web</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Comisiones & Caja</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nombre del Dueño
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder="Carlos Mendoza"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Barbería
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="barbershopName"
                    required
                    placeholder="Imperio Barber Studio"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  WhatsApp / Teléfono
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+51 987 654 321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                  Ciudad
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="city"
                    placeholder="Lima"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="contacto@imperiobarber.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Al menos 6 caracteres"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando tu Barbería...
                </>
              ) : (
                <>
                  Crear mi Barbería & Comenzar Prueba
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
            <p className="text-sm text-neutral-400">
              ¿Ya tienes una barbería registrada?{' '}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-medium transition"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
