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
  Copy,
  ExternalLink,
  Landmark,
  Smartphone,
} from 'lucide-react'
import { formatPrice, formatDateOnly } from '@/lib/utils'
import { submitSubscriptionPaymentAction } from '@/actions/subscription'
import type {
  Organization,
  OrganizationSubscription,
  SubscriptionPayment,
  PlatformSettings,
} from '@/types/database.types'

interface SubscriptionClientProps {
  org: Organization
  subscription: OrganizationSubscription | null
  payments: SubscriptionPayment[]
  platformSettings: PlatformSettings
  slug: string
}

function buildPlans(settings: PlatformSettings) {
  return [
    {
      id: 'STARTER',
      name: 'Plan Starter',
      price: Number(settings.starter_price ?? 59),
      description: 'Ideal para barberos independientes y estudios pequeños.',
      features: ['Hasta 3 barberos', 'Agenda & Calendario en vivo', 'Punto de Venta (POS)', 'Portal público de citas'],
    },
    {
      id: 'PRO',
      name: 'Plan Pro (Más Popular)',
      price: Number(settings.pro_price ?? 99),
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
      price: Number(settings.enterprise_price ?? 179),
      description: 'Para franquicias y cadenas con alto volumen de atención.',
      features: [
        'Barberos ilimitados',
        'Múltiples sedes',
        'Reportes financieros avanzados',
        'Soporte prioritario 24/7',
      ],
    },
  ]
}

