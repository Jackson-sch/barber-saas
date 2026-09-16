import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, LayoutGrid, List } from 'lucide-react'

interface AgendaHeaderProps {
  formattedDateTitle: string
  selectedDate: string
  viewMode: 'CHAIRS' | 'LIST'
  onDateChange: (date: string) => void
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onViewModeChange: (mode: 'CHAIRS' | 'LIST') => void
  onNewAppointment: () => void
}

export default function AgendaHeader({
  formattedDateTitle,
  selectedDate,
  viewMode,
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
  onViewModeChange,
  onNewAppointment,
}: AgendaHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <CalendarIcon className="w-4 h-4" />
          <span>Control de Citas</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono normal-case tracking-normal ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>en vivo</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight capitalize mt-1">
          {formattedDateTitle}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Day Navigation */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={onPrevDay}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition cursor-pointer"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
          >
            Hoy
          </button>
          <button
            onClick={onNextDay}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-md transition cursor-pointer"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <input aria-label="input"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition cursor-pointer"
        />

        {/* Switch View */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('CHAIRS')}
            className={
              viewMode === 'CHAIRS'
                ? 'p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-black'
                : 'p-1.5 rounded-md transition cursor-pointer text-neutral-400 hover:text-white'
            }
            title="Vista por Silla / Barbero"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('LIST')}
            className={
              viewMode === 'LIST'
                ? 'p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-black'
                : 'p-1.5 rounded-md transition cursor-pointer text-neutral-400 hover:text-white'
            }
            title="Vista de Lista Cronológica"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNewAppointment}
          className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Cita</span>
        </button>
      </div>
    </div>
  )
}
