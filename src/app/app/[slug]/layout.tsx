import { getTenantAuthContext } from '@/lib/tenant'
import { TenantSidebar } from '@/components/navigation/TenantSidebar'
import CommandPalette from '@/components/navigation/CommandPalette'
import { ExternalLink } from 'lucide-react'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { slug } = await params
  const { org, member, user, isSuperAdmin } = await getTenantAuthContext(slug)

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
          logo_url: org.logo_url,
          primary_color: org.primary_color,
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
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Subtle background glow for workspace */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Global Workspace Top Bar with Spotlight Command Menu */}
        <header className="sticky top-0 z-30 bg-[#090A0E]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4">
          <CommandPalette
            slug={slug}
            organizationId={org.id}
            organizationName={org.name}
          />

          <div className="flex items-center gap-3 text-xs">
            <a
              href={`/reservar/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-amber-400 font-medium transition shadow-sm"
              title="Abrir portal público de reservas online"
            >
              <span>Portal Clientes</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            </a>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                {member?.full_name ? member.full_name.charAt(0) : user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="font-semibold text-white text-xs block truncate max-w-[130px]">
                  {member?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono capitalize">
                  {member?.role?.toLowerCase() || 'Dueño'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto relative z-10 flex-1 w-full">{children}</div>
      </main>
    </div>
  )
}
