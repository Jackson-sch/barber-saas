import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import AgendaClient from '@/components/agenda/AgendaClient'
import { getLocalDateString, getDayUtcRange } from '@/lib/utils'
import type { OrganizationMember, Service } from '@/types/database.types'
import type { AppointmentWithDetails } from '@/components/agenda/AppointmentDetailModal'

interface AgendaPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function AgendaPage({ params, searchParams }: AgendaPageProps) {
  const { slug } = await params
  const { date: rawDate } = await searchParams
  const { org } = await getTenantAuthContext(slug)
  const supabase = await createClient()

  // Fecha seleccionada o Hoy en zona horaria local de la barbería (America/Lima)
  const todayStr = getLocalDateString(new Date(), 'America/Lima')
  const selectedDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayStr

  // Rango de inicio y fin del día en UTC correspondiente al día completo en America/Lima (UTC-5)
  const { startOfDay, endOfDay } = getDayUtcRange(selectedDate, '-05:00')

  // 1. Obtener Citas del día con relaciones
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients(full_name, phone, email, total_visits),
      barber:organization_members(full_name, nickname),
      service:services(name, duration_minutes, price)
    `)
    .eq('organization_id', org.id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  // 2. Obtener Barberos activos
  const { data: barbers } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // 3. Obtener Servicios activos
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  const orgSettings = (org.settings as Record<string, any>) || {}
  const whatsappTemplates = orgSettings.whatsapp_notifications || null

  return (
    <AgendaClient
      initialAppointments={(appointments || []) as unknown as AppointmentWithDetails[]}
      barbers={(barbers || []) as unknown as OrganizationMember[]}
      services={(services || []) as unknown as Service[]}
      organizationId={org.id}
      slug={slug}
      selectedDate={selectedDate}
      organizationName={org.name}
      organizationAddress={org.address}
      whatsappTemplates={whatsappTemplates}
    />
  )
}
