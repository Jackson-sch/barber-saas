import type { Metadata } from 'next'
import { requireTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { BookingWizard } from '@/components/booking/BookingWizard'
import InstallPwaBanner from '@/components/booking/InstallPwaBanner'
import {
  MapPin,
  Phone,
  AlertCircle,
  Clock,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Scissors,
  Navigation,
} from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
import { formatPersonName } from '@/lib/utils'
import Link from 'next/link'

interface BookingPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, logo_url, settings')
    .eq('slug', slug)
    .maybeSingle()

  const orgName = org?.name?.trim() || 'Barbería'
  const settings = (
    typeof org?.settings === 'object' && org?.settings !== null ? org.settings : {}
  ) as Record<string, any>
  const description =
    settings.tagline || `Reserva tu cita online en ${orgName} al instante.`
  const iconUrl =
    org?.logo_url &&
    org.logo_url.startsWith('https://res.cloudinary.com/') &&
    org.logo_url.includes('/image/upload/')
      ? org.logo_url.replace('/image/upload/', '/image/upload/w_192,h_192,c_fill,f_png/')
      : '/icons/icon-192.png'

  return {
    title: `${orgName} — Reservar Cita Online`,
    description,
    manifest: `/reservar/${slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: orgName,
    },
    icons: {
      icon: iconUrl,
      apple: iconUrl,
    },
  }
}

export default async function PublicBookingPage({ params }: BookingPageProps) {
  const { slug } = await params
  const org = await requireTenant(slug)

  if (!org.is_active) {
    return (
      <div className="min-h-screen bg-[#07080B] text-white flex flex-col justify-between items-center py-16 px-4 text-center selection:bg-amber-500 selection:text-black">
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

  const [{ data: services }, { data: barbers }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, description, price, duration_minutes')
      .eq('organization_id', org.id)
      .eq('is_active', true)
      .order('price', { ascending: true }),
    supabase
      .from('organization_members')
      .select('id, full_name, nickname, specialties')
      .eq('organization_id', org.id)
      .eq('is_active', true),
  ])

  const orgSettings = (org.settings as Record<string, any>) || {}
  const bannerUrl = orgSettings.banner_url || null
  const primaryColor = org.primary_color || '#F59E0B'
  const logoUrl = org.logo_url || null
  const openingTime = orgSettings.opening_time ? String(orgSettings.opening_time).slice(0, 5) : '09:00'
  const closingTime = orgSettings.closing_time ? String(orgSettings.closing_time).slice(0, 5) : '21:00'

  const waUrl = org.phone
    ? formatWhatsAppUrl(org.phone, `¡Hola ${org.name}! Tengo una consulta sobre los servicios y reservas.`)
    : null
  const mapsUrl = org.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${org.address} ${org.city || ''}`)}`
    : null

  const normalizedBarbers = (barbers || []).map((b) => ({
    ...b,
    full_name: formatPersonName(b.full_name) || b.full_name,
    nickname: b.nickname ? formatPersonName(b.nickname) : null,
  }))

  return (
    <div className="min-h-screen bg-[#07080B] text-neutral-100 flex flex-col relative selection:bg-amber-500 selection:text-black">
      {/* Subtle Ambient Glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[360px] rounded-full blur-[130px] pointer-events-none opacity-15"
        style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
      />

      {/* Sticky Minimal Header */}
      <header className="sticky top-0 z-40 bg-[#07080B]/90 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm overflow-hidden shrink-0"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={org.name} className="w-full h-full object-cover" />
              ) : (
                org.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-white tracking-tight block leading-tight truncate">
                {org.name}
              </span>
              <span className="text-[11px] text-emerald-400 inline-flex items-center gap-1.5 leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {openingTime} - {closingTime}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <InstallPwaBanner orgName={org.name} primaryColor={primaryColor} logoUrl={logoUrl} />

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Escribir por WhatsApp"
                title="WhatsApp"
                className="w-9 h-9 sm:w-auto sm:px-3 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/35 text-emerald-400 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}

            {org.phone && (
              <a
                href={`tel:${org.phone}`}
                aria-label="Llamar a la barbería"
                title={`Llamar al ${org.phone}`}
                className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/35 text-amber-400 inline-flex items-center justify-center transition"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content — Focused on Booking */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 pb-12 space-y-5 flex-1">
        {/* Compact Salon Identity Strip */}
        <section className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0D0E15] px-5 py-4 sm:px-6 sm:py-5">
          {bannerUrl && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35"
                style={{ backgroundImage: `url(${bannerUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/85 to-[#07080B]/55" />
            </>
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                Reserva en {org.name}
              </h1>
              {org.address && (
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {org.address}
                    {org.city ? `, ${org.city}` : ''}
                  </span>
                </p>
              )}
            </div>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-neutral-200 hover:text-amber-400 transition shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Cómo llegar</span>
              </a>
            )}
          </div>
        </section>

        {/* Primary Focus Grid: Booking Wizard (8 cols) + Compact Info (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Booking Wizard — Front & Center */}
          <div className="lg:col-span-8 w-full">
            <BookingWizard
              organization={{
                id: org.id,
                name: org.name,
                slug: org.slug,
                phone: org.phone,
                address: org.address,
                city: org.city,
                culqiSettings:
                  orgSettings.culqi_settings?.enabled && orgSettings.culqi_settings?.public_key
                    ? {
                        enabled: true,
                        public_key: orgSettings.culqi_settings.public_key,
                        environment: orgSettings.culqi_settings.environment || 'test',
                      }
                    : null,
                manualPaymentSettings:
                  orgSettings.manual_payment_settings?.enabled
                    ? {
                        enabled: true,
                        qrImageUrl: orgSettings.manual_payment_settings.qr_image_url || null,
                        paymentPhone:
                          orgSettings.manual_payment_settings.payment_phone || org.phone || null,
                        beneficiaryName:
                          orgSettings.manual_payment_settings.beneficiary_name || null,
                        walletType:
                          orgSettings.manual_payment_settings.wallet_type || 'Yape / Plin',
                        instructions:
                          orgSettings.manual_payment_settings.instructions || null,
                        requireVoucher:
                          orgSettings.manual_payment_settings.require_voucher || false,
                      }
                    : null,
                cloudinarySettings:
                  orgSettings.cloudinary_settings?.enabled &&
                  orgSettings.cloudinary_settings?.cloud_name &&
                  orgSettings.cloudinary_settings?.upload_preset
                    ? {
                        enabled: true,
                        cloud_name: orgSettings.cloudinary_settings.cloud_name,
                        upload_preset: orgSettings.cloudinary_settings.upload_preset,
                        folder: orgSettings.cloudinary_settings.folder || null,
                      }
                    : null,
              }}
              services={(services as any[]) || []}
              barbers={normalizedBarbers as any[]}
            />
          </div>

          {/* Compact Utility Sidebar */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
            {/* Datos clave del salón */}
            <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3.5">
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Información del Salón
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.06]">
                  <span className="text-neutral-400 inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Horario
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {openingTime} - {closingTime}
                  </span>
                </div>

                {org.phone && (
                  <div className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.06]">
                    <span className="text-neutral-400 inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      Teléfono
                    </span>
                    <a
                      href={`tel:${org.phone}`}
                      className="font-mono font-semibold text-white hover:text-amber-400 transition"
                    >
                      {org.phone}
                    </a>
                  </div>
                )}

                {org.address && (
                  <div className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.06]">
                    <span className="text-neutral-400 inline-flex items-center gap-1.5 shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Dirección
                    </span>
                    <div className="text-right min-w-0">
                      <span className="text-neutral-200 block">
                        {org.address}
                        {org.city ? `, ${org.city}` : ''}
                      </span>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Ver mapa</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-neutral-400 inline-flex items-center gap-1.5 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    Medios de pago
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium">
                      Yape
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
                      Plin
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 font-medium">
                      Efectivo
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 font-medium">
                      Tarjeta
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipo disponible (chips compactos) */}
            {normalizedBarbers.length > 0 && (
              <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    Especialistas
                  </h2>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {normalizedBarbers.length} activos
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {normalizedBarbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-white/[0.06]"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {barber.full_name.charAt(0)}
                      </span>
                      <span className="text-xs font-medium text-neutral-200">
                        {barber.nickname || barber.full_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 text-center text-[11px] text-neutral-500 py-5 border-t border-white/[0.06] max-w-6xl mx-auto w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          © {new Date().getFullYear()} {org.name}
        </span>
        <span>
          Reservas impulsadas por{' '}
          <Link href="/" className="text-amber-400 hover:underline font-semibold">
            BarberOS
          </Link>
        </span>
      </footer>
    </div>
  )
}
