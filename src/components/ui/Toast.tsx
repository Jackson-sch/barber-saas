'use client'

import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error'
  text: string
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 ${
        isSuccess
          ? 'bg-[#0D0E15]/95 border-emerald-500/30 text-emerald-400'
          : 'bg-[#0D0E15]/95 border-red-500/30 text-red-300'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        )}
        <p className="text-xs font-medium text-white leading-tight">{toast.text}</p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-md hover:bg-white/[0.08] text-neutral-400 hover:text-white transition cursor-pointer shrink-0"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
