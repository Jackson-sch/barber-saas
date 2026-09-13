import { getTenantAuthContext } from '@/lib/tenant'
import SalonSettingsClient from '@/components/settings/SalonSettingsClient'

interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params
  const { org, member, isSuperAdmin } = await getTenantAuthContext(slug)

  const isOwner = member?.role === 'OWNER' || isSuperAdmin
  const orgSettings = (org.settings as Record<string, any>) || {}

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
      }}
      isOwner={isOwner}
      slug={slug}
    />
  )
}
