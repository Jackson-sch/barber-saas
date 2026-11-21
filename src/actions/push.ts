'use server'

import { verifyOrgAccess } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'

export async function savePushSubscriptionAction(input: {
  organizationId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}) {
  if (!input.organizationId || !input.endpoint || !input.p256dh || !input.auth) {
    return { error: 'Datos de suscripción Push incompletos.' }
  }

  const access = await verifyOrgAccess(input.organizationId)
  if (!access.authorized || !access.user) {
    return { error: access.error || 'No autorizado.' }
  }

  const { supabase, user } = access

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      organization_id: input.organizationId,
      user_id: user.id,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent?.slice(0, 255) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,endpoint' }
  )

  if (error) {
    console.error('savePushSubscriptionAction error:', error)
    return { error: 'No se pudo registrar el dispositivo para notificaciones.' }
  }

  return { success: true }
}

export async function deletePushSubscriptionAction(endpoint: string) {
  if (!endpoint) return { error: 'Endpoint requerido.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  return { success: true }
}
