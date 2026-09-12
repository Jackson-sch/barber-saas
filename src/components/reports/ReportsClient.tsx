'use client'

import { useState, useEffect, useCallback } from 'react'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import ReportsHeader, { type PeriodPreset, type ReportTab } from './ReportsHeader'
import ReportsMetricsCards from './ReportsMetricsCards'
import ReportsSalesTab from './ReportsSalesTab'
import ReportsCommissionsTab from './ReportsCommissionsTab'
import {
  getReportsDataAction,
  type ReportsData,
} from '@/actions/reports'

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

  // Exportar a CSV
  function handleExportCsv() {
    try {
      const rows: string[][] = []

      // 1. Título & Metadatos
      rows.push(['REPORTE FINANCIERO Y LIQUIDACIONES - ' + slug.toUpperCase()])
      rows.push(['Rango de Fechas', `${startDate} a ${endDate}`])
      rows.push(['Fecha de Descarga', new Date().toLocaleString('es-PE')])
      rows.push([])

      // 2. Resumen Ejecutivo
      rows.push(['--- RESUMEN EJECUTIVO ---'])
      rows.push(['Facturacion Total', `S/ ${reportsData.summary.totalRevenue.toFixed(2)}`])
      rows.push(['Numero de Tickets', reportsData.summary.ticketCount.toString()])
      rows.push(['Ticket Promedio', `S/ ${reportsData.summary.averageTicket.toFixed(2)}`])
      rows.push(['Descuentos Otorgados', `S/ ${reportsData.summary.totalDiscounts.toFixed(2)}`])
      rows.push(['Propinas Recaudadas', `S/ ${reportsData.summary.totalTips.toFixed(2)}`])
      rows.push(['Comisiones Totales', `S/ ${reportsData.summary.totalCommissionsEarned.toFixed(2)}`])
      rows.push(['Comisiones Pagadas', `S/ ${reportsData.summary.totalCommissionsPaid.toFixed(2)}`])
      rows.push(['Comisiones Pendientes', `S/ ${reportsData.summary.totalCommissionsPending.toFixed(2)}`])
      rows.push(['Margen Neto del Salon', `S/ ${reportsData.summary.netShopProfit.toFixed(2)}`])
      rows.push([])

      // 3. Métodos de Pago
      rows.push(['--- METODOS DE PAGO ---'])
      rows.push(['Metodo', 'Total (S/)', 'Transacciones', 'Porcentaje (%)'])
      for (const pm of reportsData.paymentMethods) {
        rows.push([pm.label, `S/ ${pm.total.toFixed(2)}`, pm.count.toString(), `${pm.percentage}%`])
      }
      rows.push([])

      // 4. Liquidación por Barbero
      rows.push(['--- LIQUIDACION DE COMISIONES POR BARBERO ---'])
      rows.push([
        'Barbero',
        'Comision Pactada',
        'Cortes Atendidos',
        'Productos Vendidos',
        'Ventas Generadas (S/)',
        'Comision Ganada (S/)',
        'Comision Pagada (S/)',
        'Saldo Pendiente (S/)',
      ])
      for (const b of reportsData.barberStats) {
        rows.push([
          b.nickname || b.barberName,
          `${b.commissionRate}%`,
          b.servicesCount.toString(),
          b.productsCount.toString(),
          `S/ ${b.totalSalesGenerated.toFixed(2)}`,
          `S/ ${b.totalCommissionsEarned.toFixed(2)}`,
          `S/ ${b.commissionsPaid.toFixed(2)}`,
          `S/ ${b.commissionsPending.toFixed(2)}`,
        ])
      }
      rows.push([])

      // 5. Top Servicios
      rows.push(['--- TOP SERVICIOS ---'])
      rows.push(['Posicion', 'Servicio', 'Atenciones', 'Facturacion Total (S/)'])
      reportsData.topServices.forEach((s, idx) => {
        rows.push([`#${idx + 1}`, s.name, s.quantity.toString(), `S/ ${s.totalRevenue.toFixed(2)}`])
      })
      rows.push([])

      // 6. Top Productos
      rows.push(['--- TOP PRODUCTOS ---'])
      rows.push(['Posicion', 'Producto', 'Unidades Vendidas', 'Facturacion Total (S/)'])
      reportsData.topProducts.forEach((p, idx) => {
        rows.push([`#${idx + 1}`, p.name, p.quantity.toString(), `S/ ${p.totalRevenue.toFixed(2)}`])
      })

      // Convertir a formato CSV con escape de comillas
      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `reporte-financiero-${slug}-${startDate}-a-${endDate}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addToast('success', 'Reporte CSV descargado con éxito.')
    } catch {
      addToast('error', 'Error al exportar los datos a CSV.')
    }
  }

  const pendingCount = reportsData.barberStats.filter((b) => b.commissionsPending > 0).length

  return (
    <div className="space-y-8">
      {/* 1. Header & Filtros */}
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
        onRefresh={() => fetchReports(startDate, endDate)}
        onExportCsv={handleExportCsv}
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

      {/* Feedback Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
