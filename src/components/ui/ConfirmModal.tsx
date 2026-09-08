'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Trash2, X, Loader2 } from 'lucide-react'

export type ConfirmVariant = 'success' | 'danger' | 'warning' | 'primary'

export interface DetailItem {
  label: string
  value: string | React.ReactNode
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  loading?: boolean
  details?: DetailItem[]
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
  details,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  const variantConfig = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20',
    },
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      btn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      btn: 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20',
    },
    primary: {
      icon: AlertCircle,
      iconBg: 'bg-white/10 border-white/20 text-white',
      btn: 'bg-white hover:bg-neutral-200 text-black shadow-white/10',
    },
  }[variant]

  const Icon = variantConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#0D0E15] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer disabled:opacity-30"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${variantConfig.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">{title}</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {details && details.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#090A0E] border border-white/5 space-y-2 text-xs">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3">
                <span className="text-neutral-400 shrink-0">{item.label}:</span>
                <span className="font-semibold text-white truncate text-right">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer ${variantConfig.btn}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
