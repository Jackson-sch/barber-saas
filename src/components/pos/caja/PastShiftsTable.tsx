import { History } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CashShift } from '@/types/database.types'

interface PastShiftsTableProps {
  shifts: CashShift[]
}

export default function PastShiftsTable({ shifts }: PastShiftsTableProps) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-amber-400" />
        <h3 className="font-semibold text-white text-sm">Historial de Turnos Cerrados</h3>
      </div>

      {shifts.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-6">No hay turnos anteriores registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="pb-3">Apertura</th>
                <th className="pb-3">Cierre</th>
                <th className="pb-3">Fondo Inicial</th>
                <th className="pb-3">Esperado</th>
                <th className="pb-3">Contado</th>
                <th className="pb-3">Diferencia</th>
                <th className="pb-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {shifts.map((sh) => {
                const openedDate = new Date(sh.opened_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const closedDate = sh.closed_at
                  ? new Date(sh.closed_at).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'
                const diff = Number(sh.difference || 0)

                return (
                  <tr key={sh.id} className="text-neutral-300 hover:bg-neutral-800/30 transition">
                    <td className="py-3 font-medium text-white">{openedDate}</td>
                    <td className="py-3">{closedDate}</td>
                    <td className="py-3">{formatPrice(Number(sh.initial_cash))}</td>
                    <td className="py-3">{formatPrice(Number(sh.expected_cash || 0))}</td>
                    <td className="py-3 font-semibold text-white">
                      {formatPrice(Number(sh.final_cash || 0))}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-semibold ${
                          diff === 0
                            ? 'text-emerald-400'
                            : diff > 0
                            ? 'text-blue-400'
                            : 'text-red-400'
                        }`}
                      >
                        {diff >= 0 ? `+${formatPrice(diff)}` : formatPrice(diff)}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-400 max-w-xs truncate">{sh.notes || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
