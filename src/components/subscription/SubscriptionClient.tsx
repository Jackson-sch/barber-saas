'use client'

import { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  Upload,
  AlertCircle,
  FileText,
  CreditCard,
  Check,
  Loader2,
} from 'lucide-react'
import { formatPrice, formatDateOnly } from '@/lib/utils'
import { submitSubscriptionPaymentAction } from '@/actions/subscription'
import type { Organization, OrganizationSubscription, SubscriptionPayment } from '@/types/database.types'

interface SubscriptionClientProps {
  org: Organization
  subscription: OrganizationSubscription | null
  payments: SubscriptionPayment[]
  slug: string
}

const PLANS = [
  {
    id: 'STARTER',
    name: 'Plan Starter',
    price: 59,
    description: 'Ideal para barberos independientes y estudios pequeños.',
    features: ['Hasta 3 barberos', 'Agenda & Calendario en vivo', 'Punto de Venta (POS)', 'Portal público de citas'],
  },
  {
    id: 'PRO',
    name: 'Plan Pro (Más Popular)',
    price: 99,
    popular: true,
    description: 'Para barberías consolidadas que necesitan control total.',
    features: [
      'Hasta 8 barberos',
      'Control de Caja & Arqueos',
      'Cálculo de comisiones automático',
      'Fichas Técnicas de Estilo',
      'Recordatorios por WhatsApp',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Plan Enterprise',
    price: 179,
    description: 'Para franquicias y cadenas con alto volumen de atención.',
    features: [
      'Barberos ilimitados',
      'Múltiples sedes',
      'Reportes financieros avanzados',
      'Soporte prioritario 24/7',
    ],
  },
]

export default function SubscriptionClient({
  org,
  subscription,
  payments,
  slug,
}: SubscriptionClientProps) {
  const [selectedPlan, setSelectedPlan] = useState('PRO')
  const [months, setMonths] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN' | 'TRANSFER'>('YAPE')
  const [voucherUrl, setVoucherUrl] = useState('')
  const [referenceCode, setReferenceCode] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Plan actual y cálculo de días
  const currentPlan = subscription?.plan_tier || 'TRIAL'
  const currentStatus = subscription?.status || 'TRIAL'
  const endDate = subscription?.current_period_end ? new Date(subscription.current_period_end) : new Date(org.trial_ends_at)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  // Cálculo del monto total según plan y meses
  const activePlanMeta = PLANS.find((p) => p.id === selectedPlan) || PLANS[1]
  const amountToPay = activePlanMeta.price * months

  async function handleSubmitVoucher(e: React.FormEvent) {
    e.preventDefault()
    if (!voucherUrl.trim()) {
      setError('Por favor ingresa la URL o enlace del comprobante / voucher.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await submitSubscriptionPaymentAction({
      organization_id: org.id,
      plan_tier: selectedPlan,
      amount: amountToPay,
      months_paid: months,
      payment_method: paymentMethod,
      voucher_url: voucherUrl.trim(),
      reference_code: referenceCode || null,
      notes: notes || null,
      slug,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setVoucherUrl('')
      setReferenceCode('')
      setNotes('')
    }
    setLoading(false)
  }

  const paymentBadges: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En Revisión', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    APPROVED: { label: 'Aprobado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    REJECTED: { label: 'Rechazado', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Mi Suscripción & Pagos
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Gestiona el estado de tu plan, activa o renueva tu cuenta subiendo tu comprobante de pago.
        </p>
      </div>

      {/* Plan Status Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-950 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PLAN {currentPlan}
              </span>
              <span className="text-xs text-neutral-400">
                Estado: <strong className="text-emerald-400 uppercase">{currentStatus}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {daysLeft > 0 ? `${daysLeft} días restantes` : 'Período vencido'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1" suppressHydrationWarning>
              {daysLeft > 0
                ? `Tu período actual vence el ${formatDateOnly(endDate)}.`
                : 'Tu prueba o suscripción ha concluido. Envía tu comprobante para reactivar.'}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-neutral-400 block">Barbería Registrada</span>
            <span className="text-base font-bold text-white">{org.name}</span>
            <span className="text-xs text-amber-400 block font-mono">/{org.slug}</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Elige tu Plan de Renovación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                selectedPlan === plan.id
                  ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500 shadow-xl shadow-amber-500/10'
                  : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-base">{plan.name}</h4>
                  {plan.popular && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                      TOP
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 min-h-[32px]">{plan.description}</p>

                <div className="my-4">
                  <span className="text-3xl font-black text-white">{formatPrice(plan.price)}</span>
                  <span className="text-xs text-neutral-400"> / mes</span>
                </div>

                <ul className="space-y-2 text-xs text-neutral-300">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <button
                  type="button"
                  className={`w-full py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'bg-amber-500 text-black'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Elegir este Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos de Pago & Subida de Comprobante */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Datos Bancarios (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <QrCode className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm">Cuentas Oficiales para Pagar</h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Realiza tu transferencia o pago por Yape/Plin por el monto exacto del plan seleccionado y sube la captura de tu voucher en el formulario.
          </p>

          <div className="space-y-3 pt-2">
            {/* Yape / Plin */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Yape / Plin
              </span>
              <p className="text-lg font-mono font-bold text-white tracking-wider">999 888 777</p>
              <p className="text-xs text-neutral-400 mt-0.5">Titular: Darwin Jackson (BarberOS)</p>
            </div>

            {/* BCP */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                BCP Soles
              </span>
              <p className="text-sm font-mono font-bold text-white">193-98765432-0-12</p>
              <p className="text-xs text-neutral-400 mt-0.5">CCI: 002-193009876543201211</p>
            </div>
          </div>
        </div>

        {/* Formulario de Envío (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6">
          <h3 className="font-bold text-white text-base mb-1">Enviar Comprobante de Pago</h3>
          <p className="text-xs text-neutral-400 mb-4">
            El súper administrador validará tu comprobante y extenderá tu suscripción de inmediato.
          </p>

          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                ¡Comprobante enviado con éxito! Ha entrado en la bandeja de revisión y será aprobado en breve.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitVoucher} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Plan Elegido
                </label>
                <select aria-label="select"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="STARTER">Starter (S/ 59)</option>
                  <option value="PRO">Pro (S/ 99)</option>
                  <option value="ENTERPRISE">Enterprise (S/ 179)</option>
                </select>
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Meses a Pagar
                </label>
                <select aria-label="select"
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>1 mes</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses (1 año)</option>
                </select>
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Medio de Pago
                </label>
                <select aria-label="select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="TRANSFER">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  URL o Enlace de la Captura / Voucher *
                </label>
                <input aria-label="input"
                  type="url"
                  required
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://imgur.com/... o enlace de imagen"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Código de Operación (Opcional)
                </label>
                <input aria-label="input"
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Ej: 98124501"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Notas Adicionales
              </label>
              <input aria-label="input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Pagado desde la cuenta de Juan Pérez"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Total Display */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Total a liquidar ({months} mes/es):</span>
              <span className="text-xl font-extrabold text-amber-400">{formatPrice(amountToPay)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Enviar Comprobante para Aprobación</span>
            </button>
          </form>
        </div>
      </div>

      {/* Historial de Comprobantes Enviados */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6">
        <h3 className="font-bold text-white text-base mb-4">Historial de Pagos Enviados</h3>

        {payments.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">
            Aún no has enviado ningún comprobante de pago.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="pb-3">Fecha de Envío</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Meses</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Comprobante</th>
                  <th className="pb-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {payments.map((p) => {
                  const dateStr = formatDateOnly(p.submitted_at)
                  const badge = paymentBadges[p.status] || paymentBadges.PENDING

                  return (
                    <tr key={p.id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                      <td className="py-3 font-medium text-white font-mono text-xs" suppressHydrationWarning>
                        {dateStr}
                      </td>
                      <td className="py-3 font-semibold text-amber-400">{p.plan_tier}</td>
                      <td className="py-3">{p.months_paid}</td>
                      <td className="py-3 font-bold text-white">{formatPrice(Number(p.amount))}</td>
                      <td className="py-3">{p.payment_method}</td>
                      <td className="py-3">
                        <a
                          href={p.voucher_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Ver Voucher</span>
                        </a>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
