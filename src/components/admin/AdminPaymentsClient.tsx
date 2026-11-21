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
  Sparkles,
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

const REJECT_PRESETS = [
  'Captura ilegible o incompleta',
  'El monto abonado no coincide con el plan',
  'Código de operación no encontrado',
]

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

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length
  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length
  const approvedTotal = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

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
    PENDING: { label: 'Pendiente', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    APPROVED: { label: 'Aprobado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    REJECTED: { label: 'Rechazado', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header + Bento KPI Strip */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Bandeja de Aprobación de Pagos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Valida vouchers de Yape, Plin o Transferencias para activar o renovar suscripciones.
          </p>
        </div>

        <div className="xl:col-span-6 grid grid-cols-3 gap-3">
          <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Pendientes</span>
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums mt-2">
              {pendingCount}
            </p>
          </div>

          <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Aprobados</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums mt-2">
              {approvedCount}
            </p>
          </div>

          <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Recaudado</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            </span>
            <p className="text-base sm:text-xl font-black text-white tabular-nums mt-2 truncate">
              {formatPrice(approvedTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (100% Responsive - No clipping on mobile) */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {[
            { id: 'PENDING', label: 'Pendientes', count: pendingCount },
            { id: 'APPROVED', label: 'Aprobados', count: approvedCount },
            { id: 'REJECTED', label: 'Rechazados', count: rejectedCount },
            { id: 'ALL', label: 'Todos', count: payments.length },
          ].map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  active
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold tabular-nums ${
                    active ? 'bg-black/15 text-black' : 'bg-white/[0.06] text-neutral-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            aria-label="Buscar por barbería o código"
            type="text"
            placeholder="Buscar por barbería o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Payments Content */}
      {filteredPayments.length === 0 ? (
        <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-300">No hay pagos en este estado.</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cambia el filtro superior para consultar otros comprobantes.
          </p>
        </div>
      ) : (
        <>
          {/* Vista Móvil y Tablet (< lg): Tarjetas Responsivas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredPayments.map((payment) => {
              const badge = statusBadges[payment.status] || statusBadges.PENDING
              const dateStr = formatDateTime(payment.submitted_at)
              const isProcessing = loadingId === payment.id

              return (
                <div
                  key={payment.id}
                  className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">
                          {payment.organization?.name || 'Barbería'}
                        </h3>
                        <span className="text-[11px] font-mono text-amber-400">
                          /{payment.organization?.slug}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/90 border border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block">
                          Plan & Duración
                        </span>
                        <span className="font-bold text-white">
                          {payment.plan_tier} ({payment.months_paid}m)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase block">Monto</span>
                        <span className="font-black text-amber-400 text-sm tabular-nums">
                          {formatPrice(Number(payment.amount))}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase block">Método</span>
                        <span className="font-semibold text-neutral-200">
                          {payment.payment_method}
                          {payment.reference_code ? ` • #${payment.reference_code}` : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase block">Fecha</span>
                        <span
                          className="font-mono text-[11px] text-neutral-400"
                          suppressHydrationWarning
                        >
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    {payment.notes && (
                      <p className="text-[11px] text-neutral-400 italic">
                        &ldquo;{payment.notes}&rdquo;
                      </p>
                    )}

                    {payment.rejection_reason && (
                      <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                        Motivo: {payment.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={payment.voucher_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-neutral-950 border border-white/[0.1] hover:border-amber-500 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <span>Ver Voucher</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {payment.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingPayment(payment)}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(payment)}
                          disabled={isProcessing}
                          className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Aprobar</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-[11px] italic">Procesado</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Vista Escritorio (lg+): Tabla Ejecutiva */}
          <div className="hidden lg:block bg-[#0D0E15] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-white/[0.08] bg-neutral-950/60">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Barbería</th>
                    <th className="p-4 whitespace-nowrap">Plan / Meses</th>
                    <th className="p-4 whitespace-nowrap">Monto</th>
                    <th className="p-4 whitespace-nowrap">Método / Ref</th>
                    <th className="p-4 whitespace-nowrap">Voucher</th>
                    <th className="p-4 whitespace-nowrap">Fecha</th>
                    <th className="p-4 whitespace-nowrap">Estado</th>
                    <th className="p-4 text-right whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredPayments.map((payment) => {
                    const badge = statusBadges[payment.status] || statusBadges.PENDING
                    const dateStr = formatDateTime(payment.submitted_at)
                    const isProcessing = loadingId === payment.id

                    return (
                      <tr key={payment.id} className="text-neutral-300 hover:bg-white/[0.02] transition">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-white text-sm">
                            {payment.organization?.name || 'Barbería'}
                          </div>
                          <span className="text-[11px] font-mono text-amber-400">
                            /{payment.organization?.slug}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-white">{payment.plan_tier}</span>
                          <span className="text-neutral-400 block text-[11px] tabular-nums">
                            {payment.months_paid} {payment.months_paid === 1 ? 'mes' : 'meses'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-extrabold text-white text-sm tabular-nums">
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
                            <span className="text-neutral-500 block text-[10px] italic max-w-[200px] truncate">
                              &ldquo;{payment.notes}&rdquo;
                            </span>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <a
                            href={payment.voucher_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-white/[0.08] hover:border-amber-500 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                          >
                            <span>Ver Comprobante</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        <td
                          className="p-4 text-neutral-400 font-mono text-xs whitespace-nowrap"
                          suppressHydrationWarning
                        >
                          {dateStr}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {payment.rejection_reason && (
                            <span className="block text-[10px] text-red-400 mt-1 max-w-xs truncate">
                              Motivo: {payment.rejection_reason}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          {payment.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(payment)}
                                disabled={isProcessing}
                                className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Aprobar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRejectingPayment(payment)}
                                disabled={isProcessing}
                                className="py-1.5 px-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
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
          </div>
        </>
      )}

      {/* Modal de Rechazo Moderno */}
      {rejectingPayment && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectingPayment(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Rechazar Comprobante de Pago</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Selecciona o escribe el motivo del rechazo para informar a{' '}
                  <strong className="text-white">{rejectingPayment.organization?.name}</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {REJECT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectReason(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                    rejectReason === preset
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-neutral-950 border-white/[0.08] text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="reject_payment_reason" className="sr-only">
                Motivo del rechazo
              </label>
              <textarea
                id="reject_payment_reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Escribe el motivo del rechazo aquí..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.1] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || loadingId === rejectingPayment.id}
                className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-40 cursor-pointer"
              >
                {loadingId === rejectingPayment.id && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
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
                {
                  label: 'Plan Solicitado',
                  value: `${approvingPayment.plan_tier} (${approvingPayment.months_paid} mes/es)`,
                },
                { label: 'Método', value: approvingPayment.payment_method },
                ...(approvingPayment.reference_code
                  ? [{ label: 'N° Operación / Ref', value: approvingPayment.reference_code }]
                  : []),
              ]
            : undefined
        }
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
