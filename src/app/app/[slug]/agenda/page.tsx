import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import AgendaClient from '@/components/agenda/AgendaClient'
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

  // Fecha seleccionada o Hoy (formato YYYY-MM-DD)
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const selectedDate = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : `${yyyy}-${mm}-${dd}`

  // Rango de inicio y fin del día
  const startOfDay = `${selectedDate}T00:00:00.000Z`
  const endOfDay = `${selectedDate}T23:59:59.999Z`

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

  return (
    <AgendaClient
      initialAppointments={(appointments || []) as unknown as AppointmentWithDetails[]}
      barbers={(barbers || []) as unknown as OrganizationMember[]}
      services={(services || []) as unknown as Service[]}
      organizationId={org.id}
      slug={slug}
      selectedDate={selectedDate}
    />
  )
}
