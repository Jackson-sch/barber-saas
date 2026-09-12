'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Wallet,
  Users,
  UserCheck,
  Scissors,
  Package,
  Sparkles,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Settings,
  BarChart3,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

interface TenantSidebarProps {
  slug: string
  org: {
    id: string
    name: string
    slug: string
    trial_ends_at: string | null
  }
  member: {
    id: string
    role: string
    full_name: string
  } | null
  userEmail: string
  isSuperAdmin?: boolean
}

export function TenantSidebar({ slug, org, member, userEmail, isSuperAdmin = false }: TenantSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Días de prueba restantes
  const trialEnds = org.trial_ends_at ? new Date(org.trial_ends_at) : null
  const now = new Date()
  const daysLeft = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const navGroups = [
    {
      title: 'OPERACIONES',
      items: [
        { href: `/app/${slug}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/app/${slug}/agenda`, label: 'Agenda & Citas', icon: Calendar },
        { href: `/app/${slug}/pos`, label: 'Punto de Venta POS', icon: CreditCard },
        { href: `/app/${slug}/caja`, label: 'Caja & Turnos', icon: Wallet },
      ],
    },
    {
      title: 'GESTIÓN & FINANZAS',
      items: [
        { href: `/app/${slug}/reportes`, label: 'Reportes & Finanzas', icon: BarChart3 },
        { href: `/app/${slug}/clientes`, label: 'Clientes & Fichas', icon: Users },
        { href: `/app/${slug}/barberos`, label: 'Barberos & Comisiones', icon: UserCheck },
        { href: `/app/${slug}/servicios`, label: 'Servicios & Precios', icon: Scissors },
        { href: `/app/${slug}/inventario`, label: 'Inventario & Stock', icon: Package },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { href: `/app/${slug}/suscripcion`, label: 'Mi Suscripción', icon: Sparkles },
        { href: `/app/${slug}/configuracion`, label: 'Configuración', icon: Settings },
      ],
    },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#0D0E15] text-neutral-200 border-r border-white/[0.08]">
      {/* SuperAdmin Global Navigation Bar */}
      {isSuperAdmin && (
        <div className="p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-b border-amber-500/20">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span>👑</span>
              <span>Modo SúperAdmin</span>
            </span>
            <Link
              href="/admin"
              className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
            >
              <span>← Panel Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* Barbería Brand Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-sm">
            {org.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white truncate text-sm tracking-tight">{org.name}</h2>
            <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
              <Shield className="w-3 h-3 text-amber-400" />
              <span className="capitalize">{member?.role?.toLowerCase() || 'Dueño'}</span>
            </div>
          </div>
        </div>

        {/* Enlace público de reservas */}
        <div className="mt-3">
          <Link
            href={`/reservar/${slug}`}
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-[#141620] hover:bg-[#1A1D2B] text-xs text-neutral-300 hover:text-amber-400 flex items-center justify-between transition border border-white/[0.06] group"
          >
            <span className="truncate">Portal de Citas Online</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition" />
          </Link>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <span className="px-3 text-[10px] font-mono tracking-widest text-neutral-500 font-medium uppercase block">
              {group.title}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30 shadow-sm shadow-amber-500/5'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive ? 'text-amber-400' : 'text-neutral-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Subscription Status Widget */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0A0B10]">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-xs">
          <div className="flex items-center justify-between font-semibold text-amber-400 mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plan Trial</span>
            </div>
            <span className="font-mono text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
              {daysLeft}d restantes
            </span>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed mt-1">
            Acceso completo a todos los módulos y funciones.
          </p>
          <Link
            href={`/app/${slug}/suscripcion`}
            onClick={() => setMobileOpen(false)}
            className="mt-2.5 block text-center py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition text-[11px] border border-amber-500/30"
          >
            Activar Plan Anual / Mensual
          </Link>
        </div>

        {/* User profile & Logout */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="text-xs truncate mr-2">
            <span className="text-neutral-400 text-[10px] block">Sesión iniciada</span>
            <p className="text-neutral-200 font-medium truncate text-xs font-mono">{userEmail}</p>
          </div>
          <form action={logoutAction.bind(null, slug)}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Topbar with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0D0E15] border-b border-white/[0.08] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            {org.name.charAt(0)}
          </div>
          <span className="font-semibold text-white text-sm truncate">{org.name}</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-white/[0.05] border border-white/10 text-neutral-300 hover:text-white transition cursor-pointer"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#0D0E15] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
        {SidebarContent}
      </aside>
    </>
  )
}
