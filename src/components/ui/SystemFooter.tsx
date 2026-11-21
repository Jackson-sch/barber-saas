import { Coffee } from 'lucide-react'
import pkg from '../../../package.json'

interface SystemFooterProps {
  className?: string
}

/**
 * Footer institucional del sistema BarberOS.
 * Muestra la versión actual desde package.json, una frase corta cafetera y el crédito del creador.
 */
export function SystemFooter({ className = '' }: SystemFooterProps) {
  const year = new Date().getFullYear()
  const version = pkg.version || '0.1.0'

  return (
    <footer
      className={`border-t border-white/[0.06] bg-[#090A0E]/60 px-4 sm:px-6 md:px-8 py-4 relative z-10 ${className}`.trim()}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-neutral-500">
        {/* Marca & Versión */}
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-neutral-300">
            Barber<span className="text-amber-400">OS</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-[10px] text-neutral-400 tabular-nums">
            v{version}
          </span>
        </div>

        {/* Frase corta + Café */}
        <div className="inline-flex items-center gap-1.5 text-neutral-400">
          <Coffee className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
          <span>Forjado con código, precisión y buen café</span>
        </div>

        {/* Creador & Año */}
        <div className="flex items-center gap-1.5">
          <span>Creado por</span>
          <span className="font-semibold text-neutral-200 hover:text-amber-400 transition-colors">
            Jackson Sebastian
          </span>
          <span className="text-neutral-600">•</span>
          <span className="tabular-nums">© {year}</span>
        </div>
      </div>
    </footer>
  )
}
