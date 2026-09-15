import { getTenantAuthContext } from '@/lib/tenant'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from '@/components/profile/ProfileClient'

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params
  const { user, org, member } = await getTenantAuthContext(slug)

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const fullName = profile?.full_name || member?.full_name || user.email?.split('@')[0] || 'Usuario'
  const phone = profile?.phone || member?.phone || null
  const avatarUrl = profile?.avatar_url || member?.avatar_url || null

  return (
    <ProfileClient
      slug={slug}
      organizationName={org.name}
      user={{
        id: user.id,
        email: user.email || '',
        fullName,
        phone,
        avatarUrl,
        role: member?.role || 'BARBER',
        joinedAt: member?.created_at,
      }}
    />
  )
}
