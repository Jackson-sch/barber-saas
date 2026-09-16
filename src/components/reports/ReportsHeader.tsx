'use client'

import { useState } from 'react'
import {
  Calendar,
  Download,
  RefreshCw,
  Layers,
  DollarSign,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  Receipt,
  Wallet,
} from 'lucide-react'

export type PeriodPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'LAST30' | 'CUSTOM'
export type ReportTab = 'SALES' | 'COMMISSIONS'

interface ReportsHeaderProps {
  activeTab: ReportTab
  setActiveTab: (tab: ReportTab) => void
  preset: PeriodPreset
  setPreset: (preset: PeriodPreset) => void
  startDate: string
  setStartDate: (d: string) => void
  endDate: string
  setEndDate: (d: string) => void
  loading: boolean
  exportingType: string | null
  onRefresh: () => void
  onOpenPrintModal: () => void
  onExportSalesCsv: () => void
  onExportCommissionsCsv: () => void
  onExportCashCsv: () => void
  onExportConsolidatedCsv: () => void
  pendingCommissionsCount: number
}

export default function ReportsHeader({
  activeTab,
  setActiveTab,
  preset,
  setPreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  loading,
  exportingType,
  onRefresh,
  onOpenPrintModal,
  onExportSalesCsv,
  onExportCommissionsCsv,
  onExportCashCsv,
  onExportConsolidatedCsv,
  pendingCommissionsCount,
}: ReportsHeaderProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)

  return (
    <div className="space-y-4 pb-6 border-b border-white/[0.08]">
      {/* Title & Actions Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              Finanzas & Nómina
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reportes & Analítica Financiera
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Monitorea el flujo de caja, balance por métodos de pago y liquidación de comisiones a barberos.
          </p>
        </div>

        {/* Action buttons: Refresh and Export Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap relative">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Actualizar</span>
          </button>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={loading || !!exportingType}
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingType ? `Generando ${exportingType}...` : 'Exportar Reportes'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1017] border border-white/10 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-white/[0.06]">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80">
                      Formatos Disponibles
                    </p>
                  </div>

                  {/* PDF Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false)
                      onOpenPrintModal()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Printer className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Reporte Ejecutivo PDF</p>
                      <p className="text-[10px] text-neutral-400">Vista formal A4 con membrete y firmas</p>
                    </div>
                  </button>

                  <div className="my-1 border-t border-white/[0.06]" />

                  {/* CSV Ventas */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false)
                      onExportSalesCsv()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Receipt className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Ventas Detalladas (.CSV)</p>
                      <p className="text-[10px] text-neutral-400">Ticket por ticket, clientes e ítems</p>
                    </div>
                  </button>

                  {/* CSV Barberos */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false)
                      onExportCommissionsCsv()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Liquidación de Barberos (.CSV)</p>
                      <p className="text-[10px] text-neutral-400">Comisiones ganadas, pagadas y saldo</p>
                    </div>
                  </button>

                  {/* CSV Caja y Gastos */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false)
                      onExportCashCsv()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                      <Wallet className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Caja & Egresos (.CSV)</p>
                      <p className="text-[10px] text-neutral-400">Gastos menores y retiros detallados</p>
                    </div>
                  </button>

                  {/* CSV Consolidado */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExportMenuOpen(false)
                      onExportConsolidatedCsv()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">Consolidado General (.CSV)</p>
                      <p className="text-[10px] text-neutral-400">Resumen completo con tops y métodos</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Ventas vs Comisiones) & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('SALES')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'SALES'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ventas & Analítica</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMMISSIONS')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'COMMISSIONS'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Liquidación de Barberos</span>
            {pendingCommissionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                {pendingCommissionsCount}
              </span>
            )}
          </button>
        </div>

        {/* Date Presets */}
        <div className="flex items-center gap-1 bg-[#090A0E] p-1 rounded-xl border border-white/[0.08] text-xs overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'TODAY', label: 'Hoy' },
              { id: 'WEEK', label: 'Semana' },
              { id: 'MONTH', label: 'Este Mes' },
              { id: 'LAST30', label: 'Últimos 30d' },
              { id: 'CUSTOM', label: 'Personalizado' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                preset === item.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers (Shown if CUSTOM) */}
      {preset === 'CUSTOM' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090A0E] border border-white/[0.08] text-xs animate-in fade-in duration-150">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400">Desde:</span>
            <input aria-label="input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <span className="text-neutral-400">Hasta:</span>
            <input aria-label="input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
