import {
  Users,
  Plus,
  Phone,
  MessageCircle,
  Sparkles,
  History,
  Award,
  Edit2,
  Trash2,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { ClientWithPreferences } from './ClientsClient'
import type { LoyaltyProgramSettings } from '@/types/database.types'

interface ClientsGridProps {
  filteredClients: ClientWithPreferences[]
  searchQuery: string
  loyaltyProgram: LoyaltyProgramSettings | null
  onOpenCreate: () => void
  onOpenEdit: (client: ClientWithPreferences) => void
  onOpenTechSheet: (client: ClientWithPreferences) => void
  onOpenLoyalty: (client: ClientWithPreferences) => void
  onOpenHistory: (client: ClientWithPreferences) => void
  onDeletePrompt: (client: ClientWithPreferences) => void
}

export default function ClientsGrid({
  filteredClients,
  searchQuery,
  loyaltyProgram,
  onOpenCreate,
  onOpenEdit,
  onOpenTechSheet,
  onOpenLoyalty,
  onOpenHistory,
  onDeletePrompt,
}: ClientsGridProps) {
  if (filteredClients.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
        <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">No se encontraron clientes</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          {searchQuery
            ? 'Prueba a cambiar tu búsqueda o verificar el número de teléfono.'
            : 'Registra a tus clientes habituales para guardar sus preferencias de corte y contactarlos por WhatsApp.'}
        </p>
        <button
          onClick={onOpenCreate}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Primer Cliente</span>
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredClients.map((client) => {
        const prefs = client.preferences
        const phoneClean = client.phone?.replace(/\D/g, '') || ''
        const waUrl = phoneClean ? `https://wa.me/51${phoneClean}` : null

        return (
          <div
            key={client.id}
            className="bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-5 transition flex flex-col justify-between"
          >
            <div>
              {/* Top: Avatar & Name */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {client.full_name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                    title="Abrir WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Visit Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-800/60 text-xs">
                <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    Visitas
                  </span>
                  <span className="font-bold text-white mt-0.5 block">
                    {client.total_visits || 0} visitas
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    Gasto Total
                  </span>
                  <span className="font-bold text-amber-400 mt-0.5 block">
                    {formatPrice(Number(client.total_spent || 0))}
                  </span>
                </div>
              </div>

              {/* Loyalty Progress Mini-Card */}
              {loyaltyProgram?.enabled && (() => {
                const isPoints = loyaltyProgram.program_type === 'POINTS'
                const target = isPoints ? loyaltyProgram.target_points : loyaltyProgram.target_visits
                const points = client.loyalty_points || 0
                const isReady = points >= target
                const pct = Math.min(100, Math.round((points / target) * 100))

                return (
                  <div
                    onClick={() => onOpenLoyalty(client)}
                    className={`mt-3 p-2.5 rounded-xl border transition cursor-pointer ${
                      isReady
                        ? 'bg-amber-500/15 border-amber-500/40 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                        : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                    }`}
                    title="Ver tarjeta digital de fidelidad"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{isPoints ? 'Puntos de Consumo' : 'Sellos de Fidelidad'}</span>
                      </span>
                      <span
                        className={`font-bold font-mono px-1.5 py-0.2 rounded text-[10px] ${
                          isReady
                            ? 'bg-amber-400 text-black animate-pulse'
                            : 'text-neutral-300 bg-neutral-900 border border-neutral-800'
                        }`}
                      >
                        {isReady ? '🏆 ¡Premio Listo!' : `${points} / ${target}`}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })()}

              {/* Technical Sheet Preview Tags */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                  Ficha de Estilo:
                </span>
                <div className="flex flex-wrap gap-1">
                  {prefs?.hair_fade_type ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                      {prefs.hair_fade_type}
                    </span>
                  ) : null}
                  {prefs?.hair_guard_number ? (
                    <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]">
                      Peine: {prefs.hair_guard_number}
                    </span>
                  ) : null}
                  {prefs?.beard_style ? (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                      {prefs.beard_style}
                    </span>
                  ) : null}
                  {!prefs?.hair_fade_type && !prefs?.hair_guard_number && !prefs?.beard_style && (
                    <span className="text-[11px] text-neutral-600 italic">
                      Sin preferencias registradas aún
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenTechSheet(client)}
                  className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenHistory(client)}
                  className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Ver historial de citas y servicios"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Historial</span>
                </button>

                {loyaltyProgram?.enabled && (
                  <button
                    type="button"
                    onClick={() => onOpenLoyalty(client)}
                    className="py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Ver tarjeta de fidelidad y movimientos"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fidelidad</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpenEdit(client)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                  title="Editar datos"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePrompt(client)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/70 hover:text-red-300 transition cursor-pointer"
                  title="Eliminar cliente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
