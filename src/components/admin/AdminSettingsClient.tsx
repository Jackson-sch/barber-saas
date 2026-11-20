'use client'

import React, { useState } from 'react'
import {
  QrCode,
  Landmark,
  Sparkles,
  Headphones,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  Trash2,
  Smartphone,
  KeyRound,
  Wallet,
} from 'lucide-react'
import { updatePlatformSettingsAction } from '@/actions/platform'
import { compressImageToDataUrl } from '@/lib/cloudinary'
import AdminIntegrationsTab from './AdminIntegrationsTab'
import type { PlatformSettings } from '@/types/database.types'
import type { PlatformSecretsSafeView } from '@/lib/platform-secrets'

interface AdminSettingsClientProps {
  initialSettings: PlatformSettings
  initialSecrets: PlatformSecretsSafeView
}

export default function AdminSettingsClient({
  initialSettings,
  initialSecrets,
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'billing' | 'integrations'>('billing')
  const [platformName, setPlatformName] = useState(initialSettings.platform_name || 'BarberOS')
  const [yapePhone, setYapePhone] = useState(initialSettings.yape_phone || '')
  const [yapeHolder, setYapeHolder] = useState(initialSettings.yape_holder || '')
  const [yapeQrUrl, setYapeQrUrl] = useState(initialSettings.yape_qr_url || '')
  const [plinPhone, setPlinPhone] = useState(initialSettings.plin_phone || '')

  const [bankName, setBankName] = useState(initialSettings.bank_name || 'BCP Soles')
  const [bankAccount, setBankAccount] = useState(initialSettings.bank_account || '')
  const [bankCci, setBankCci] = useState(initialSettings.bank_cci || '')
  const [bankHolder, setBankHolder] = useState(initialSettings.bank_holder || '')

  const [starterPrice, setStarterPrice] = useState(String(initialSettings.starter_price ?? 59))
  const [proPrice, setProPrice] = useState(String(initialSettings.pro_price ?? 99))
  const [enterprisePrice, setEnterprisePrice] = useState(String(initialSettings.enterprise_price ?? 179))
  const [trialDays, setTrialDays] = useState(String(initialSettings.trial_days ?? 14))

  const [supportWhatsapp, setSupportWhatsapp] = useState(initialSettings.support_whatsapp || '')
  const [supportEmail, setSupportEmail] = useState(initialSettings.support_email || '')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      setError('La imagen del código QR no debe superar los 4MB.')
      return
    }
    setError(null)
    try {
      const compressed = await compressImageToDataUrl(file, 800, 0.85)
      setYapeQrUrl(compressed)
    } catch {
      setError('No se pudo procesar la imagen del código QR.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await updatePlatformSettingsAction({
      platform_name: platformName,
      yape_phone: yapePhone || null,
      yape_holder: yapeHolder || null,
      yape_qr_url: yapeQrUrl || null,
      plin_phone: plinPhone || null,
      bank_name: bankName || 'BCP Soles',
      bank_account: bankAccount || null,
      bank_cci: bankCci || null,
      bank_holder: bankHolder || null,
      starter_price: parseFloat(starterPrice) || 59,
      pro_price: parseFloat(proPrice) || 99,
      enterprise_price: parseFloat(enterprisePrice) || 179,
      trial_days: parseInt(trialDays, 10) || 14,
      support_whatsapp: supportWhatsapp || null,
      support_email: supportEmail || null,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Configuración Global de la Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Define cuentas de cobro, tarifas de planes, soporte y llaves privadas de servicios.
          </p>
        </div>

        {/* Selector de pestañas */}
        <div className="inline-flex self-start p-1 rounded-2xl bg-[#0D0E15] border border-white/[0.08] gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cobros, Planes & Soporte</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>APIs, Keys & Integraciones</span>
          </button>
        </div>
      </div>

      {activeTab === 'integrations' ? (
        <AdminIntegrationsTab initialSecrets={initialSecrets} />
      ) : (
        <>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración global guardada correctamente. Ya se refleja en el portal de suscripción de los clientes.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* 1. Billeteras Digitales (Yape / Plin + QR) */}
          <div className="xl:col-span-7 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Billeteras Digitales (Yape & Plin)</h2>
                <p className="text-[11px] text-neutral-400">
                  Números y QR visibles para las barberías al pagar su suscripción.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 flex flex-col items-center p-3.5 rounded-xl bg-neutral-950/90 border border-white/[0.06] space-y-2.5">
                <div className="w-28 h-28 rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden">
                  {yapeQrUrl ? (
                    <img src={yapeQrUrl} alt="QR Yape Plin" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-12 h-12 text-neutral-300" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3 h-3" />
                    <span>{yapeQrUrl ? 'Cambiar QR' : 'Subir QR'}</span>
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  </label>
                  {yapeQrUrl && (
                    <button
                      type="button"
                      onClick={() => setYapeQrUrl('')}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer"
                      title="Quitar QR"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Número Yape
                  </label>
                  <div className="relative">
                    <Smartphone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={yapePhone}
                      onChange={(e) => setYapePhone(e.target.value)}
                      placeholder="Ej: 999 888 777"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Número Plin
                  </label>
                  <div className="relative">
                    <Smartphone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={plinPhone}
                      onChange={(e) => setPlinPhone(e.target.value)}
                      placeholder="Ej: 999 888 777"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Titular de Billeteras (Yape / Plin)
                  </label>
                  <input
                    type="text"
                    value={yapeHolder}
                    onChange={(e) => setYapeHolder(e.target.value)}
                    placeholder="Ej: Darwin Jackson (BarberOS)"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Cuentas Bancarias */}
          <div className="xl:col-span-5 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Transferencia Bancaria</h2>
                <p className="text-[11px] text-neutral-400">
                  Cuenta corriente o ahorros para renovaciones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Banco & Moneda
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej: BCP Soles"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Titular
                </label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="Ej: BarberOS S.A.C."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Número de Cuenta
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Ej: 193-98765432-0-12"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Código Interbancario (CCI)
                </label>
                <input
                  type="text"
                  value={bankCci}
                  onChange={(e) => setBankCci(e.target.value)}
                  placeholder="Ej: 002-193009876543201211"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Tarifas de Planes & Trial */}
          <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Precios de Suscripción & Trial</h2>
                <p className="text-[11px] text-neutral-400">
                  Tarifas mensuales en Soles (PEN) y días de prueba gratuita.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Starter (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={starterPrice}
                  onChange={(e) => setStarterPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Pro (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={proPrice}
                  onChange={(e) => setProPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Enterprise (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={enterprisePrice}
                  onChange={(e) => setEnterprisePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Días Trial
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Soporte & Marca SaaS */}
          <div className="xl:col-span-6 bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Soporte Técnico & Plataforma</h2>
                <p className="text-[11px] text-neutral-400">
                  Canales visibles para consultas o reportes de pago.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Plataforma
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  WhatsApp Soporte
                </label>
                <input
                  type="text"
                  value={supportWhatsapp}
                  onChange={(e) => setSupportWhatsapp(e.target.value)}
                  placeholder="Ej: 51999888777"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Correo Soporte
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="soporte@barberos.app"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración Global</span>
          </button>
        </div>
      </form>
        </>
      )}
    </div>
  )
}
