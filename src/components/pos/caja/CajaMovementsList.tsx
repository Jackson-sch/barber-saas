import { Plus, User } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CashMovement } from '@/types/database.types'

interface CajaMovementsListProps {
  movements: CashMovement[]
  movementCategoryLabels: Record<string, string>
  barberMap: Map<string, string>
  onOpenMovementModal: () => void
}

export default function CajaMovementsList({
  movements,
  movementCategoryLabels,
  barberMap,
  onOpenMovementModal,
}: CajaMovementsListProps) {
  if (movements.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-neutral-800/60 rounded-xl space-y-2">
        <p className="text-xs text-neutral-500">No hay gastos ni salidas manuales de caja en este turno.</p>
        <button
          type="button"
          onClick={onOpenMovementModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          <span>Registrar Primer Gasto o Salida</span>
        </button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
      {movements.map((mov) => {
        const timeStr = new Date(mov.created_at).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        })
        const isExpense = mov.type === 'EXPENSE'
        const catLabel = movementCategoryLabels[mov.category] || mov.category
        const barberAssigned = mov.barber_id ? barberMap.get(mov.barber_id) : null

        return (
          <div key={mov.id} className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-neutral-500">{timeStr}</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                      isExpense
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}
                  >
                    {isExpense ? 'Egreso / Gasto' : 'Ingreso / Inyección'}
                  </span>
                  <span className="font-medium text-neutral-300">{catLabel}</span>
                </div>
                <p className="text-neutral-400 text-[11px]">{mov.description}</p>
                {barberAssigned && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                    <User className="w-3 h-3" />
                    <span>Barbero: {barberAssigned}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`font-bold font-mono text-sm block ${
                  isExpense ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                {isExpense ? '-' : '+'}
                {formatPrice(Number(mov.amount))}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
