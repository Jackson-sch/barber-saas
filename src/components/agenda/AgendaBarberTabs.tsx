import type { OrganizationMember } from '@/types/database.types'
import type { AppointmentWithDetails } from './AppointmentDetailModal'

interface AgendaBarberTabsProps {
  barbers: OrganizationMember[]
  initialAppointments: AppointmentWithDetails[]
  selectedBarberId: string
  onSelectBarber: (id: string) => void
}

export default function AgendaBarberTabs({
  barbers,
  initialAppointments,
  selectedBarberId,
  onSelectBarber,
}: AgendaBarberTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelectBarber('ALL')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
          selectedBarberId === 'ALL'
            ? 'bg-amber-500 text-black font-semibold'
            : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
        }`}
      >
        Todos los Barberos ({initialAppointments.length})
      </button>

      {barbers.map((b) => {
        const count = initialAppointments.filter((a) => a.barber_id === b.id).length
        return (
          <button
            key={b.id}
            onClick={() => onSelectBarber(b.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedBarberId === b.id
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {b.nickname || b.full_name} ({count})
          </button>
        )
      })}
    </div>
  )
}
