'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  Building2,
  LogOut,
  Settings,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

interface AdminSidebarProps {
  userEmail: string
  pendingPaymentsCount: number
  pendingOrgsCount: number
}

export default function AdminSidebar({
  userEmail,
  pendingPaymentsCount,
  pendingOrgsCount,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard Global',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
      badge: 0,
    },
    {
      href: '/admin/pagos',
      label: 'Aprobación de Pagos',
      shortLabel: 'Pagos',
      icon: CreditCard,
      exact: false,
      badge: pendingPaymentsCount,
    },
    {
      href: '/admin/barberias',
      label: 'Barberías (Tenants)',
      shortLabel: 'Barberías',
      icon: Building2,
      exact: false,
      badge: pendingOrgsCount,
    },
    {
      href: '/admin/configuracion',
      label: 'Configuración Global',
      shortLabel: 'Ajustes',
      icon: Settings,
      exact: false,
      badge: 0,
    },
  ]

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {/* Top Bar Móvil */}
      <header className="md:hidden sticky top-0 z-40 h-15 px-4 bg-[#0B0C11]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight block leading-none">
              Barber<span className="text-amber-500">OS</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400">
              SuperAdmin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {(pendingPaymentsCount > 0 || pendingOrgsCount > 0) && (
            <Link
              href={pendingPaymentsCount > 0 ? '/admin/pagos' : '/admin/barberias'}
              className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>{pendingPaymentsCount + pendingOrgsCount} pend.</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label="Abrir menú SuperAdmin"
            className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-200 hover:text-white transition cursor-pointer"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Drawer Móvil */}
      {drawerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false)
          }}
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-72 max-w-[85vw] h-full bg-[#0B0C11] border-r border-white/[0.08] p-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-white text-sm tracking-tight block">
                      Barber<span className="text-amber-500">OS</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-amber-400">
                      Súper Administrador
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, item.exact)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        active
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-amber-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums ${
                            active ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                <span className="text-[10px] text-amber-400 font-semibold">Master Admin</span>
              </div>
              <form action={logoutAction.bind(null, undefined)}>
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Escritorio */}
      <aside className="hidden md:flex md:w-64 bg-[#0B0C11] border-r border-white/[0.08] flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
                Barber<span className="text-amber-500">OS</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-amber-400">
                Súper Administrador
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-2">
            Centro de Control
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  active
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      active ? 'text-black' : 'text-neutral-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-nums ${
                      active ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Estado del Sistema */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white leading-tight">SaaS Multi-Tenant</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Nodo Operativo
            </p>
          </div>
        </div>

        {/* Perfil y Logout */}
        <div className="p-4 border-t border-white/[0.08] bg-neutral-950/60 flex items-center justify-between gap-2">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
            <span className="text-[10px] text-amber-400 font-semibold">Master Admin</span>
          </div>
          <form action={logoutAction.bind(null, undefined)}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="p-2 rounded-xl hover:bg-red-500/15 text-neutral-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Barra de Navegación Inferior Móvil */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B0C11]/95 backdrop-blur-md border-t border-white/[0.08] grid grid-cols-4 px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
                active ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate">{item.shortLabel}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 right-3 px-1 min-w-[16px] h-4 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
