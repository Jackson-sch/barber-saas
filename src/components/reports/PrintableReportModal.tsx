'use client'

import { useRef } from 'react'
import { Printer, X, Download, ShieldCheck, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import type { ReportsData } from '@/actions/reports'

interface PrintableReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportsData: ReportsData
  slug: string
  startDate: string
  endDate: string
}

export default function PrintableReportModal({
  isOpen,
  onClose,
  reportsData,
  slug,
  startDate,
  endDate,
}: PrintableReportModalProps) {
  const printContentRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  function handlePrint() {
    window.print()
  }

  const { summary, paymentMethods, barberStats, topServices, topProducts } = reportsData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Container Box */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0d0e15] print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Vista Previa de Reporte Ejecutivo
              </h2>
              <p className="text-xs text-neutral-400">
                Diseñado para impresión física en A4 o descarga digital como PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-950/60 print:p-0 print:bg-white print:overflow-visible">
          {/* A4 Executive Sheet Container */}
          <div
            ref={printContentRef}
            id="printable-executive-report"
            className="w-full max-w-3xl mx-auto bg-white text-neutral-900 rounded-xl shadow-xl p-8 sm:p-10 print:p-0 print:shadow-none print:rounded-none print:max-w-none"
          >
            {/* 1. Header & Organization Meta */}
            <div className="border-b-2 border-neutral-900 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-neutral-900 text-amber-400 text-[11px] font-mono font-black uppercase tracking-wider">
                      Reporte Financiero Oficial
                    </span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
                    {slug.replace(/-/g, ' ')}
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Sistema de Gestión & Liquidación BarberSaaS
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-neutral-600 space-y-1">
                  <p>
                    <span className="font-semibold text-neutral-800">Período:</span>{' '}
                    {startDate} al {endDate}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Emisión:</span>{' '}
                    {new Date().toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    - {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Estado de Caja:</span> Auditado
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Executive Metrics Matrix */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                1. Resumen Ejecutivo de Desempeño
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">Facturación Bruta</p>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">
                    S/ {summary.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">Tickets Cobrados</p>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">
                    {summary.ticketCount}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">Ticket Promedio</p>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">
                    S/ {summary.averageTicket.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase font-medium">Margen Neto Salón</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">
                    S/ {summary.netShopProfit.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Sub-row for discounts, commissions, tips */}
              <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex justify-between items-center">
                  <span className="text-neutral-500">Descuentos:</span>
                  <span className="font-bold text-neutral-800">S/ {summary.totalDiscounts.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex justify-between items-center">
                  <span className="text-neutral-500">Propinas:</span>
                  <span className="font-bold text-neutral-800">S/ {summary.totalTips.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex justify-between items-center">
                  <span className="text-neutral-500">Comisiones Totales:</span>
                  <span className="font-bold text-amber-700">S/ {summary.totalCommissionsEarned.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 3. Desglose por Métodos de Pago */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                2. Distribución de Ingresos por Método de Pago
              </h3>
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3">Método de Pago</th>
                    <th className="py-2 px-3 text-right">Monto Total</th>
                    <th className="py-2 px-3 text-center">N° Operaciones</th>
                    <th className="py-2 px-3 text-right">Participación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paymentMethods.map((pm) => (
                    <tr key={pm.method} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-3 font-medium text-neutral-900">{pm.label}</td>
                      <td className="py-2 px-3 text-right font-bold text-neutral-900">
                        S/ {pm.total.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center text-neutral-600">{pm.count}</td>
                      <td className="py-2 px-3 text-right text-neutral-600">{pm.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Liquidación y Nómina de Barberos */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                3. Liquidación de Comisiones por Barbero
              </h3>
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3">Barbero</th>
                    <th className="py-2 px-2 text-center">Tasa</th>
                    <th className="py-2 px-2 text-center">Cortes</th>
                    <th className="py-2 px-2 text-center">Prods</th>
                    <th className="py-2 px-3 text-right">Ventas (S/)</th>
                    <th className="py-2 px-3 text-right">Ganado</th>
                    <th className="py-2 px-3 text-right">Pagado</th>
                    <th className="py-2 px-3 text-right">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {barberStats.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-3 text-center text-neutral-500">
                        Sin comisiones registradas en este período.
                      </td>
                    </tr>
                  ) : (
                    barberStats.map((b) => (
                      <tr key={b.barberId} className="hover:bg-neutral-50/50">
                        <td className="py-2 px-3 font-medium text-neutral-900">
                          {b.nickname ? `${b.barberName} (${b.nickname})` : b.barberName}
                        </td>
                        <td className="py-2 px-2 text-center text-neutral-600">{b.commissionRate}%</td>
                        <td className="py-2 px-2 text-center text-neutral-600">{b.servicesCount}</td>
                        <td className="py-2 px-2 text-center text-neutral-600">{b.productsCount}</td>
                        <td className="py-2 px-3 text-right text-neutral-700">
                          S/ {b.totalSalesGenerated.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-neutral-900">
                          S/ {b.totalCommissionsEarned.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700">
                          S/ {b.commissionsPaid.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-700">
                          S/ {b.commissionsPending.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {barberStats.length > 0 && (
                  <tfoot className="bg-neutral-100 font-bold border-t-2 border-neutral-300">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-neutral-800">
                        TOTALES
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-900">
                        S/ {barberStats.reduce((acc, b) => acc + b.totalSalesGenerated, 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-900">
                        S/ {summary.totalCommissionsEarned.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-800">
                        S/ {summary.totalCommissionsPaid.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-amber-800">
                        S/ {summary.totalCommissionsPending.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* 5. Tops: Servicios y Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  4. Top Servicios Atendidos
                </h3>
                <ul className="text-xs border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                  {topServices.slice(0, 5).map((s, idx) => (
                    <li key={s.id} className="py-2 px-3 flex justify-between items-center">
                      <span className="font-medium text-neutral-800">
                        {idx + 1}. {s.name} ({s.quantity} atenc.)
                      </span>
                      <span className="font-bold text-neutral-900">S/ {s.totalRevenue.toFixed(2)}</span>
                    </li>
                  ))}
                  {topServices.length === 0 && (
                    <li className="py-2 px-3 text-neutral-500 text-center">Sin servicios</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  5. Top Productos Vendidos
                </h3>
                <ul className="text-xs border border-neutral-200 rounded-lg divide-y divide-neutral-200">
                  {topProducts.slice(0, 5).map((p, idx) => (
                    <li key={p.id} className="py-2 px-3 flex justify-between items-center">
                      <span className="font-medium text-neutral-800">
                        {idx + 1}. {p.name} ({p.quantity} unid.)
                      </span>
                      <span className="font-bold text-neutral-900">S/ {p.totalRevenue.toFixed(2)}</span>
                    </li>
                  ))}
                  {topProducts.length === 0 && (
                    <li className="py-2 px-3 text-neutral-500 text-center">Sin productos</li>
                  )}
                </ul>
              </div>
            </div>

            {/* 6. Legal & Formal Signatures Block */}
            <div className="pt-6 border-t-2 border-neutral-200 mt-8 break-inside-avoid">
              <div className="grid grid-cols-2 gap-8 text-center text-xs text-neutral-600">
                <div>
                  <div className="border-t border-neutral-400 w-44 mx-auto mb-2 pt-1"></div>
                  <p className="font-bold text-neutral-800">Firma y Sello</p>
                  <p className="text-[10px] text-neutral-500">Administración / Dueño de Barbería</p>
                </div>

                <div>
                  <div className="border-t border-neutral-400 w-44 mx-auto mb-2 pt-1"></div>
                  <p className="font-bold text-neutral-800">Conformidad de Liquidación</p>
                  <p className="text-[10px] text-neutral-500">Representante de Barberos / Personal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-executive-report,
          #printable-executive-report * {
            visibility: visible !important;
          }
          #printable-executive-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  )
}
