'use client'

import { useState } from 'react'
import { Mail, ArrowRight, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { requestPasswordResetAction } from '@/actions/auth'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = '',
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await requestPasswordResetAction(email)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      setSent(true)
    }
  }

  function handleClose() {
    setSent(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0E15] border border-white/[0.1] rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Enlace Enviado</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
                Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                <span className="text-amber-400 font-medium">{email}</span>. Revisa tu bandeja de entrada y spam.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition cursor-pointer"
            >
              Cerrar y Volver al Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 font-mono uppercase tracking-wider mb-1">
                Seguridad de Cuenta
              </div>
              <h3 className="text-lg font-bold text-white">Recuperar Contraseña</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ingresa el correo corporativo asociado a tu salón para enviarte un enlace de acceso seguro.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase tracking-wider mb-2">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 font-medium text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Enlace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
