// src/lib/export-utils.ts
import type {
  ReportsData,
  BarberCommissionStat,
  DetailedSaleRow,
  DetailedCashMovementRow,
} from '@/actions/reports'

/**
 * Descarga una matriz de filas como archivo CSV compatible con Excel, Google Sheets y Numbers
 * incluyendo el marcador UTF-8 BOM (\uFEFF) para visualización perfecta de tildes y caracteres especiales.
 */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return '""'
            const str = String(cell)
            return `"${str.replace(/"/g, '""')}"`
          })
          .join(',')
      )
      .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 1. Exporta el reporte de Ventas Detalladas ticket por ticket
 */
export function exportDetailedSalesToCsv(
  sales: DetailedSaleRow[],
  slug: string,
  startDate: string,
  endDate: string
): void {
  const rows: (string | number)[][] = [
    [`REPORTE DE VENTAS DETALLADAS - ${slug.toUpperCase()}`],
    ['Periodo Analizado', `${startDate} a ${endDate}`],
    ['Fecha de Emision', new Date().toLocaleString('es-PE')],
    ['Total de Transacciones', sales.length],
    [],
    [
      'Fecha / Hora',
      'ID Venta / Ticket',
      'Cliente',
      'Telefono',
      'Barbero Atendio',
      'Servicios y Productos',
      'Metodo de Pago',
      'Subtotal (S/)',
      'Descuento (S/)',
      'Propina (S/)',
      'Total Cobrado (S/)',
      'Notas / Observaciones',
    ],
  ]

  let totalRevenue = 0
  let totalDiscounts = 0
  let totalTips = 0

  for (const s of sales) {
    totalRevenue += s.total
    totalDiscounts += s.discount
    totalTips += s.tip

    const formattedDate = new Date(s.createdAt).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    rows.push([
      formattedDate,
      s.id.slice(0, 8).toUpperCase(),
      s.clientName,
      s.clientPhone,
      s.barberName,
      s.itemsSummary,
      s.paymentMethod,
      s.subtotal.toFixed(2),
      s.discount.toFixed(2),
      s.tip.toFixed(2),
      s.total.toFixed(2),
      s.notes || '-',
    ])
  }

  // Fila de Totales
  rows.push([])
  rows.push([
    'TOTALES GENERALES',
    '',
    '',
    '',
    '',
    '',
    '',
    (totalRevenue + totalDiscounts).toFixed(2),
    totalDiscounts.toFixed(2),
    totalTips.toFixed(2),
    totalRevenue.toFixed(2),
    '',
  ])

  downloadCsv(`ventas-detalladas-${slug}-${startDate}-a-${endDate}.csv`, rows)
}

/**
 * 2. Exporta el reporte de Liquidación de Barberos y Comisiones
 */
export function exportBarberCommissionsToCsv(
  barberStats: BarberCommissionStat[],
  slug: string,
  startDate: string,
  endDate: string
): void {
  const rows: (string | number)[][] = [
    [`LIQUIDACION DE COMISIONES Y NOMINA - ${slug.toUpperCase()}`],
    ['Periodo Analizado', `${startDate} a ${endDate}`],
    ['Fecha de Emision', new Date().toLocaleString('es-PE')],
    ['Total de Barberos Auditados', barberStats.length],
    [],
    [
      'Barbero / Miembro',
      'Comision Pactada (%)',
      'Cortes / Servicios Atendidos',
      'Productos Vendidos',
      'Facturacion Generada (S/)',
      'Comision Total Ganada (S/)',
      'Comision Pagada / Adelantos (S/)',
      'Saldo Pendiente por Liquidar (S/)',
      'Estado',
    ],
  ]

  let sumSales = 0
  let sumEarned = 0
  let sumPaid = 0
  let sumPending = 0

  for (const b of barberStats) {
    sumSales += b.totalSalesGenerated
    sumEarned += b.totalCommissionsEarned
    sumPaid += b.commissionsPaid
    sumPending += b.commissionsPending

    const status = b.commissionsPending <= 0 ? 'Al dia' : 'Pendiente de pago'

    rows.push([
      b.nickname ? `${b.barberName} ("${b.nickname}")` : b.barberName,
      `${b.commissionRate}%`,
      b.servicesCount,
      b.productsCount,
      b.totalSalesGenerated.toFixed(2),
      b.totalCommissionsEarned.toFixed(2),
      b.commissionsPaid.toFixed(2),
      b.commissionsPending.toFixed(2),
      status,
    ])
  }

  rows.push([])
  rows.push([
    'TOTALES',
    '',
    '',
    '',
    sumSales.toFixed(2),
    sumEarned.toFixed(2),
    sumPaid.toFixed(2),
    sumPending.toFixed(2),
    '',
  ])

  downloadCsv(`comisiones-barberos-${slug}-${startDate}-a-${endDate}.csv`, rows)
}

/**
 * 3. Exporta el reporte de Movimientos de Caja y Gastos
 */
