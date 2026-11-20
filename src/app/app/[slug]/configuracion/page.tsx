import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import SalonSettingsClient from '@/components/settings/SalonSettingsClient'

interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params
  const { org, member, isSuperAdmin } = await getTenantAuthContext(slug)

  const isOwner = member?.role === 'OWNER' || isSuperAdmin
  const orgSettings = (org.settings as Record<string, any>) || {}

  // Solo el Dueño / SuperAdmin carga las llaves secretas desde organization_secrets
  let orgSecrets: {
    culqi_secret_key: string | null
    whatsapp_access_token: string | null
    whatsapp_webhook_token: string | null
  } | null = null

  if (isOwner) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('organization_secrets')
      .select('culqi_secret_key, whatsapp_access_token, whatsapp_webhook_token')
      .eq('organization_id', org.id)
      .maybeSingle()
    orgSecrets = data
  }

  const rawWaSettings =
    orgSettings.whatsapp_notifications ||
    orgSettings.whatsapp_settings ||
    orgSettings.whatsappSettings ||
    null

  const hydratedWaSettings = rawWaSettings
    ? {
        ...rawWaSettings,
        accessToken: isOwner
          ? orgSecrets?.whatsapp_access_token || rawWaSettings.accessToken || ''
          : '',
        webhookBearerToken: isOwner
          ? orgSecrets?.whatsapp_webhook_token || rawWaSettings.webhookBearerToken || ''
          : '',
      }
    : null

  const rawCulqi = orgSettings.culqi_settings || null
  const hydratedCulqi = rawCulqi
    ? {
        ...rawCulqi,
        secret_key: isOwner ? orgSecrets?.culqi_secret_key || rawCulqi.secret_key || '' : '',
      }
    : null

  return (
    <SalonSettingsClient
      organization={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        phone: org.phone,
        email: org.email,
        address: org.address,
        city: org.city,
        openingTime: orgSettings.opening_time || '09:00',
        closingTime: orgSettings.closing_time || '21:00',
        loyaltyProgram: orgSettings.loyalty_program || null,
        whatsappSettings: hydratedWaSettings,
        culqiSettings: hydratedCulqi,
        manualPaymentSettings: orgSettings.manual_payment_settings || null,
        cloudinarySettings: orgSettings.cloudinary_settings || null,
        logoUrl: org.logo_url || null,
        primaryColor: org.primary_color || '#F59E0B',
        secondaryColor: org.secondary_color || '#0F172A',
        bannerUrl: orgSettings.banner_url || null,
        tagline: orgSettings.tagline || null,
      }}
      isOwner={isOwner}
      slug={slug}
    />
  )
}
