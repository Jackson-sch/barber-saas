'use client'

import Link from 'next/link'
import {
  TrendingUp,
  Calendar,
  Wallet,
  AlertTriangle,
  UserCheck,
  ArrowUpRight,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CashShift, Product } from '@/types/database.types'

export interface DashboardSaleSummary {
  total: number
  count: number
  cashTotal: number
  digitalTotal: number
  cardTotal: number
}

interface DashboardKpiCardsProps {
  salesSummary: DashboardSaleSummary
  averageTicket: number
  appointmentsCount: number
  completedAppointments: number
  pendingAppointments: number
  currentShift: CashShift | null
  criticalProducts: Product[]
  barbersCount: number
  clientsCount: number
  slug: string
}

export default function DashboardKpiCards({
  salesSummary,
  averageTicket,
  appointmentsCount,
  completedAppointments,
  pendingAppointments,
  currentShift,
  criticalProducts,
  barbersCount,
  clientsCount,
  slug,
}: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Facturación Hoy */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Ingresos de Hoy
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
            {formatPrice(salesSummary.total)}
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>
            {salesSummary.count} ticket{salesSummary.count !== 1 ? 's' : ''} emitido{salesSummary.count !== 1 ? 's' : ''}
          </span>
          <span className="text-neutral-300">Prom: {formatPrice(averageTicket)}</span>
        </div>
      </div>

      {/* KPI 2: Citas Agendadas Hoy */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Agenda de Hoy
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-tight">
            {appointmentsCount}
          </span>
          <span className="text-xs text-neutral-400 font-mono">turnos</span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span className="text-emerald-400">✓ {completedAppointments} listos</span>
          <span className="text-neutral-300">⏳ {pendingAppointments} pendientes</span>
        </div>
      </div>

      {/* KPI 3: Estado de Caja en Mostrador */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Caja del Turno
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              currentShift
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight ${
              currentShift ? 'text-white' : 'text-neutral-500'
            }`}
          >
            {currentShift ? formatPrice(salesSummary.cashTotal + Number(currentShift.initial_cash || 0)) : 'Cerrada'}
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
          {currentShift ? (
            <>
              <span className="text-emerald-400 font-medium">● Turno Activo</span>
              <Link
                href={`/app/${slug}/caja`}
                className="text-neutral-400 hover:text-white transition flex items-center gap-1"
              >
                <span>Arqueo</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
            <>
              <span className="text-red-400">Requiere apertura</span>
              <Link
                href={`/app/${slug}/pos`}
                className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
              >
                <span>Abrir caja</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI 4: Equipo & Alertas Operativas */}
      <div className="bg-[#0D0E15] border border-white/[0.08] hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
            {criticalProducts.length > 0 ? 'Alerta de Inventario' : 'Staff de Barberos'}
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              criticalProducts.length > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {criticalProducts.length > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="mt-3">
          {criticalProducts.length > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-tight">
                {criticalProducts.length}
              </span>
              <span className="text-xs text-neutral-400 font-mono">ítems críticos</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                {barbersCount}
              </span>
              <span className="text-xs text-neutral-400 font-mono">activos</span>
            </div>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          {criticalProducts.length > 0 ? (
            <>
              <span className="text-amber-400/90 truncate max-w-[130px]">
                {criticalProducts[0].name}
              </span>
              <Link
                href={`/app/${slug}/inventario`}
                className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
              >
                <span>Reponer</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
            <>
              <span>{clientsCount} clientes en CRM</span>
              <Link
                href={`/app/${slug}/barberos`}
                className="text-neutral-400 hover:text-white transition flex items-center gap-1"
              >
                <span>Equipo</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
