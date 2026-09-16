import { Users, Calendar, DollarSign } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ClientsMetricsProps {
  totalClients: number
  totalVisits: number
  totalSpent: number
}

export default function ClientsMetrics({
  totalClients,
  totalVisits,
  totalSpent,
}: ClientsMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400 font-medium">Clientes Totales</span>
          <p className="text-xl font-bold text-white mt-0.5">{totalClients}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Users className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400 font-medium">Visitas Acumuladas</span>
          <p className="text-xl font-bold text-amber-400 mt-0.5">{totalVisits}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs text-neutral-400 font-medium">Facturación Histórica</span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatPrice(totalSpent)}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
