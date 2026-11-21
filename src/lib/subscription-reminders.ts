import * as webpush from 'web-push'
import { Pool } from 'pg'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { getPlatformSecretsServer, type PlatformSecretsData } from '@/lib/platform-secrets'
import {
  getSubscriptionStatusInfo,
  deactivateExpiredOrganizationServer,
} from '@/lib/subscription-guard'

interface OrgWithSubRow {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  is_active: boolean
  trial_ends_at: string
  settings: Record<string, any> | null
  subscription?: {
    plan_tier: string
    status: string
    current_period_end: string | null
  } | null
}

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) return null
  return new Pool({ connectionString, max: 2, ssl: { rejectUnauthorized: false } })
}

async function sendResendEmail(
  secrets: PlatformSecretsData,
  toEmail: string,
  subject: string,
  html: string
) {
  if (secrets.email_provider !== 'RESEND' || !secrets.resend_api_key || !secrets.email_from_address) {
    return false
  }

  const fromName = secrets.email_from_name || 'BarberOS'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secrets.resend_api_key.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${secrets.email_from_address.trim()}>`,
      to: [toEmail],
      subject,
      html,
    }),
  })
  return res.ok
}

async function sendPlatformWhatsApp(
  secrets: PlatformSecretsData,
  phone: string,
  message: string
) {
  let cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length === 9) cleanPhone = `51${cleanPhone}`
  if (!cleanPhone) return false

  if (
    secrets.whatsapp_provider === 'META_CLOUD' &&
    secrets.whatsapp_phone_number_id &&
    secrets.whatsapp_access_token
  ) {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${secrets.whatsapp_phone_number_id.trim()}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secrets.whatsapp_access_token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    )
    return res.ok
  }

  if (secrets.whatsapp_provider === 'CUSTOM_GATEWAY' && secrets.whatsapp_gateway_url) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (secrets.whatsapp_access_token) {
      headers.Authorization = `Bearer ${secrets.whatsapp_access_token.trim()}`
    }
    const res = await fetch(secrets.whatsapp_gateway_url.trim(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ number: cleanPhone, text: message }),
    })
    return res.ok
  }

  return false
}

async function sendOwnerWebPush(
  organizationId: string,
  title: string,
  body: string,
  url: string
) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim()
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:soporte@barberos.app'
  if (!publicKey || !privateKey) return

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceRoleKey || !supabaseUrl) return

  const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('organization_id', organizationId)

  if (!subs || subs.length === 0) return

  webpush.setVapidDetails(subject, publicKey, privateKey)
  const payload = JSON.stringify({
    title,
    body,
    url,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `sub-reminder-${organizationId}`,
  })

  await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  )
}

export async function processSubscriptionExpirationsAndReminders() {
  const secrets = await getPlatformSecretsServer()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://barber-saas.jscdev.site').replace(/\/$/, '')
  const todayStr = new Date().toISOString().slice(0, 10)

  let orgs: OrgWithSubRow[] = []
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceRoleKey && supabaseUrl) {
    const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data } = await admin
      .from('organizations')
      .select(
        `
        id, name, slug, email, phone, is_active, trial_ends_at, settings,
        subscription:organization_subscriptions(plan_tier, status, current_period_end)
      `
      )
      .eq('is_active', true)

    orgs = ((data || []) as any[]).map((row) => ({
      ...row,
      subscription: Array.isArray(row.subscription) ? row.subscription[0] : row.subscription,
    }))
  } else {
    const pool = getPgPool()
    if (pool) {
      try {
        const res = await pool.query(`
          SELECT o.id, o.name, o.slug, o.email, o.phone, o.is_active, o.trial_ends_at, o.settings,
                 s.plan_tier, s.status AS sub_status, s.current_period_end
          FROM public.organizations o
          LEFT JOIN public.organization_subscriptions s ON s.organization_id = o.id
          WHERE o.is_active = true
        `)
        orgs = res.rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          email: r.email,
          phone: r.phone,
          is_active: r.is_active,
          trial_ends_at: r.trial_ends_at,
          settings: r.settings,
          subscription: r.plan_tier
            ? { plan_tier: r.plan_tier, status: r.sub_status, current_period_end: r.current_period_end }
            : null,
        }))
      } finally {
        await pool.end()
      }
    }
  }

  let reminded = 0
  let deactivated = 0

  for (const org of orgs) {
    const subInfo = getSubscriptionStatusInfo(org, org.subscription)
    const renewUrl = `${appUrl}/app/${org.slug}/suscripcion`

    if (subInfo.isExpired) {
      await deactivateExpiredOrganizationServer(org.id, org.settings)
      deactivated++

      const title = `Cuenta suspendida por vencimiento — ${org.name}`
      const msg = `Hola ${org.name}, tu período de prueba o suscripción en BarberOS ha finalizado y tu cuenta fue desactivada automáticamente. Renueva aquí para reactivarla al instante: ${renewUrl}`

      if (org.email) {
        await sendResendEmail(
          secrets,
          org.email,
          title,
          `<p>Hola <strong>${org.name}</strong>,</p><p>Tu período de prueba o suscripción en <strong>BarberOS</strong> ha vencido y tu cuenta fue desactivada automáticamente.</p><p><a href="${renewUrl}">Haz clic aquí para renovar tu plan y reactivar tu barbería</a>.</p>`
        ).catch(() => {})
      }
      if (org.phone) {
        await sendPlatformWhatsApp(secrets, org.phone, msg).catch(() => {})
      }
      await sendOwnerWebPush(
        org.id,
        'Suscripción vencida',
        'Tu cuenta fue desactivada automáticamente. Toca para renovar.',
        `/app/${org.slug}/suscripcion`
      ).catch(() => {})
      continue
    }

    // Recordatorios automáticos a los 3 días, 1 día o el mismo día del vencimiento
    if (subInfo.daysLeft <= 3) {
      const settings = (org.settings || {}) as Record<string, any>
      if (settings.last_sub_reminder_day === todayStr) {
        continue
      }

      const dayLabel =
        subInfo.daysLeft === 1 ? '1 día' : `${subInfo.daysLeft} días`
      const title = `Tu plan en BarberOS vence en ${dayLabel}`
      const msg = `Hola ${org.name}, te recordamos que tu período de prueba o suscripción en BarberOS vence en ${dayLabel}. Renueva a tiempo para evitar la desactivación automática: ${renewUrl}`

      if (org.email) {
        await sendResendEmail(
          secrets,
          org.email,
          title,
          `<p>Hola <strong>${org.name}</strong>,</p><p>Tu suscripción en <strong>BarberOS</strong> vence en <strong>${dayLabel}</strong>.</p><p><a href="${renewUrl}">Renueva aquí antes del vencimiento</a> para mantener tu agenda y reservas activas.</p>`
        ).catch(() => {})
      }
      if (org.phone) {
        await sendPlatformWhatsApp(secrets, org.phone, msg).catch(() => {})
      }
      await sendOwnerWebPush(
        org.id,
        `Tu plan vence en ${dayLabel}`,
        'Renueva tu suscripción para evitar que tu portal se pause.',
        `/app/${org.slug}/suscripcion`
      ).catch(() => {})

      // Marcar que ya se envió recordatorio hoy
      if (serviceRoleKey && supabaseUrl) {
        const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        await admin
          .from('organizations')
          .update({
            settings: { ...settings, last_sub_reminder_day: todayStr },
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id)
      }
      reminded++
    }
  }

  return {
    checked: orgs.length,
    reminded,
    deactivated,
  }
}
