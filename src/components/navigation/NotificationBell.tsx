'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  BellOff,
  Calendar,
  CheckCheck,
  Loader2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatPersonName, formatTimeOnly } from '@/lib/utils'
import { savePushSubscriptionAction, deletePushSubscriptionAction } from '@/actions/push'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

interface NotificationItem {
  id: string
  clientName: string
  serviceName: string
  startTime: string
  source: string
  status: string
  createdAt: string
}

interface NotificationBellProps {
  organizationId: string
  slug: string
}

export default function NotificationBell({ organizationId, slug }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingFeed, setLoadingFeed] = useState(false)

  // Web Push state
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  // Verificar soporte Web Push y estado actual
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !vapidPublicKey ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      return
    }
    setPushSupported(true)
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setPushSubscribed(true)
      })
      .catch(() => {})
  }, [vapidPublicKey])

  // Cargar últimas citas y escuchar Realtime
  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function loadRecent() {
      setLoadingFeed(true)
      const { data } = await supabase
        .from('appointments')
        .select(
          `
          id,
          start_time,
          status,
          source,
          created_at,
          client:clients(full_name),
          service:services(name)
        `
        )
        .eq('organization_id', organizationId)
        .in('status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])
        .order('created_at', { ascending: false })
        .limit(6)

      if (!active) return
      if (data) {
        const mapped: NotificationItem[] = data.map((row: any) => ({
          id: row.id,
          clientName: formatPersonName(row.client?.full_name) || 'Cliente',
          serviceName: row.service?.name || 'Servicio',
          startTime: row.start_time,
          source: row.source || 'ONLINE',
          status: row.status,
          createdAt: row.created_at,
        }))
        setItems(mapped)
      }
      setLoadingFeed(false)
    }

    loadRecent()

    const channel = supabase
      .channel(`notif-bell-${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          setUnreadCount((c) => c + 1)
          loadRecent()
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [organizationId])

  async function handleTogglePush() {
    if (!vapidPublicKey) return
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await reg.update().catch(() => {})
      await navigator.serviceWorker.ready

      if (pushSubscribed) {
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await deletePushSubscriptionAction(existing.endpoint)
          await existing.unsubscribe()
        }
        setPushSubscribed(false)
        toast.info('Notificaciones push desactivadas en este dispositivo.')
        setPushLoading(false)
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permiso de notificaciones denegado en el navegador.')
        setPushLoading(false)
        return
      }

      // Si había una suscripción previa atascada o con otra llave, limpiarla antes de re-suscribir
      const staleSub = await reg.pushManager.getSubscription()
      if (staleSub) {
        await staleSub.unsubscribe().catch(() => {})
      }

      const cleanVapid = vapidPublicKey.trim()
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cleanVapid),
      })

      const json = subscription.toJSON()
      const p256dh = json.keys?.p256dh || ''
      const auth = json.keys?.auth || ''

      if (!p256dh || !auth) {
        toast.error('No se pudieron obtener las llaves del dispositivo.')
        setPushLoading(false)
        return
      }

      const res = await savePushSubscriptionAction({
        organizationId,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        userAgent: navigator.userAgent,
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        setPushSubscribed(true)
        toast.success('¡Notificaciones push nativas activadas!')
      }
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.toLowerCase().includes('push service error') || err?.name === 'AbortError') {
        toast.error(
          'El servicio Push fue bloqueado o no responde. Verifica que no estés en modo Incógnito, ni usando Brave, VPN o DNS privado con bloqueo (ej. AdGuard).'
        )
      } else {
        toast.error(msg || 'Error al configurar notificaciones push.')
      }
    }
    setPushLoading(false)
  }

  function handleOpenToggle() {
    setOpen((prev) => {
      const next = !prev
      if (next) setUnreadCount(0)
      return next
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpenToggle}
        aria-label="Notificaciones"
        title="Notificaciones y alertas push"
        className="relative w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center tabular-nums shadow-md shadow-amber-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : pushSupported && !pushSubscribed ? (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#090A0E]"
            title="Activa las notificaciones push"
          />
        ) : null}
      </button>

      {open && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-11 w-[calc(100vw-1.5rem)] sm:w-96 bg-[#0D0E15] border border-white/[0.1] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs">Notificaciones</span>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setUnreadCount(0)}
                className="text-[11px] text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Al día</span>
              </button>
            )}
          </div>

          {/* Toggle Push Nativo */}
          {pushSupported && (
            <div className="p-3 border-b border-white/[0.06] bg-neutral-950/60">
              <button
                type="button"
                onClick={handleTogglePush}
                disabled={pushLoading}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 ${
                  pushSubscribed
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  {pushLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : pushSubscribed ? (
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {pushSubscribed
                      ? 'Push nativas activas en este equipo'
                      : 'Activar notificaciones push en este equipo'}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    pushSubscribed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500 text-black'
                  }`}
                >
                  {pushSubscribed ? 'ON' : 'Activar'}
                </span>
              </button>
            </div>
          )}

          {/* Lista de Reservas Recientes */}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
            {loadingFeed && items.length === 0 ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Cargando actividad...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Calendar className="w-7 h-7 text-neutral-600 mx-auto mb-1.5" />
                <p className="text-xs text-neutral-400">No hay reservas pendientes por ahora.</p>
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/app/${slug}/agenda`}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition block"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.clientName}</p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {item.serviceName} •{' '}
                      <span className="text-amber-400 font-mono">
                        {formatTimeOnly(item.startTime)}
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] text-neutral-300 border border-white/[0.08] shrink-0">
                    {item.source === 'ONLINE' ? 'Online' : 'Local'}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.08] bg-neutral-950/60 flex justify-end">
            <Link
              href={`/app/${slug}/agenda`}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition"
            >
              <span>Ver agenda completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
