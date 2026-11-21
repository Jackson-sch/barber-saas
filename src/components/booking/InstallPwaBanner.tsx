'use client'

import { useEffect, useState } from 'react'
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPwaBannerProps {
  orgName: string
  primaryColor?: string
  logoUrl?: string | null
}

export default function InstallPwaBanner({
  orgName,
  primaryColor = '#F59E0B',
  logoUrl,
}: InstallPwaBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    setIsStandalone(standalone)
    if (standalone) return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registro silencioso
      })
    }

    const ua = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(ua)
    setIsIos(iosDevice)

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  if (isStandalone) return null
  if (!deferredPrompt && !isIos) return null

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
      }
      return
    }
    if (isIos) {
      setShowIosGuide(true)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title={`Instalar app de ${orgName}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
        style={{
          backgroundColor: `${primaryColor}18`,
          borderColor: `${primaryColor}45`,
          color: primaryColor,
        }}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      {showIosGuide && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIosGuide(false)
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt={orgName} className="w-full h-full object-cover" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Instalar {orgName}</h3>
                  <p className="text-[11px] text-neutral-400">
                    Acceso directo a reservas en tu iPhone / iPad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                aria-label="Cerrar guía"
                className="p-1.5 rounded-xl hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <p>
                  <strong className="text-white">1.</strong> En la barra inferior de Safari, toca el botón{' '}
                  <strong className="text-sky-400">Compartir</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <p>
                  <strong className="text-white">2.</strong> Desliza y selecciona{' '}
                  <strong className="text-amber-400">&ldquo;Agregar a pantalla de inicio&rdquo;</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
