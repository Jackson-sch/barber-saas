import React from 'react'

interface BrandMarkProps {
  className?: string
  size?: number
}

/**
 * Emblema vectorial exclusivo de BarberOS:
 * Escudo arquitectónico octogonal en obsidiana con navaja/tijera geométrica en oro cepillado.
 */
export function BrandMark({ className = '', size = 40 }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="barberos_gold_main" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="barberos_gold_soft" x1="16" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="barberos_bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#141621" />
          <stop offset="100%" stopColor="#08090D" />
        </linearGradient>
      </defs>

      {/* Fondo obsidiana con borde sutil */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#barberos_bg)" />
      <rect
        x="2.75"
        y="2.75"
        width="58.5"
        height="58.5"
        rx="15.25"
        stroke="url(#barberos_gold_main)"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />

      {/* Marco octogonal interior */}
      <path
        d="M23 11H41L53 23V41L41 53H23L11 41V23L23 11Z"
        fill="url(#barberos_gold_soft)"
        stroke="url(#barberos_gold_main)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />

      {/* Emblema central: Hojas cruzadas de precisión + Corona/Diamante superior */}
      {/* Diamante superior */}
      <path d="M32 16L36 21L32 25L28 21L32 16Z" fill="url(#barberos_gold_main)" />

      {/* Hoja izquierda (tijera/navaja estilizada) */}
      <path
        d="M21 22L42 43C43.2 44.2 42.3 46.2 40.6 46.2C39.8 46.2 39 45.9 38.4 45.3L20.2 27.1C19 25.9 19.3 23.7 21 22Z"
        fill="url(#barberos_gold_main)"
      />
      {/* Hoja derecha (corte invertido con brillo) */}
      <path
        d="M43 22L22 43C20.8 44.2 21.7 46.2 23.4 46.2C24.2 46.2 25 45.9 25.6 45.3L43.8 27.1C45 25.9 44.7 23.7 43 22Z"
        fill="#FDE68A"
      />

      {/* Pivote central */}
      <circle cx="32" cy="33" r="2.6" fill="#0B0C11" stroke="url(#barberos_gold_main)" strokeWidth="1.6" />

      {/* Anillos inferiores geométricos */}
      <circle cx="22.5" cy="45.5" r="3.4" stroke="url(#barberos_gold_main)" strokeWidth="2" fill="#0B0C11" />
      <circle cx="41.5" cy="45.5" r="3.4" stroke="url(#barberos_gold_main)" strokeWidth="2" fill="#0B0C11" />
    </svg>
  )
}

interface BrandLogoProps {
  size?: number
  badge?: string
  subtitle?: string
  compact?: boolean
}

export function BrandLogo({
  size = 40,
  badge,
  subtitle,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-3 select-none group">
      <BrandMark
        size={size}
        className="shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_6px_18px_rgba(245,158,11,0.18)]"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight leading-none font-mono text-white ${
              compact ? 'text-base' : 'text-xl'
            }`}
          >
            Barber
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              OS
            </span>
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[9px] font-bold text-amber-300 font-mono uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400 font-semibold mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
