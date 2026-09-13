import { requireTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { Scissors, MapPin, Phone, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface BookingPageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicBookingPage({ params }: BookingPageProps) {
  const { slug } = await params
  const org = await requireTenant(slug)

  // Si la barbería está suspendida o inactiva
  if (!org.is_active) {
    return (
      <div className="min-h-screen bg-[#090A0E] text-white flex flex-col justify-between items-center py-16 px-4 text-center selection:bg-amber-500 selection:text-black">
        <div className="max-w-md my-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{org.name}</h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            El portal de reservas online de esta barbería se encuentra temporalmente en pausa. Por favor, comunícate directamente con el establecimiento.
          </p>
          {org.phone && (
            <div className="pt-2">
              <a
                href={`tel:${org.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-amber-400 hover:text-amber-300 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Llamar al {org.phone}</span>
              </a>
            </div>
          )}
        </div>

        <footer className="text-xs text-neutral-600">
          BarberOS • Software de Gestión para Barberías
        </footer>
      </div>
    )
  }

  const supabase = await createClient()

  // 1. Obtener servicios activos
  const { data: services } = await supabase
    .from('services')
    .select('id, name, description, price, duration_minutes')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('price', { ascending: true })

  // 2. Obtener barberos activos
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('id, full_name, nickname, specialties')
    .eq('organization_id', org.id)
    .eq('is_active', true)

  const orgSettings = (org.settings as Record<string, any>) || {}
  const bannerUrl = orgSettings.banner_url || null
  const tagline = orgSettings.tagline || null
  const primaryColor = org.primary_color || '#F59E0B'
  const logoUrl = org.logo_url || null

  return (
    <div className="min-h-screen bg-[#090A0E] text-white flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Background atmospheric brand lights & cover */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {bannerUrl ? (
          <div
            className="absolute -top-10 left-0 right-0 h-96 bg-cover bg-center opacity-25 filter blur-xs"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        ) : null}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${primaryColor}35 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-40 right-10 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${primaryColor}25 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Header Barbería - Boutique Concierge */}
      <header className="relative z-10 max-w-xl mx-auto w-full text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-5 shadow-sm"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}35`,
            color: primaryColor,
          }}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Reserva Online Inmediata</span>
        </div>

        {/* Logo Salón */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border text-3xl mb-3 shadow-2xl shadow-black/80 relative group overflow-hidden"
          style={{
            borderColor: `${primaryColor}40`,
            backgroundColor: `${primaryColor}15`,
          }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={org.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-black" style={{ color: primaryColor }}>
              {org.name.charAt(0)}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {org.name}
        </h1>

        {tagline && (
          <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto mt-1 italic leading-relaxed">
            {tagline}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 mt-2.5 flex-wrap">
          {org.address && (
            <span className="flex items-center gap-1.5 bg-neutral-900/60 border border-white/5 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{org.address}{org.city ? `, ${org.city}` : ''}</span>
            </span>
          )}
          {org.phone && (
            <a
              href={`tel:${org.phone}`}
              className="flex items-center gap-1.5 bg-neutral-900/60 border border-white/5 px-2.5 py-1 rounded-md hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>{org.phone}</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Wizard */}
      <main className="relative z-10 w-full mb-12">
        <BookingWizard
          organization={{
            id: org.id,
            name: org.name,
            slug: org.slug,
            phone: org.phone,
            address: org.address,
            city: org.city,
          }}
          services={(services as any[]) || []}
          barbers={(barbers as any[]) || []}
        />
      </main>

      {/* Footer Powered By */}
      <footer className="relative z-10 text-center text-xs text-neutral-500 py-4 border-t border-white/[0.05] max-w-xl mx-auto w-full">
        <p className="flex items-center justify-center gap-1.5">
          <span>Potenciado por</span>
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 font-semibold tracking-wide transition inline-flex items-center gap-1"
          >
            <span>BarberOS</span>
          </Link>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-500">Gestión de Citas de Alta Gama</span>
        </p>
      </footer>
    </div>
  )
}
