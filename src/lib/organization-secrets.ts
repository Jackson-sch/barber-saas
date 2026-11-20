import { Pool } from 'pg'
import { createClient } from '@/lib/supabase/server'

export interface OrganizationSecretsData {
  culqi_secret_key: string | null
  whatsapp_access_token: string | null
  whatsapp_webhook_token: string | null
}

const globalForPg = globalThis as unknown as { __barberSecretsPgPool?: Pool }

function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) return null

  if (!globalForPg.__barberSecretsPgPool) {
    globalForPg.__barberSecretsPgPool = new Pool({
      connectionString,
      max: 3,
      ssl: { rejectUnauthorized: false },
    })
  }
  return globalForPg.__barberSecretsPgPool
}

/**
 * Lee los secretos privados de una organización únicamente en el servidor.
 * 1. Intenta con el cliente Supabase actual (funciona para OWNER, ADMIN y SuperAdmin vía RLS).
 * 2. Si el flujo en el servidor es público (ej. checkout Culqi) o un rol operativo (ej. barbero enviando WhatsApp),
 *    consulta directamente vía PostgreSQL (DATABASE_URL / DIRECT_URL) sin exponer secretos al cliente.
 */
export async function getOrganizationSecretsServer(
  organizationId: string
): Promise<OrganizationSecretsData> {
  if (!organizationId) {
    return {
      culqi_secret_key: null,
      whatsapp_access_token: null,
      whatsapp_webhook_token: null,
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organization_secrets')
      .select('culqi_secret_key, whatsapp_access_token, whatsapp_webhook_token')
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (!error && data) {
      return {
        culqi_secret_key: data.culqi_secret_key ?? null,
        whatsapp_access_token: data.whatsapp_access_token ?? null,
        whatsapp_webhook_token: data.whatsapp_webhook_token ?? null,
      }
    }
  } catch {
    // Fallback al pool de PostgreSQL en servidor
  }

  const pool = getPgPool()
  if (pool) {
    try {
      const res = await pool.query<OrganizationSecretsData>(
        `SELECT culqi_secret_key, whatsapp_access_token, whatsapp_webhook_token
         FROM public.organization_secrets
         WHERE organization_id = $1
         LIMIT 1`,
        [organizationId]
      )
      if (res.rows[0]) {
        return {
          culqi_secret_key: res.rows[0].culqi_secret_key ?? null,
          whatsapp_access_token: res.rows[0].whatsapp_access_token ?? null,
          whatsapp_webhook_token: res.rows[0].whatsapp_webhook_token ?? null,
        }
      }
    } catch (err) {
      console.error('[organization-secrets] Error querying PostgreSQL:', err)
    }
  }

  return {
    culqi_secret_key: null,
    whatsapp_access_token: null,
    whatsapp_webhook_token: null,
  }
}
