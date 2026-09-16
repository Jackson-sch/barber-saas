'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(false)

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal para barberos independientes o estudios pequeños de hasta 3 sillas.',
      monthlyPrice: 59,
      annualPrice: 47,
      isPopular: false,
      features: [
        'Hasta 3 barberos activos',
        'Agenda interactiva de sillas en tiempo real',
        'Punto de Venta (POS) rápido',
        'Portal web de reservas para tu Instagram',
        'Fichas técnicas de estilo para clientes',
        'Cobro con Yape, Plin, Efectivo y Tarjeta',
      ],
      ctaText: 'Comenzar 14 Días Gratis',
      href: '/registro-barberia',
    },
    {
      name: 'Pro',
      badge: 'Más Popular',
      description: 'Para salones consolidados que necesitan control total de caja, comisiones y WhatsApp.',
      monthlyPrice: 99,
      annualPrice: 79,
      isPopular: true,
      features: [
        'Hasta 8 barberos activos',
        'Todo lo del plan Starter incluido',
        'Control de Caja Menor & Arqueos con gastos',
        'Impresión de Tickets Térmicos 80mm y 58mm',
        'Recordatorios automáticos por WhatsApp',
        'Liquidación de comisiones de barberos',
        'Programa de Fidelización (Sellos y Premios)',
        'Marca Blanca (Logo y colores corporativos)',
      ],
      ctaText: 'Probar Plan Pro Gratis',
      href: '/registro-barberia',
    },
    {
      name: 'Enterprise',
      description: 'Para barberías con alto volumen de atención, cadenas y franquicias multi-sede.',
      monthlyPrice: 179,
      annualPrice: 143,
      isPopular: false,
      features: [
        'Barberos y sillas ilimitadas',
        'Múltiples sucursales y sedes conectadas',
        'Todo lo del plan Pro incluido',
        'Exportación de reportes contables y ventas',
        'Integración avanzada con hardware POS',
        'Capacitación y onboarding dedicado para tu equipo',
        'Soporte técnico VIP prioritario 24/7 por WhatsApp',
      ],
      ctaText: 'Contactar para Enterprise',
      href: '/registro-barberia',
    },
  ]

  return (
    <section id="precios" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.06] scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Precios Transparentes</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Inversión clara, sin comisiones ocultas por corte.
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Comienza con 14 días de prueba gratis sin ingresar tarjeta de crédito. Paga y renueva fácilmente mediante Yape, Plin o transferencia bancaria.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-mono font-bold ${!annualBilling ? 'text-white' : 'text-neutral-500'}`}>
            Mensual
          </span>
          <button
            type="button"
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-13 h-7 rounded-full bg-[#181A24] border border-white/[0.1] p-1 transition cursor-pointer relative"
            aria-label="Alternar facturación anual"
          >
            <div
              className={`w-5 h-5 rounded-full bg-amber-500 shadow-md transition-transform duration-200 ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${annualBilling ? 'text-white' : 'text-neutral-500'}`}>
              Anual
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              Ahorra 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const price = annualBilling ? plan.annualPrice : plan.monthlyPrice

          return (
            <div
              key={plan.name}
              className={`p-7 rounded-3xl flex flex-col justify-between transition duration-300 relative ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-[#181B26] to-[#0E1017] border-2 border-amber-500 shadow-2xl shadow-amber-500/15 scale-[1.02]'
                  : 'bg-[#0E1017] border border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 font-mono">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="py-2 border-y border-white/[0.06]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-neutral-400 font-mono">S/</span>
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                      {price}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">/ mes</span>
                  </div>
                  {annualBilling && (
                    <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                      Facturado anualmente (S/ {price * 12} / año)
                    </span>
                  )}
                </div>

                <ul className="space-y-3 text-xs text-neutral-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.href}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-[0.99] ${
                    plan.isPopular
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center text-xs text-neutral-500 flex items-center justify-center gap-6 flex-wrap">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-neutral-400" />
          14 días de prueba con todas las funciones Pro
        </span>
        <span>•</span>
        <span>Sin contratos forzosos</span>
        <span>•</span>
        <span>Renovación manual con Yape o Plin</span>
      </div>
    </section>
  )
}
