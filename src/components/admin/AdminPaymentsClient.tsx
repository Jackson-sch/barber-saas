'use client'

import { useState } from 'react'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Search,
  Loader2,
  Building2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { approvePaymentAction, rejectPaymentAction } from '@/actions/subscription'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import type { SubscriptionPayment, Organization } from '@/types/database.types'

export interface PaymentWithOrg extends SubscriptionPayment {
  organization?: Organization | null
}

interface AdminPaymentsClientProps {
  initialPayments: PaymentWithOrg[]
}

export default function AdminPaymentsClient({ initialPayments }: AdminPaymentsClientProps) {
  const [payments, setPayments] = useState<PaymentWithOrg[]>(initialPayments)
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [approvingPayment, setApprovingPayment] = useState<PaymentWithOrg | null>(null)
  const [rejectingPayment, setRejectingPayment] = useState<PaymentWithOrg | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (initialPayments !== payments) {
    setPayments(initialPayments)
  }

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' ? true : p.status === statusFilter
    const orgName = p.organization?.name?.toLowerCase() || ''
    const orgSlug = p.organization?.slug?.toLowerCase() || ''
    const refCode = p.reference_code?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()

    const matchesSearch = orgName.includes(q) || orgSlug.includes(q) || refCode.includes(q)
    return matchesStatus && matchesSearch
  })

  function handleApprove(payment: PaymentWithOrg) {
    setApprovingPayment(payment)
  }

  async function handleConfirmApprove() {
    if (!approvingPayment) return
    setLoadingId(approvingPayment.id)
    const res = await approvePaymentAction(approvingPayment.id)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', `Pago aprobado para "${approvingPayment.organization?.name}". Plan renovado.`)
    }
    setLoadingId(null)
    setApprovingPayment(null)
  }

  async function handleConfirmReject() {
    if (!rejectingPayment) return
    setLoadingId(rejectingPayment.id)
    const res = await rejectPaymentAction(rejectingPayment.id, rejectReason)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', `Comprobante rechazado correctamente.`)
    }
    setLoadingId(null)
    setRejectingPayment(null)
    setRejectReason('')
  }

  const statusBadges: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    APPROVED: { label: 'Aprobado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    REJECTED: { label: 'Rechazado', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Bandeja de Aprobación de Pagos
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Valida los vouchers de Yape, Plin o Transferencias enviados por las barberías para activar sus suscripciones.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Pendientes ({payments.filter((p) => p.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Aprobados ({payments.filter((p) => p.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'REJECTED'
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Rechazados ({payments.filter((p) => p.status === 'REJECTED').length})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Todos ({payments.length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input aria-label="Buscar por barbería o código..."
            type="text"
            placeholder="Buscar por barbería o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No hay pagos en este estado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-800 bg-neutral-950/40">
                <tr>
                  <th className="p-4">Barbería</th>
                  <th className="p-4">Plan / Meses</th>
                  <th className="p-4">Monto</th>
                  <th className="p-4">Método / Referencia</th>
                  <th className="p-4">Voucher</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredPayments.map((payment) => {
                  const badge = statusBadges[payment.status] || statusBadges.PENDING
                  const dateStr = formatDateTime(payment.submitted_at)
                  const isProcessing = loadingId === payment.id

                  return (
                    <tr key={payment.id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">
                          {payment.organization?.name || 'Barbería'}
                        </div>
                        <span className="text-[11px] font-mono text-amber-400">
                          /{payment.organization?.slug}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-white">{payment.plan_tier}</span>
                        <span className="text-neutral-400 block text-[11px]">
                          {payment.months_paid} mes/es
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-white text-sm">
                          {formatPrice(Number(payment.amount))}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-white">{payment.payment_method}</span>
                        {payment.reference_code && (
                          <span className="text-neutral-400 block font-mono text-[11px]">
                            Ref: {payment.reference_code}
                          </span>
                        )}
                        {payment.notes && (
                          <span className="text-neutral-500 block text-[10px] italic">
                            &ldquo;{payment.notes}&rdquo;
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <a
                          href={payment.voucher_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500 text-amber-400 text-xs font-medium inline-flex items-center gap-1.5 transition"
                        >
                          <span>Ver Comprobante</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      <td className="p-4 text-neutral-400 font-mono text-xs" suppressHydrationWarning>
                        {dateStr}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {payment.rejection_reason && (
                          <span className="block text-[10px] text-red-400 mt-1 max-w-xs truncate">
                            Motivo: {payment.rejection_reason}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {payment.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(payment)}
                              disabled={isProcessing}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>Aprobar</span>
                            </button>

                            <button
                              onClick={() => setRejectingPayment(payment)}
                              disabled={isProcessing}
                              className="py-1.5 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium text-xs transition cursor-pointer disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px] italic">Procesado</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Rechazo Moderno */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0D0E15] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Rechazar Comprobante de Pago</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Indica el motivo del rechazo para informar a la barbería (ej: captura ilegible, monto no coincide, código inexistente).
                </p>
              </div>
            </div>

            <textarea aria-label="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Escribe el motivo del rechazo aquí..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500 transition resize-none"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || loadingId === rejectingPayment.id}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-40 cursor-pointer"
              >
                {loadingId === rejectingPayment.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmar Rechazo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Aprobación */}
      <ConfirmModal
        isOpen={!!approvingPayment}
        onClose={() => setApprovingPayment(null)}
        onConfirm={handleConfirmApprove}
        title="Aprobar Pago de Suscripción"
        description="Al aprobar este comprobante se renovará la suscripción del tenant y se reactivará automáticamente el acceso si estaba suspendido."
        confirmText="Aprobar Pago"
        cancelText="Cancelar"
        variant="success"
        loading={loadingId === approvingPayment?.id}
        details={
          approvingPayment
            ? [
                { label: 'Barbería', value: approvingPayment.organization?.name || 'Barbería' },
                { label: 'Monto a Validar', value: formatPrice(Number(approvingPayment.amount)) },
                { label: 'Plan Solicitado', value: `${approvingPayment.plan_tier} (${approvingPayment.months_paid} mes/es)` },
                { label: 'Método', value: approvingPayment.payment_method },
                ...(approvingPayment.reference_code
                  ? [{ label: 'N° Operación / Ref', value: approvingPayment.reference_code }]
                  : []),
              ]
            : undefined
        }
      />

      {/* Notificaciones Toast */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
