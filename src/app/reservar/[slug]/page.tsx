import { requireTenant } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import { BookingWizard } from '@/components/booking/BookingWizard'
import {
  Scissors,
  MapPin,
  Phone,
  AlertCircle,
  Star,
  Sparkles,
  Coffee,
  Clock,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Award,
  Flame,
  CalendarCheck,
  Wifi,
  Wind,
} from 'lucide-react'
import { formatWhatsAppUrl } from '@/lib/whatsapp'
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
  const bannerUrl = orgSettings.banner_url || '/images/barber-interior.jpg'
  const tagline = orgSettings.tagline || 'Cortes clásicos, perfilado de barba de autor y la mejor experiencia de cuidado masculino.'
  const primaryColor = org.primary_color || '#F59E0B'
  const logoUrl = org.logo_url || null

  const waUrl = org.phone
    ? formatWhatsAppUrl(org.phone, `¡Hola ${org.name}! Tengo una consulta sobre los servicios y reservas.`)
    : null
  const mapsUrl = org.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${org.address} ${org.city || ''}`)}`
    : null

  const perks = [
    { icon: Coffee, label: 'Café de Especialidad', desc: 'Espresso o bebida fría de cortesía' },
    { icon: Sparkles, label: 'Toalla Caliente', desc: 'Vapor aromatizado y ozonizado' },
    { icon: Scissors, label: 'Navaja & Precisión', desc: 'Instrumentos 100% esterilizados' },
    { icon: Wifi, label: 'Wi-Fi & Clima VIP', desc: 'Ambiente acústico y climatizado' },
  ]

  const reviews = [
    {
      name: 'Mateo R.',
      comment: 'La mejor experiencia de barbería. Llegué, me ofrecieron un café excelente y el corte superó mis expectativas.',
      rating: 5,
    },
    {
      name: 'Rodrigo S.',
      comment: 'Puntualidad total. Es la primera vez que una barbería respeta la hora exacta sin hacerme esperar.',
      rating: 5,
    },
    {
      name: 'Carlos V.',
      comment: 'El perfilado de barba con toalla caliente es adictivo. Excelente atención y ambiente de primer nivel.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col justify-between selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-10 right-0 w-[550px] h-[550px] rounded-full blur-[160px] opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#07080B]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-lg overflow-hidden shrink-0"
              style={{
                backgroundColor: `${primaryColor}20`,
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
            <div>
              <span className="text-sm font-bold text-white tracking-tight block leading-tight truncate max-w-[180px] sm:max-w-xs">
                {org.name}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block leading-tight">
                Portal de Reserva Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Abierto Hoy • 09:00 - 21:00
            </span>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-emerald-400 text-xs font-medium transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>
            )}

            {org.phone && (
              <a
                href={`tel:${org.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-amber-400 text-xs font-medium transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">{org.phone}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-6">

        {/* ======================================================== */}
        {/* BENTO HEADER: Hero Panorama (8 cols) + Stat Box (4 cols) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento Cell 1: Atmospheric Hero Panorama */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0D0E14] min-h-[250px] sm:min-h-[280px] flex flex-col justify-end p-6 sm:p-8">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bannerUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/80 to-[#07080B]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/60 to-transparent" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm border"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}50`,
                    color: primaryColor,
                  }}
                >
                  <Award className="w-3.5 h-3.5" />
                  Barbería Oficial Verificada
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Citas 100% Confirmadas
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {org.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 leading-relaxed max-w-xl font-normal drop-shadow-sm">
                {tagline}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-white/10 text-xs text-neutral-300">
                {org.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{org.address}{org.city ? `, ${org.city}` : ''}</span>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 ml-1 transition underline decoration-amber-400/50 underline-offset-2"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <a href={`tel:${org.phone}`} className="hover:text-white transition font-mono">
                      {org.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Quick Trust & Metrics Card */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Metric A: Calificación & Reseñas */}
            <div className="bg-[#0E0F16]/90 border border-white/10 hover:border-amber-500/30 rounded-3xl p-5 backdrop-blur-xl transition duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  Satisfacción
                </span>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  +240
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Clientes atendidos con cita online sin esperar colas
                </p>
              </div>
            </div>

            {/* Metric B: Garantía de Puntualidad */}
            <div className="bg-[#0E0F16]/90 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-5 backdrop-blur-xl transition duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                  Compromiso
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  <Clock className="w-3 h-3" />
                  0 Minutos Espera
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-white">Atención 100% Puntual</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tu sillón y barbero reservados en exclusiva a tu hora exacta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN SPLIT: Wizard (7 cols) + Bento Cards Grid (5 cols) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Right Bento Column: Salon Features, Team, Schedule, Payments */}
          <div className="lg:col-span-5 space-y-5 order-2 lg:order-1">
            {/* Bento Card: Experiencia VIP en Sala (2x2 mini grid) */}
            <div className="bg-[#0E0F16]/90 border border-white/10 hover:border-white/15 rounded-3xl p-5 backdrop-blur-xl shadow-xl transition">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Experiencia en el Salón
                  </h2>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Incluido
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {perks.map((p, idx) => {
                  const Icon = p.icon
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-amber-500/30 transition group flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-white/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                          {p.label}
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bento Card: Maestros del Estilo */}
            {barbers && barbers.length > 0 && (
              <div className="bg-[#0E0F16]/90 border border-white/10 hover:border-white/15 rounded-3xl p-5 backdrop-blur-xl shadow-xl transition">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Scissors className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Maestros Barbero
                    </h2>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {barbers.length} en turno
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="p-3 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shadow-inner shrink-0">
                          {barber.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-semibold text-white truncate">
                              {barber.full_name}
                            </h3>
                            {barber.nickname && (
                              <span className="text-[10px] text-amber-400 font-mono shrink-0">
                                &quot;{barber.nickname}&quot;
                              </span>
                            )}
                          </div>
                          {barber.specialties && barber.specialties.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {barber.specialties.slice(0, 2).map((spec: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[9px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Activo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bento Card: Horarios & Métodos de Pago en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Horarios */}
              <div className="bg-[#0E0F16]/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
                <div className="flex items-center gap-1.5 mb-2.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Horarios</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Lun - Sáb</span>
                    <span className="font-mono text-neutral-200 font-medium">9am - 9pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Domingos</span>
                    <span className="font-mono text-neutral-400">10am - 6pm</span>
                  </div>
                </div>
              </div>

              {/* Pagos */}
              <div className="bg-[#0E0F16]/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
                <div className="flex items-center gap-1.5 mb-2.5 text-amber-400">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Métodos de Pago</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium">
                    Yape
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-medium">
                    Plin
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-medium">
                    Efectivo
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-medium">
                    Tarjetas
                  </span>
                </div>
                <p className="text-[9px] text-neutral-500 mt-2">
                  Abonas directamente al terminar tu servicio.
                </p>
              </div>
            </div>

            {/* Bento Card: Preguntas Frecuentes Rápidas */}
            <div className="bg-[#0E0F16]/90 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-neutral-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Información Clave</span>
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5">
                  <h3 className="font-semibold text-amber-300 text-[11px]">¿Puedo cancelar o cambiar la hora?</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Sí, puedes reprogramar avisándonos hasta con 2 horas de anticipación sin penalidad.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5">
                  <h3 className="font-semibold text-amber-300 text-[11px]">¿Hay tiempo de tolerancia?</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Mantenemos tu turno reservado con 10 minutos de tolerancia para garantizar la fluidez.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left / Main Wizard Column (Sticky on Desktop) */}
          <div className="lg:col-span-7 lg:sticky lg:top-20 order-1 lg:order-2 w-full">
            {/* Subtle glow border wrapper */}
            <div className="relative group rounded-[28px] p-[1px] bg-gradient-to-b from-amber-500/35 via-white/10 to-transparent shadow-2xl">
              <div className="absolute -inset-1 bg-amber-500/10 rounded-3xl blur-xl pointer-events-none opacity-50" />
              <div className="relative">
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
                  }}
                  services={(services as any[]) || []}
                  barbers={(barbers as any[]) || []}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BENTO FOOTER: Client Testimonials (3 cols) */}
        {/* ======================================================== */}
        <div className="pt-8 border-t border-white/10">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
              Calidad Comprobada
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Lo que opinan nuestros clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="bg-[#0E0F16]/90 border border-white/10 hover:border-amber-500/20 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-300 italic leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-white">{rev.name}</span>
                  <span className="text-neutral-500 font-mono">Cliente Verificado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Powered By */}
      <footer className="relative z-10 text-center text-xs text-neutral-500 py-6 border-t border-white/[0.08] max-w-7xl mx-auto w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="flex items-center gap-1.5">
          <span>Salón oficial gestionado con</span>
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 font-semibold tracking-wide transition inline-flex items-center gap-1"
          >
            <span>BarberOS</span>
          </Link>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-neutral-500 hidden sm:inline">Tecnología para Barberías de Alto Rendimiento</span>
        </p>

        <p className="text-[11px] text-neutral-600">
          © {new Date().getFullYear()} {org.name}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