export function exportCashMovementsToCsv(
  movements: DetailedCashMovementRow[],
  slug: string,
  startDate: string,
  endDate: string
): void {
  const rows: (string | number)[][] = [
    [`MOVIMIENTOS DE CAJA Y CONTROL DE GASTOS - ${slug.toUpperCase()}`],
    ['Periodo Analizado', `${startDate} a ${endDate}`],
    ['Fecha de Emision', new Date().toLocaleString('es-PE')],
    ['Total de Movimientos', movements.length],
    [],
    [
      'Fecha / Hora',
      'Tipo de Movimiento',
      'Categoria',
      'Descripcion / Motivo',
      'Barbero / Destinatario',
      'Registrado Por',
      'Monto (S/)',
    ],
  ]

  let totalExpenses = 0
  let totalIncomes = 0

  for (const m of movements) {
    if (m.type === 'EXPENSE') {
      totalExpenses += m.amount
    } else {
      totalIncomes += m.amount
    }

    const formattedDate = new Date(m.createdAt).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    const typeLabel = m.type === 'EXPENSE' ? 'EGRESO / GASTO' : 'INGRESO MANUAL'

    rows.push([
      formattedDate,
      typeLabel,
      m.category,
      m.description,
      m.barberName || '-',
      m.performedByName || 'Admin',
      (m.type === 'EXPENSE' ? -m.amount : m.amount).toFixed(2),
    ])
  }

  rows.push([])
  rows.push(['RESUMEN DE CAJA'])
  rows.push(['Total Ingresos Manuales', `S/ ${totalIncomes.toFixed(2)}`])
  rows.push(['Total Egresos / Gastos', `S/ -${totalExpenses.toFixed(2)}`])
  rows.push(['Flujo Neto de Movimientos', `S/ ${(totalIncomes - totalExpenses).toFixed(2)}`])

  downloadCsv(`movimientos-caja-${slug}-${startDate}-a-${endDate}.csv`, rows)
}

/**
 * 4. Exporta el reporte Consolidado General (Finanzas, Pagos, Barberos y Tops)
 */
export function exportConsolidatedReportToCsv(
  reportsData: ReportsData,
  slug: string,
  startDate: string,
  endDate: string
): void {
  const rows: (string | number)[][] = []

  // 1. Cabecera
  rows.push([`REPORTE FINANCIERO CONSOLIDADO - ${slug.toUpperCase()}`])
  rows.push(['Rango de Fechas', `${startDate} a ${endDate}`])
  rows.push(['Fecha de Emision', new Date().toLocaleString('es-PE')])
  rows.push([])

  // 2. Resumen Ejecutivo
  rows.push(['=== RESUMEN FINANCIERO EJECUTIVO ==='])
  rows.push(['Facturacion Total (S/)', reportsData.summary.totalRevenue.toFixed(2)])
  rows.push(['Numero de Tickets Cobrados', reportsData.summary.ticketCount])
  rows.push(['Ticket Promedio (S/)', reportsData.summary.averageTicket.toFixed(2)])
  rows.push(['Descuentos Totales Otorgados (S/)', reportsData.summary.totalDiscounts.toFixed(2)])
  rows.push(['Propinas Recaudadas (S/)', reportsData.summary.totalTips.toFixed(2)])
  rows.push(['Comisiones Totales Devengadas (S/)', reportsData.summary.totalCommissionsEarned.toFixed(2)])
  rows.push(['Comisiones Pagadas a Barberos (S/)', reportsData.summary.totalCommissionsPaid.toFixed(2)])
  rows.push(['Comisiones Pendientes por Pagar (S/)', reportsData.summary.totalCommissionsPending.toFixed(2)])
  rows.push(['Margen Neto del Salon (S/)', reportsData.summary.netShopProfit.toFixed(2)])
  rows.push([])

  // 3. Distribución por Métodos de Pago
  rows.push(['=== FACTURACION POR METODOS DE PAGO ==='])
  rows.push(['Metodo de Pago', 'Total Recaudado (S/)', 'Transacciones', 'Participacion (%)'])
  for (const pm of reportsData.paymentMethods) {
    rows.push([pm.label, pm.total.toFixed(2), pm.count, `${pm.percentage}%`])
  }
  rows.push([])

  // 4. Desempeño y Liquidación de Barberos
  rows.push(['=== LIQUIDACION Y RENDIMIENTO POR BARBERO ==='])
  rows.push([
    'Barbero',
    'Comision (%)',
    'Servicios Realizados',
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
      b.servicesCount,
      b.productsCount,
      b.totalSalesGenerated.toFixed(2),
      b.totalCommissionsEarned.toFixed(2),
      b.commissionsPaid.toFixed(2),
      b.commissionsPending.toFixed(2),
    ])
  }
  rows.push([])

  // 5. Ranking de Servicios
  rows.push(['=== SERVICIOS MAS DEMANDADOS ==='])
  rows.push(['Posicion', 'Servicio', 'Cortes / Atenciones', 'Facturacion Total (S/)'])
  reportsData.topServices.forEach((s, idx) => {
    rows.push([`#${idx + 1}`, s.name, s.quantity, s.totalRevenue.toFixed(2)])
  })
  rows.push([])

  // 6. Ranking de Productos
  rows.push(['=== PRODUCTOS MAS VENDIDOS ==='])
  rows.push(['Posicion', 'Producto', 'Unidades Despachadas', 'Facturacion Total (S/)'])
  reportsData.topProducts.forEach((p, idx) => {
    rows.push([`#${idx + 1}`, p.name, p.quantity, p.totalRevenue.toFixed(2)])
  })

  downloadCsv(`reporte-consolidado-${slug}-${startDate}-a-${endDate}.csv`, rows)
}
