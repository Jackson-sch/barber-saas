'use client'

import Link from 'next/link'
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Package,
  Users,
  Wallet,
  ArrowUpRight,
} from 'lucide-react'

interface DashboardSidebarWidgetsProps {
  slug: string
  copiedLink: boolean
  onCopyLink: () => void
}

export default function DashboardSidebarWidgets({
  slug,
  copiedLink,
  onCopyLink,
}: DashboardSidebarWidgetsProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Tarjeta Enlace Público con Copy Inmediato */}
      <div className="bg-gradient-to-br from-amber-500/10 via-[#0D0E15] to-[#0A0B10] border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
            Portal de Reservas 24/7
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-1">Tu Enlace de Citas Online</h3>
        <p className="text-xs text-neutral-400 mb-3.5 leading-relaxed">
          Comparte este enlace directo en la biografía de Instagram, TikTok o código QR en el mostrador.
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-neutral-300 font-mono truncate select-all">
            /reservar/{slug}
          </div>
          <button
            type="button"
            onClick={onCopyLink}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
            title="Copiar URL completa"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <Link
          href={`/reservar/${slug}`}
          target="_blank"
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/15"
        >
          <span>Abrir Portal de Cliente</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Atajos del Sistema */}
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-neutral-400">
          Accesos Directos del Sistema
        </h3>

        <div className="space-y-2">
          <Link
            href={`/app/${slug}/pos`}
            className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-amber-500/40 text-xs text-neutral-200 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-white">Terminal POS & Cobros</span>
                <span className="text-[10px] text-neutral-500">Cortes, productos y propinas</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition" />
          </Link>

          <Link
            href={`/app/${slug}/inventario`}
            className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Package className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-white">Control de Inventario</span>
                <span className="text-[10px] text-neutral-500">Stock físico y productos</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
          </Link>

          <Link
            href={`/app/${slug}/clientes`}
            className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-white">Fichas Técnicas de Clientes</span>
                <span className="text-[10px] text-neutral-500">Historial de cortes y preferencias</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
          </Link>

          <Link
            href={`/app/${slug}/caja`}
            className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/[0.06] hover:border-white/15 text-xs text-neutral-200 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold block text-white">Turnos de Caja & Arqueo</span>
                <span className="text-[10px] text-neutral-500">Aperturas, cierres y balances</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition" />
          </Link>
        </div>
      </div>
    </div>
  )
}
