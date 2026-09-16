import { Plus } from 'lucide-react'

interface ClientsHeaderProps {
  onOpenCreate: () => void
}

export default function ClientsHeader({ onOpenCreate }: ClientsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Directorio de Clientes
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Fichas de estilo, preferencias de corte, fidelización e historial de visitas.
        </p>
      </div>

      <button
        onClick={onOpenCreate}
        className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Cliente</span>
      </button>
    </div>
  )
}
