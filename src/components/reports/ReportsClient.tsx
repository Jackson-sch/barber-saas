'use client'

import { useState, useEffect, useCallback } from 'react'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import ReportsHeader, { type PeriodPreset, type ReportTab } from './ReportsHeader'
import ReportsMetricsCards from './ReportsMetricsCards'
import ReportsSalesTab from './ReportsSalesTab'
import ReportsCommissionsTab from './ReportsCommissionsTab'
import PrintableReportModal from './PrintableReportModal'
import {
  getReportsDataAction,
  getDetailedSalesReportAction,
  getCashMovementsReportAction,
  type ReportsData,
} from '@/actions/reports'
import {
  exportDetailedSalesToCsv,
  exportBarberCommissionsToCsv,
  exportCashMovementsToCsv,
  exportConsolidatedReportToCsv,
} from '@/lib/export-utils'

interface ReportsClientProps {
  initialData: ReportsData
  organizationId: string
  slug: string
  initialStartDate: string
  initialEndDate: string
}

export default function ReportsClient({
  initialData,
  organizationId,
  slug,
  initialStartDate,
  initialEndDate,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('SALES')
  const [preset, setPreset] = useState<PeriodPreset>('MONTH')
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [reportsData, setReportsData] = useState<ReportsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [exportingType, setExportingType] = useState<string | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Actualizar fechas según preset seleccionado
  const handlePresetChange = useCallback((newPreset: PeriodPreset) => {
    setPreset(newPreset)
    const now = new Date()

    if (newPreset === 'TODAY') {
      const todayStr = now.toISOString().slice(0, 10)
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (newPreset === 'WEEK') {
      const d = new Date(now)
      const day = d.getDay() || 7 // 1 = lunes, 7 = domingo
      d.setDate(d.getDate() - day + 1) // Lunes de esta semana
      const startStr = d.toISOString().slice(0, 10)
      const endStr = now.toISOString().slice(0, 10)
      setStartDate(startStr)
      setEndDate(endStr)
    } else if (newPreset === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startStr = startOfMonth.toISOString().slice(0, 10)
      const endStr = now.toISOString().slice(0, 10)
      setStartDate(startStr)
      setEndDate(endStr)
    } else if (newPreset === 'LAST30') {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      const startStr = d.toISOString().slice(0, 10)
      const endStr = now.toISOString().slice(0, 10)
      setStartDate(startStr)
      setEndDate(endStr)
    }
  }, [])

  // Cargar datos del servidor
  const fetchReports = useCallback(
    async (start: string, end: string) => {
      setLoading(true)
      const fullStart = `${start}T00:00:00.000Z`
      const fullEnd = `${end}T23:59:59.999Z`

      const res = await getReportsDataAction(organizationId, fullStart, fullEnd)
      setLoading(false)

      if (res?.error) {
        addToast('error', res.error)
      } else if (res?.data) {
        setReportsData(res.data)
      }
    },
    [organizationId]
  )

  // Disparar recarga cuando cambian las fechas
  useEffect(() => {
    fetchReports(startDate, endDate)
  }, [startDate, endDate, fetchReports])

  // 1. Exportar Ventas Detalladas
  async function handleExportSalesCsv() {
    try {
      setExportingType('Ventas')
      const fullStart = `${startDate}T00:00:00.000Z`
      const fullEnd = `${endDate}T23:59:59.999Z`
      const res = await getDetailedSalesReportAction(organizationId, fullStart, fullEnd)
      setExportingType(null)

      if (res.error || !res.data) {
        addToast('error', res.error || 'Error al obtener ventas para exportar.')
        return
      }

      exportDetailedSalesToCsv(res.data, slug, startDate, endDate)
      addToast('success', 'Reporte de ventas detalladas descargado.')
    } catch {
      setExportingType(null)
      addToast('error', 'Error inesperado al exportar ventas a CSV.')
    }
  }

  // 2. Exportar Comisiones de Barberos
  function handleExportCommissionsCsv() {
    try {
      exportBarberCommissionsToCsv(reportsData.barberStats, slug, startDate, endDate)
      addToast('success', 'Reporte de comisiones descargado.')
    } catch {
      addToast('error', 'Error al exportar comisiones.')
    }
  }

  // 3. Exportar Movimientos de Caja y Gastos
  async function handleExportCashCsv() {
    try {
      setExportingType('Caja')
      const fullStart = `${startDate}T00:00:00.000Z`
      const fullEnd = `${endDate}T23:59:59.999Z`
      const res = await getCashMovementsReportAction(organizationId, fullStart, fullEnd)
      setExportingType(null)

      if (res.error || !res.data) {
        addToast('error', res.error || 'Error al obtener movimientos de caja.')
        return
      }

      exportCashMovementsToCsv(res.data, slug, startDate, endDate)
      addToast('success', 'Reporte de movimientos de caja descargado.')
    } catch {
      setExportingType(null)
      addToast('error', 'Error al exportar movimientos de caja.')
    }
  }

  // 4. Exportar Consolidado General
  function handleExportConsolidatedCsv() {
    try {
      exportConsolidatedReportToCsv(reportsData, slug, startDate, endDate)
      addToast('success', 'Reporte financiero consolidado descargado.')
    } catch {
      addToast('error', 'Error al exportar reporte consolidado.')
    }
  }

  const pendingCount = reportsData.barberStats.filter((b) => b.commissionsPending > 0).length

  return (
    <div className="space-y-8">
      {/* 1. Header & Filtros con Menú de Exportación */}
      <ReportsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        preset={preset}
        setPreset={handlePresetChange}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        loading={loading}
        exportingType={exportingType}
        onRefresh={() => fetchReports(startDate, endDate)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onExportSalesCsv={handleExportSalesCsv}
        onExportCommissionsCsv={handleExportCommissionsCsv}
        onExportCashCsv={handleExportCashCsv}
        onExportConsolidatedCsv={handleExportConsolidatedCsv}
        pendingCommissionsCount={pendingCount}
      />

      {/* 2. Executive Metrics Matrix */}
      <ReportsMetricsCards
        totalRevenue={reportsData.summary.totalRevenue}
        ticketCount={reportsData.summary.ticketCount}
        averageTicket={reportsData.summary.averageTicket}
        totalDiscounts={reportsData.summary.totalDiscounts}
        totalTips={reportsData.summary.totalTips}
        totalCommissionsEarned={reportsData.summary.totalCommissionsEarned}
        totalCommissionsPaid={reportsData.summary.totalCommissionsPaid}
        totalCommissionsPending={reportsData.summary.totalCommissionsPending}
        netShopProfit={reportsData.summary.netShopProfit}
      />

      {/* 3. Contenido según pestaña activa */}
      {activeTab === 'SALES' ? (
        <ReportsSalesTab
          dailyTrend={reportsData.dailyTrend}
          paymentMethods={reportsData.paymentMethods}
          topServices={reportsData.topServices}
          topProducts={reportsData.topProducts}
          totalRevenue={reportsData.summary.totalRevenue}
        />
      ) : (
        <ReportsCommissionsTab
          barberStats={reportsData.barberStats}
          organizationId={organizationId}
          slug={slug}
          onSettled={() => fetchReports(startDate, endDate)}
          onAddToast={addToast}
        />
      )}

      {/* 4. Modal de Reporte Ejecutivo Imprimible / PDF */}
      <PrintableReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportsData={reportsData}
        slug={slug}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Feedback Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
