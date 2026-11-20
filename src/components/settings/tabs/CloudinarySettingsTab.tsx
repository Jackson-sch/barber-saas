'use client'

import React, { useState } from 'react'
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  HelpCircle,
  Zap,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react'
import { testCloudinaryConnectionAction } from '@/actions/organizations'

interface CloudinarySettingsTabProps {
  isOwner: boolean
  slug: string
  cloudinaryEnabled: boolean
  setCloudinaryEnabled: (val: boolean) => void
  cloudName: string
  setCloudName: (val: string) => void
  uploadPreset: string
  setUploadPreset: (val: string) => void
  folder: string
  setFolder: (val: string) => void
}

export default function CloudinarySettingsTab({
  isOwner,
  slug,
  cloudinaryEnabled,
  setCloudinaryEnabled,
  cloudName,
  setCloudName,
  uploadPreset,
  setUploadPreset,
  folder,
  setFolder,
}: CloudinarySettingsTabProps) {
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  } | null>(null)

  const isConfigured = cloudName.trim().length > 0 && uploadPreset.trim().length > 0

  async function handleTestConnection() {
    if (!cloudName.trim() || !uploadPreset.trim()) {
      setTestResult({
        error: 'Ingresa primero el Cloud Name y el Upload Preset (Unsigned) para verificar la conexión.',
      })
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      const res = await testCloudinaryConnectionAction(cloudName, uploadPreset)
      if (res?.error) {
        setTestResult({ error: res.error })
      } else {
        setTestResult({
          success: true,
          message: res?.message || '¡Conexión exitosa con Cloudinary!',
        })
      }
    } catch {
      setTestResult({
        error: 'Error inesperado al contactar el servicio de Cloudinary.',
      })
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Almacenamiento de Imágenes Cloudinary
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  CDN Propio • BYOK
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
                Conecta tu cuenta gratuita o pro de Cloudinary para alojar tu logotipo, portada, código QR y los vouchers de tus clientes en CDN ultrarrápido sin saturar la base de datos.
              </p>
            </div>
          </div>

          {/* Badge de Estado */}
          <div className="flex items-center gap-2 shrink-0">
            {cloudinaryEnabled && isConfigured ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cloudinary Activo</span>
              </div>
            ) : cloudinaryEnabled ? (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Faltan Credenciales</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs font-medium">
                Modo Local (Fallback)
              </div>
            )}
          </div>
        </div>

        {/* Switch Principal */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <label htmlFor="cloudinary_enabled_toggle" className="text-sm font-semibold text-white cursor-pointer">
              Habilitar Subida de Imágenes a Cloudinary
            </label>
            <p className="text-xs text-neutral-400 mt-0.5">
              Todas las imágenes nuevas (logo, portada, QR y vouchers de reserva) se subirán automáticamente a tu nube de Cloudinary.
            </p>
          </div>
          <button
            id="cloudinary_enabled_toggle"
            type="button"
            role="switch"
            aria-checked={cloudinaryEnabled}
            disabled={!isOwner}
            onClick={() => setCloudinaryEnabled(!cloudinaryEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
              cloudinaryEnabled ? 'bg-sky-500 justify-end' : 'bg-neutral-800 justify-start'
            } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md transition" />
          </button>
        </div>

        {cloudinaryEnabled && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Credenciales */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="cloudinary_cloud_name"
                    className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                  >
                    Cloud Name *
                  </label>
                  <input
                    id="cloudinary_cloud_name"
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value.trim())}
                    disabled={!isOwner}
                    placeholder="Ej: mi-barberia-cloud"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12131A] border border-white/[0.08] text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Lo encuentras en el Dashboard principal de Cloudinary.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="cloudinary_upload_preset"
                    className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono"
                  >
                    Upload Preset (Unsigned) *
                  </label>
                  <input
                    id="cloudinary_upload_preset"
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value.trim())}
                    disabled={!isOwner}
                    placeholder="Ej: barberos_unsigned"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#12131A] border border-white/[0.08] text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Debe estar creado con Signing Mode en <strong>Unsigned</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cloudinary_folder"
                  className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Carpeta Base (Opcional)</span>
                </label>
                <input
                  id="cloudinary_folder"
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  disabled={!isOwner}
                  placeholder={`Ej: barberos/${slug}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#12131A] border border-white/[0.08] text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition"
                />
                <p className="text-[11px] text-neutral-500">
                  Organiza automáticamente tus archivos en subcarpetas (branding, qr, vouchers).
                </p>
              </div>

              {/* Botón Probar Conexión */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.06]">
                <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Verifica que tu Cloud Name y Preset acepten subidas antes de guardar.</span>
                </div>

                <button
                  type="button"
                  disabled={testingConnection || !isConfigured || !isOwner}
                  onClick={handleTestConnection}
                  className="px-4 py-2 rounded-xl bg-[#161822] hover:bg-[#1D2030] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>Probando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Probar Conexión con Cloudinary</span>
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/25 text-red-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <p>{testResult.message || testResult.error}</p>
                </div>
              )}
            </div>

            {/* Guía Paso a Paso */}
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>¿Cómo configurar Cloudinary gratis en 2 minutos?</span>
              </h4>
              <ol className="text-xs text-neutral-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Crea o inicia sesión en{' '}
                  <a
                    href="https://cloudinary.com/users/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    cloudinary.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  (el plan gratuito incluye 25GB/mes).
                </li>
                <li>
                  Copia tu <strong>Cloud Name</strong> desde la pantalla de inicio (Product Environment).
                </li>
                <li>
                  Ve a <strong>Settings (⚙️) &gt; Upload &gt; Upload presets &gt; Add upload preset</strong>.
                </li>
                <li>
                  Cambia el campo <strong>Signing Mode</strong> a <strong>Unsigned</strong>, guarda el preset y copia su nombre aquí.
                </li>
              </ol>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/15 flex items-start gap-2.5 text-xs text-sky-300/80">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                <strong>Privacidad por Barbería:</strong> No necesitas ingresar tu API Secret. Las imágenes se alojan directamente en tu propia cuenta de Cloudinary y nunca se mezclan con otras barberías.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
