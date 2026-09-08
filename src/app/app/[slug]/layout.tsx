import { getTenantAuthContext } from '@/lib/tenant'
import { TenantSidebar } from '@/components/navigation/TenantSidebar'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params
  const { org, member, user } = await getTenantAuthContext(slug)

  return (
    <div className="min-h-screen bg-[#090A0E] text-white flex flex-col md:flex-row">
      {/* Sidebar Component with responsive drawer and active highlighting */}
      <TenantSidebar
        slug={slug}
        org={{
          id: org.id,
          name: org.name,
          slug: org.slug,
          trial_ends_at: org.trial_ends_at,
        }}
        member={
          member
            ? {
                id: member.id,
                role: member.role,
                full_name: member.full_name,
              }
            : null
        }
        userEmail={user.email || ''}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle background glow for workspace */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto relative z-10">{children}</div>
      </main>
    </div>
  )
}
