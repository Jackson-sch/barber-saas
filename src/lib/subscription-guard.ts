import { Pool } from 'pg'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import type { Organization, OrganizationSubscription } from '@/types/database.types'

const globalForSubPg = globalThis as unknown as { __barberSubGuardPgPool?: Pool }

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) return null

  if (!globalForSubPg.__barberSubGuardPgPool) {
    globalForSubPg.__barberSubGuardPgPool = new Pool({
      connectionString,
      max: 3,
      ssl: { rejectUnauthorized: false },
    })
  }
  return globalForSubPg.__barberSubGuardPgPool
}

export function getSubscriptionStatusInfo(
  org: Pick<Organization, 'trial_ends_at' | 'is_active' | 'settings'>,
  subscription?: { current_period_end?: string | null; status?: string | null; plan_tier?: string | null } | null
) {
  const endDateRaw = subscription?.current_period_end || org.trial_ends_at
  const endDate = new Date(endDateRaw)
  const now = new Date()
  const msLeft = endDate.getTime() - now.getTime()
  const isExpired = msLeft <= 0
  const daysLeft = isExpired ? 0 : Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  const settings = (
    typeof org.settings === 'object' && org.settings !== null ? org.settings : {}
  ) as Record<string, any>

  return {
    endDate,
    isExpired,
    daysLeft,
    isPendingApproval: !org.is_active && settings.approval_status === 'PENDING',
    suspendedReason: (settings.suspended_reason as string | undefined) || null,
  }
}

/**
 * Desactiva automáticamente una organización vencida y marca su suscripción como PAST_DUE.
 * Usa SERVICE_ROLE_KEY o pool PostgreSQL para ejecutarse sin depender de permisos del cliente.
 */
export async function deactivateExpiredOrganizationServer(
  organizationId: string,
  currentSettings?: Record<string, any> | null
): Promise<boolean> {
  const nextSettings = {
    ...(typeof currentSettings === 'object' && currentSettings !== null ? currentSettings : {}),
    suspended_reason: 'SUBSCRIPTION_EXPIRED',
    expired_at: new Date().toISOString(),
  }
  const nowIso = new Date().toISOString()

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceRoleKey && supabaseUrl) {
    try {
      const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      await Promise.all([
        admin
          .from('organizations')
          .update({ is_active: false, settings: nextSettings, updated_at: nowIso })
          .eq('id', organizationId),
        admin
          .from('organization_subscriptions')
          .update({ status: 'EXPIRED', updated_at: nowIso })
          .eq('organization_id', organizationId),
      ])
      return true
    } catch {
      // Fallback a PostgreSQL
    }
  }

  const pool = getPgPool()
  if (!pool) return false

  try {
    await pool.query(
      `UPDATE public.organizations
       SET is_active = false, settings = $2::jsonb, updated_at = $3
       WHERE id = $1`,
      [organizationId, JSON.stringify(nextSettings), nowIso]
    )
    await pool.query(
      `UPDATE public.organization_subscriptions
       SET status = 'EXPIRED', updated_at = $2
       WHERE organization_id = $1`,
      [organizationId, nowIso]
    )
    return true
  } catch (err) {
    console.warn('[subscription-guard] Error deactivating expired org:', err)
    return false
  }
}
