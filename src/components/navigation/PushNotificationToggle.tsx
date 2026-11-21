'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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

interface PushNotificationToggleProps {
  organizationId: string
}

export default function PushNotificationToggle({ organizationId }: PushNotificationToggleProps) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

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

    setSupported(true)

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setSubscribed(true)
        }
      })
      .catch(() => {})
  }, [vapidPublicKey])

  if (!supported || !vapidPublicKey) return null

  async function handleToggle() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      if (subscribed) {
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await deletePushSubscriptionAction(existing.endpoint)
          await existing.unsubscribe()
        }
        setSubscribed(false)
        toast.info('Notificaciones push desactivadas en este dispositivo.')
        setLoading(false)
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Permiso de notificaciones denegado en el navegador.')
        setLoading(false)
        return
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
      })

      const json = subscription.toJSON()
      const p256dh = json.keys?.p256dh || ''
      const auth = json.keys?.auth || ''

      if (!p256dh || !auth) {
        toast.error('No se pudieron obtener las llaves del dispositivo.')
        setLoading(false)
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
        setSubscribed(true)
        toast.success('¡Notificaciones push nativas activadas!')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error al configurar notificaciones push.')
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={
        subscribed
          ? 'Notificaciones push nativas activas (clic para desactivar)'
          : 'Activar notificaciones push nativas en este dispositivo'
      }
      className={`w-full py-2 px-3 rounded-xl text-[11px] font-semibold border transition flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 ${
        subscribed
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
          : 'bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08]'
      }`}
    >
      <span className="flex items-center gap-2 truncate">
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : subscribed ? (
          <Bell className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <BellOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <span className="truncate">
          {subscribed ? 'Push Nativas Activas' : 'Activar Push en Teléfono'}
        </span>
      </span>
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          subscribed ? 'bg-emerald-400' : 'bg-neutral-600'
        }`}
      />
    </button>
  )
}
