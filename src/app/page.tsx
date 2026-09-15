import LandingHeader from '@/components/landing/LandingHeader'
import LandingHero from '@/components/landing/LandingHero'
import InteractiveProductDemo from '@/components/landing/InteractiveProductDemo'
import BentoFeatures from '@/components/landing/BentoFeatures'
import RoiCalculator from '@/components/landing/RoiCalculator'
import PricingSection from '@/components/landing/PricingSection'
import FaqSection from '@/components/landing/FaqSection'
import LandingFooter from '@/components/landing/LandingFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BarberOS — El Sistema Operativo Moderno para Barberías & Salones',
  description:
    'Plataforma integral para barberías y salones de alta gama. Agenda de sillas, recordatorios automáticos por WhatsApp, punto de venta con tickets térmicos, arqueo de caja y portal web de reservas.',
}

export default function LandingPage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#07080B] text-white font-sans selection:bg-amber-500 selection:text-black antialiased relative overflow-x-hidden"
    >
      {/* Background warm ambient glow lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-amber-600/[0.08] rounded-full blur-[160px]" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[180px]" />
        <div className="absolute top-[65%] -right-40 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[180px]" />
      </div>

      {/* 1. Header Navigation */}
      <LandingHeader />

      {/* 2. Hero Section */}
      <LandingHero />

      {/* 3. Interactive Live Product Demo Window */}
      <div className="px-4 sm:px-6">
        <InteractiveProductDemo />
      </div>

      {/* 4. Bento Grid Superpowers */}
      <BentoFeatures />

      {/* 5. Interactive ROI Calculator */}
      <RoiCalculator />

      {/* 6. Pricing Section */}
      <PricingSection />

      {/* 7. FAQ Accordion */}
      <FaqSection />

      {/* 8. Footer & Closing CTA */}
      <LandingFooter />
    </div>
  )
}
