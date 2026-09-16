import { Calendar as CalendarIcon, CheckCircle2, Scissors } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface AgendaMetricsProps {
  totalBookings: number
  confirmedOrInProgress: number
  estimatedRevenue: number
}

export default function AgendaMetrics({
  totalBookings,
  confirmedOrInProgress,
  estimatedRevenue,
}: AgendaMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400">Total Programadas</span>
          <p className="text-xl font-bold text-white mt-0.5">{totalBookings}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <CalendarIcon className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400">Activas o Realizadas</span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{confirmedOrInProgress}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400">Proyección del Día</span>
          <p className="text-xl font-bold text-amber-400 mt-0.5">{formatPrice(estimatedRevenue)}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Scissors className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
