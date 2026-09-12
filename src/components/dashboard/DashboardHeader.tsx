'use client'

import Link from 'next/link'
import { Calendar, CreditCard, Share2, Check } from 'lucide-react'

interface DashboardHeaderProps {
  orgName: string
  planTier?: string
  slug: string
  currentTime: string
  currentDateStr: string
  copiedLink: boolean
  onCopyLink: () => void
}

export default function DashboardHeader({
  orgName,
  planTier,
  slug,
  currentTime,
  currentDateStr,
  copiedLink,
  onCopyLink,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/[0.08]">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>SISTEMA EN VIVO</span>
          </div>

          {currentDateStr && (
            <span className="text-xs text-neutral-400 capitalize font-medium">
              {currentDateStr} •{' '}
              <strong className="font-mono text-neutral-200">{currentTime}</strong>
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-amber-400 font-bold uppercase">
            {planTier || 'PLAN PRO'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {orgName}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
          Monitor operativo de facturación, sillas de barberos y citas del día.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={onCopyLink}
          className="py-2.5 px-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-neutral-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
          title="Copiar enlace de reservas públicas"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Link Reservas</span>
            </>
          )}
        </button>

        <Link
          href={`/app/${slug}/agenda`}
          className="py-2.5 px-4 rounded-xl bg-[#12131A] border border-white/10 hover:bg-[#1A1D2B] text-neutral-200 text-xs font-semibold transition flex items-center gap-2 shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Ver Agenda</span>
        </Link>

        <Link
          href={`/app/${slug}/pos`}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Cobrar POS</span>
        </Link>
      </div>
    </div>
  )
}
