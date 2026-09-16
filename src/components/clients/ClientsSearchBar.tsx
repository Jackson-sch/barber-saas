import { Search } from 'lucide-react'

interface ClientsSearchBarProps {
  filteredCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function ClientsSearchBar({
  filteredCount,
  searchQuery,
  onSearchChange,
}: ClientsSearchBarProps) {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex justify-between items-center">
      <span className="text-xs text-neutral-400 font-medium">
        Mostrando: <strong className="text-white">{filteredCount}</strong> clientes
      </span>

      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre o celular..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
        />
      </div>
    </div>
  )
}