export default function SubscriptionClient({
  org,
  subscription,
  payments,
  platformSettings,
  slug,
}: SubscriptionClientProps) {
  const PLANS = buildPlans(platformSettings)
  const [selectedPlan, setSelectedPlan] = useState('PRO')
  const [months, setMonths] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN' | 'TRANSFER'>('YAPE')
  const [voucherUrl, setVoucherUrl] = useState('')
  const [voucherFileName, setVoucherFileName] = useState('')
  const [referenceCode, setReferenceCode] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  function handleCopy(key: string, value: string) {
    if (!value) return
    navigator.clipboard?.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800)
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const maxDim = 1200
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(reader.result as string)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        }
        img.onerror = () => resolve(reader.result as string)
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleVoucherFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen del comprobante no debe superar los 8MB.')
      return
    }
    setError(null)
    try {
      const compressed = await compressImage(file)
      setVoucherUrl(compressed)
      setVoucherFileName(file.name)
    } catch {
      setError('No se pudo procesar la imagen del comprobante.')
    }
  }

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
      setVoucherFileName('')
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
    <div className="space-y-5 max-w-7xl">
      {/* Header + Bento Status Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-8 bg-gradient-to-br from-amber-500/10 via-[#0D0E15] to-[#0D0E15] border border-amber-500/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PLAN {currentPlan}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                  currentStatus === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : currentStatus === 'TRIAL'
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mi Suscripción & Pagos
            </h1>
            <p className="text-xs text-neutral-400" suppressHydrationWarning>
              {daysLeft > 0
                ? `Tu período actual vence el ${formatDateOnly(endDate)} (${org.name}).`
                : 'Tu prueba o suscripción ha concluido. Envía tu comprobante para reactivar.'}
            </p>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 shrink-0 bg-neutral-950/60 border border-white/[0.06] rounded-xl px-4 py-3">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold">
              Vigencia
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {daysLeft > 0 ? `${daysLeft}d` : '0d'}
            </span>
            <span className="text-[11px] text-amber-400 font-mono">/{org.slug}</span>
          </div>
        </div>

        {/* Resumen Rápido de Renovación */}
        <div className="xl:col-span-4 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Resumen de Renovación
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              {payments.length} {payments.length === 1 ? 'pago' : 'pagos'}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-y border-white/[0.06] py-2.5">
            <div>
              <p className="text-xs font-semibold text-white">{activePlanMeta.name}</p>
              <p className="text-[11px] text-neutral-400">
                {months} {months === 1 ? 'mes' : 'meses'} • {paymentMethod}
              </p>
            </div>
            <span className="text-2xl font-black text-amber-400 tabular-nums">
              {formatPrice(amountToPay)}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 leading-snug">
            Selecciona un plan abajo, realiza el abono en Yape/Plin o banco y adjunta tu voucher.
          </p>
        </div>
      </div>

      {/* Pricing Cards (Compact Bento Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const isCurrent = currentPlan === plan.id
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-2xl p-4 sm:p-5 border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#12141E] border-amber-500 ring-1 ring-amber-500/70 shadow-lg shadow-amber-500/10'
                  : 'bg-[#0D0E15] border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-white text-sm sm:text-base">{plan.name}</h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ACTUAL
                      </span>
                    )}
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                        TOP
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2">{plan.description}</p>

                <div className="my-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-xs text-neutral-400">/ mes</span>
                </div>

                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  {isSelected ? 'Plan Seleccionado' : 'Elegir este Plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Datos de Pago & Subida de Comprobante (Bento Row) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Cuentas Oficiales (4 cols) */}
        <div className="xl:col-span-4 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Cuentas Oficiales</h3>
                <p className="text-[11px] text-neutral-400">
                  Transfiere el monto exacto y adjunta tu captura.
                </p>
              </div>
            </div>

            {/* Yape / Plin */}
            {(platformSettings.yape_phone ||
              platformSettings.plin_phone ||
              platformSettings.yape_qr_url) && (
              <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    Yape / Plin
                  </span>
                  {platformSettings.yape_holder && (
                    <span className="text-[11px] text-neutral-400 truncate max-w-[160px]">
                      {platformSettings.yape_holder}
                    </span>
                  )}
                </div>

                {platformSettings.yape_qr_url && (
                  <div className="w-32 h-32 mx-auto bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={platformSettings.yape_qr_url}
                      alt="Código QR oficial de pago"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {platformSettings.yape_phone && (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[#0D0E15] border border-white/[0.06]">
                    <div className="min-w-0">
                      <span className="text-[10px] text-neutral-500 block">Yape</span>
                      <span className="text-sm font-mono font-bold text-white tracking-wide">
                        {platformSettings.yape_phone}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('yape', platformSettings.yape_phone || '')}
                      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-amber-400 transition cursor-pointer shrink-0"
                      title="Copiar número Yape"
                    >
                      {copiedKey === 'yape' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {platformSettings.plin_phone &&
                  platformSettings.plin_phone !== platformSettings.yape_phone && (
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[#0D0E15] border border-white/[0.06]">
                      <div className="min-w-0">
                        <span className="text-[10px] text-neutral-500 block">Plin</span>
                        <span className="text-sm font-mono font-bold text-cyan-300 tracking-wide">
                          {platformSettings.plin_phone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('plin', platformSettings.plin_phone || '')}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-amber-400 transition cursor-pointer shrink-0"
                        title="Copiar número Plin"
                      >
                        {copiedKey === 'plin' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* Cuenta Bancaria */}
            {platformSettings.bank_account && (
              <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" />
                    {platformSettings.bank_name || 'Cuenta Bancaria'}
                  </span>
                  {platformSettings.bank_holder && (
                    <span className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                      {platformSettings.bank_holder}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[#0D0E15] border border-white/[0.06]">
                  <div className="min-w-0">
                    <span className="text-[10px] text-neutral-500 block">Cuenta</span>
                    <span className="text-xs font-mono font-bold text-white truncate block">
                      {platformSettings.bank_account}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('bank', platformSettings.bank_account || '')}
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-amber-400 transition cursor-pointer shrink-0"
                    title="Copiar cuenta"
                  >
                    {copiedKey === 'bank' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {platformSettings.bank_cci && (
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[#0D0E15] border border-white/[0.06]">
                    <div className="min-w-0">
                      <span className="text-[10px] text-neutral-500 block">CCI</span>
                      <span className="text-xs font-mono text-neutral-300 truncate block">
                        {platformSettings.bank_cci}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('cci', platformSettings.bank_cci || '')}
                      className="p-1.5 rounded-lg hover:bg-white/[0.08] text-neutral-400 hover:text-amber-400 transition cursor-pointer shrink-0"
                      title="Copiar CCI"
                    >
                      {copiedKey === 'cci' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Envío (8 cols) */}
        <div className="xl:col-span-8 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Enviar Comprobante de Pago</h3>
                <p className="text-[11px] text-neutral-400">
                  Validaremos tu voucher y extenderemos tu suscripción de inmediato.
                </p>
              </div>
            </div>

            {success && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  ¡Comprobante enviado con éxito! Ha entrado en revisión y será aprobado en breve.
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form id="subscription-voucher-form" onSubmit={handleSubmitVoucher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="sub_plan_select"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Plan Elegido
                  </label>
                  <select
                    id="sub_plan_select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="STARTER">Starter ({formatPrice(PLANS[0].price)})</option>
                    <option value="PRO">Pro ({formatPrice(PLANS[1].price)})</option>
                    <option value="ENTERPRISE">Enterprise ({formatPrice(PLANS[2].price)})</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sub_months_select"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Duración
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMonths(m)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer tabular-nums ${
                          months === m
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-neutral-950 text-neutral-300 border-white/[0.08] hover:border-white/[0.2]'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sub_payment_method"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Medio de Pago
                  </label>
                  <select
                    id="sub_payment_method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'YAPE' | 'PLIN' | 'TRANSFER')}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="sub_voucher_url_input"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Captura / Voucher de Pago *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{voucherFileName ? 'Cambiar' : 'Subir'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVoucherFileUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        id="sub_voucher_url_input"
                        type="text"
                        value={
                          voucherUrl.startsWith('data:')
                            ? `[Imagen adjunta: ${voucherFileName}]`
                            : voucherUrl
                        }
                        onChange={(e) => {
                          setVoucherFileName('')
                          setVoucherUrl(e.target.value)
                        }}
                        placeholder="O pega enlace (https://...)"
                        className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {voucherUrl.startsWith('data:image') && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-emerald-500/30">
                        <img
                          src={voucherUrl}
                          alt="Vista previa voucher"
                          className="w-9 h-9 rounded-lg object-cover border border-white/[0.08]"
                        />
                        <span className="text-[11px] text-emerald-400 truncate flex-1 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{voucherFileName || 'Comprobante cargado'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setVoucherUrl('')
                            setVoucherFileName('')
                          }}
                          className="text-[11px] text-red-400 hover:underline px-1.5 cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sub_reference_code"
                    className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                  >
                    Código de Operación (Opcional)
                  </label>
                  <input
                    id="sub_reference_code"
                    type="text"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    placeholder="Ej: 98124501"
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sub_notes_input"
                  className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1"
                >
                  Notas Adicionales
                </label>
                <input
                  id="sub_notes_input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pagado desde la cuenta de Juan Pérez"
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.06]">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-neutral-400">
                    Total ({months} {months === 1 ? 'mes' : 'meses'}):
                  </span>
                  <span className="text-2xl font-black text-amber-400 tabular-nums">
                    {formatPrice(amountToPay)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Enviar Comprobante para Aprobación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Historial de Comprobantes Enviados */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Historial de Pagos Enviados
          </h3>
          <span className="text-[11px] text-neutral-500">{payments.length} registros</span>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center py-6">
            Aún no has enviado ningún comprobante de pago.
          </p>
        ) : (
          <>
            {/* Vista móvil en tarjetas */}
            <div className="space-y-3 md:hidden">
              {payments.map((p) => {
                const dateStr = formatDateOnly(p.submitted_at)
                const badge = paymentBadges[p.status] || paymentBadges.PENDING

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-neutral-950/90 border border-white/[0.06] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-amber-400 text-xs">{p.plan_tier}</span>
                        <span className="text-[11px] text-neutral-400 tabular-nums">
                          • {p.months_paid} {p.months_paid === 1 ? 'mes' : 'meses'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-black text-white text-sm tabular-nums">
                        {formatPrice(Number(p.amount))}
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]" suppressHydrationWarning>
                        {p.payment_method} • {dateStr}
                      </span>
                    </div>

                    {p.status === 'REJECTED' && p.rejection_reason && (
                      <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
                        {p.rejection_reason}
                      </p>
                    )}

                    <div className="pt-2 border-t border-white/[0.05] flex justify-end">
                      <a
                        href={p.voucher_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Ver Voucher</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Vista escritorio en tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="pb-2.5 pr-4 whitespace-nowrap">Fecha</th>
                    <th className="pb-2.5 px-3 whitespace-nowrap">Plan</th>
                    <th className="pb-2.5 px-3 whitespace-nowrap">Meses</th>
                    <th className="pb-2.5 px-3 whitespace-nowrap">Monto</th>
                    <th className="pb-2.5 px-3 whitespace-nowrap">Método</th>
                    <th className="pb-2.5 px-3 whitespace-nowrap">Comprobante</th>
                    <th className="pb-2.5 pl-3 whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {payments.map((p) => {
                    const dateStr = formatDateOnly(p.submitted_at)
                    const badge = paymentBadges[p.status] || paymentBadges.PENDING

                    return (
                      <tr key={p.id} className="text-neutral-300 hover:bg-white/[0.02] transition">
                        <td
                          className="py-2.5 pr-4 font-medium text-white font-mono text-xs whitespace-nowrap"
                          suppressHydrationWarning
                        >
                          {dateStr}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-amber-400 whitespace-nowrap">
                          {p.plan_tier}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums whitespace-nowrap">{p.months_paid}</td>
                        <td className="py-2.5 px-3 font-bold text-white tabular-nums whitespace-nowrap">
                          {formatPrice(Number(p.amount))}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{p.payment_method}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <a
                            href={p.voucher_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Ver Voucher</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-2.5 pl-3">
                          <div className="flex flex-col items-start gap-0.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            {p.status === 'REJECTED' && p.rejection_reason && (
                              <span className="text-[10px] text-red-400">{p.rejection_reason}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
