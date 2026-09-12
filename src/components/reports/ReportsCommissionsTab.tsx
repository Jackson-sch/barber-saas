'use client'

import { useState } from 'react'
import {
  UserCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  Scissors,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { settleBarberCommissionsAction, type BarberCommissionStat } from '@/actions/reports'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface ReportsCommissionsTabProps {
  barberStats: BarberCommissionStat[]
  organizationId: string
  slug: string
  onSettled: () => void
  onAddToast: (type: 'success' | 'error', text: string) => void
}

export default function ReportsCommissionsTab({
  barberStats,
  organizationId,
  slug,
  onSettled,
  onAddToast,
}: ReportsCommissionsTabProps) {
  const [selectedBarber, setSelectedBarber] = useState<BarberCommissionStat | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalPendingAll = barberStats.reduce((acc, b) => acc + b.commissionsPending, 0)
  const totalPaidAll = barberStats.reduce((acc, b) => acc + b.commissionsPaid, 0)

  async function handleConfirmSettle() {
    if (!selectedBarber) return
    setIsProcessing(true)

    const res = await settleBarberCommissionsAction({
      organization_id: organizationId,
      barber_id: selectedBarber.barberId,
      commission_ids: selectedBarber.pendingIds,
      slug,
    })

    setIsProcessing(false)
    if (res?.error) {
      onAddToast('error', res.error)
    } else {
      onAddToast(
        'success',
        `Se liquidaron con éxito ${formatPrice(selectedBarber.commissionsPending)} a favor de ${
          selectedBarber.barberName
        }.`
      )
      setSelectedBarber(null)
      onSettled()
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Nómina y Comisiones */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0D0E15] to-[#0A0B10] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Resumen de Liquidaciones de Especialistas
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Control de Comisiones del Salón
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Comisiones generadas por atención de servicios y venta de productos en el período seleccionado.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-mono text-neutral-400 block">Total Pagado</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              {formatPrice(totalPaidAll)}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-right">
            <span className="text-[11px] font-mono text-neutral-400 block">Saldo por Liquidar</span>
            <span
              className={`text-lg font-mono font-extrabold ${
                totalPendingAll > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {formatPrice(totalPendingAll)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Barberos */}
      {barberStats.length === 0 ? (
        <div className="py-14 text-center border border-dashed border-white/10 rounded-2xl">
          <UserCheck className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-300 font-medium">No hay miembros registrados</p>
          <p className="text-xs text-neutral-500 mt-1">
            Registra a tus colaboradores en la sección Barberos para calcular comisiones automáticas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barberStats.map((barber) => {
            const hasPending = barber.commissionsPending > 0
            const initials = barber.barberName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)

            return (
              <div
                key={barber.barberId}
                className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition group space-y-4"
              >
                <div>
                  {/* Barber Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {barber.avatarUrl ? (
                          <img
                            src={barber.avatarUrl}
                            alt={barber.barberName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">
                          {barber.nickname || barber.barberName}
                        </h4>
                        <span className="text-[11px] text-neutral-400 block truncate">
                          {barber.barberName}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-amber-400 shrink-0">
                      {barber.commissionRate}% pactado
                    </span>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.05]">
                      <span className="text-[10px] text-neutral-400 block">Cortes & Servicios</span>
                      <span className="font-bold text-white text-sm">
                        {barber.servicesCount}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.05]">
                      <span className="text-[10px] text-neutral-400 block">Productos Vendidos</span>
                      <span className="font-bold text-white text-sm">
                        {barber.productsCount}
                      </span>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="p-3 rounded-xl bg-[#090A0E] border border-white/[0.05] mt-2.5 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-neutral-400">
                      <span>Ventas Generadas:</span>
                      <span className="text-white font-semibold">
                        {formatPrice(barber.totalSalesGenerated)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Total Ganado:</span>
                      <span className="text-white font-semibold">
                        {formatPrice(barber.totalCommissionsEarned)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-400 pt-1.5 border-t border-white/[0.05]">
                      <span>Comisiones Pagadas:</span>
                      <span className="text-emerald-400 font-semibold">
                        {formatPrice(barber.commissionsPaid)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1.5 border-t border-white/[0.08]">
                      <span className="font-bold text-white text-[11px]">SALDO PENDIENTE:</span>
                      <span
                        className={`text-base font-extrabold ${
                          hasPending ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatPrice(barber.commissionsPending)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settle Action Button */}
                <div>
                  <button
                    type="button"
                    disabled={!hasPending}
                    onClick={() => setSelectedBarber(barber)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      hasPending
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                        : 'bg-white/[0.05] text-neutral-500 border border-white/5 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {hasPending ? (
                      <>
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Liquidar {formatPrice(barber.commissionsPending)}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Comisiones al Día</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Settle Modal */}
      {selectedBarber && (
        <ConfirmModal
          isOpen={!!selectedBarber}
          onClose={() => setSelectedBarber(null)}
          onConfirm={handleConfirmSettle}
          loading={isProcessing}
          title={`Liquidar Comisiones a ${selectedBarber.nickname || selectedBarber.barberName}`}
          description={`¿Confirmas que has realizado el pago de ${formatPrice(
            selectedBarber.commissionsPending
          )} a favor de este barbero? Sus ${
            selectedBarber.pendingIds.length
          } comisiones pendientes se marcarán como pagadas y quedarán registradas en el historial contable.`}
          confirmText={`Sí, Confirmar Pago (${formatPrice(selectedBarber.commissionsPending)})`}
          variant="primary"
        />
      )}
    </div>
  )
}
