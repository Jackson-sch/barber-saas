import * as webpush from 'web-push'
import { Pool } from 'pg'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { formatPersonName, formatTimeOnly } from '@/lib/utils'

interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

const globalForPushPg = globalThis as unknown as { __barberPushPgPool?: Pool }

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) return null

  if (!globalForPushPg.__barberPushPgPool) {
    globalForPushPg.__barberPushPgPool = new Pool({
      connectionString,
      max: 3,
      ssl: { rejectUnauthorized: false },
    })
  }
  return globalForPushPg.__barberPushPgPool
}

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:soporte@barberos.app'

  if (!publicKey || !privateKey) return null
  return { publicKey, privateKey, subject }
}

async function getTargetSubscriptions(
  organizationId: string,
  barberMemberId?: string
): Promise<PushSubscriptionRow[]> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceRoleKey && supabaseUrl) {
    try {
      const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })

      const { data: members } = await admin
        .from('organization_members')
        .select('id, user_id, role')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      const targetUserIds = new Set<string>()
      for (const m of members || []) {
        if (!m.user_id) continue
        if (m.role === 'OWNER' || m.role === 'ADMIN' || (barberMemberId && m.id === barberMemberId)) {
          targetUserIds.add(m.user_id)
        }
      }

      if (targetUserIds.size === 0) return []

      const { data: subs } = await admin
        .from('push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth')
        .eq('organization_id', organizationId)
        .in('user_id', Array.from(targetUserIds))

      return (subs as PushSubscriptionRow[]) || []
    } catch {
      // Fallback al pool PostgreSQL
    }
  }

  const pool = getPgPool()
  if (!pool) return []

  try {
    const res = await pool.query<PushSubscriptionRow>(
      `SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh, ps.auth
       FROM public.push_subscriptions ps
       INNER JOIN public.organization_members om
         ON om.user_id = ps.user_id
        AND om.organization_id = ps.organization_id
       WHERE ps.organization_id = $1
         AND om.is_active = true
         AND (om.role IN ('OWNER', 'ADMIN') OR om.id = $2)`,
      [organizationId, barberMemberId || null]
    )
    return res.rows
  } catch (err) {
    console.warn('[push-notifications] Error querying subscriptions:', err)
    return []
  }
}

async function removeExpiredSubscription(id: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceRoleKey && supabaseUrl) {
    try {
      const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      await admin.from('push_subscriptions').delete().eq('id', id)
      return
    } catch {
      // Fallback
    }
  }

  const pool = getPgPool()
  if (pool) {
    await pool.query('DELETE FROM public.push_subscriptions WHERE id = $1', [id]).catch(() => {})
  }
}

export async function sendBookingPushNotification(params: {
  organizationId: string
  slug: string
  barberId?: string
  clientName: string
  serviceName: string
  startTime: string
}) {
  const vapid = getVapidConfig()
  if (!vapid) return

  const subscriptions = await getTargetSubscriptions(params.organizationId, params.barberId)
  if (subscriptions.length === 0) return

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey)

  const clientDisplay = formatPersonName(params.clientName) || 'Nuevo cliente'
  const timeDisplay = formatTimeOnly(params.startTime)
  const payload = JSON.stringify({
    title: `Nueva Reserva: ${clientDisplay}`,
    body: `${params.serviceName} • ${timeDisplay}`,
    url: `/app/${params.slug}/agenda`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `booking-${params.organizationId}`,
  })

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      } catch (err: any) {
        const statusCode = err?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await removeExpiredSubscription(sub.id)
        } else {
          console.warn('[push-notifications] Error sending push:', err?.message || err)
        }
      }
    })
  )
}
