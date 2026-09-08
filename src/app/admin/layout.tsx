import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAction } from '@/actions/auth'
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  Building2,
  LogOut,
  ExternalLink,
  Scissors,
} from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Verificar superadmin en profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    redirect('/login?error=unauthorized')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard Global', icon: LayoutDashboard },
    { href: '/admin/pagos', label: 'Aprobación de Pagos', icon: CreditCard },
    { href: '/admin/barberias', label: 'Barberías (Tenants)', icon: Building2 },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* SuperAdmin Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Barber<span className="text-amber-500">OS</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-bold text-amber-400">
                Súper Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/70 transition group"
              >
                <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <p className="text-xs font-semibold text-white truncate">{user.email}</p>
            <span className="text-[10px] text-amber-400 font-semibold">Master Admin</span>
          </div>
          <form action={logoutAction.bind(null, undefined)}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
