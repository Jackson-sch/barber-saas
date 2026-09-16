'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Calendar,
  CreditCard,
  Wallet,
  Users,
  UserPlus,
  Scissors,
  Package,
  BarChart3,
  Settings,
  Sparkles,
  Share2,
  Check,
  Command,
  ArrowRight,
  ExternalLink,
  User,
  Loader2,
  X,
} from 'lucide-react'
import { searchGlobalClientsAction } from '@/actions/clients'
import { toast } from 'sonner'

interface CommandPaletteProps {
  slug: string
  organizationId: string
  organizationName: string
}

interface CommandItem {
  id: string
  category: 'ACCIONES' | 'NAVEGACIÓN' | 'CLIENTES'
  label: string
  description?: string
  icon: any
  action: () => void
  badge?: string
}

export default function CommandPalette({
  slug,
  organizationId,
  organizationName,
}: CommandPaletteProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearchingClients, setIsSearchingClients] = useState(false)
  const [clientResults, setClientResults] = useState<
    Array<{ id: string; full_name: string; phone: string; total_visits: number }>
  >([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Atajo global Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input al abrir
  useEffect(() => {
    let t: NodeJS.Timeout
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      t = setTimeout(() => inputRef.current?.focus(), 50)
    }
    return () => {
      if (t) clearTimeout(t)
    }
  }, [isOpen])

  // Búsqueda en vivo de clientes
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setClientResults([])
      setIsSearchingClients(false)
      return
    }

    let isMounted = true
    const timer = setTimeout(async () => {
      setIsSearchingClients(true)
      const res = await searchGlobalClientsAction(organizationId, query)
      if (isMounted) {
        setIsSearchingClients(false)
        if (res?.clients) {
          setClientResults(res.clients)
        }
      }
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, organizationId])

  function handleClose() {
    setIsOpen(false)
    setQuery('')
  }

  function handleNavigate(path: string) {
    handleClose()
    router.push(path)
  }

  async function handleCopyPortalLink() {
    const url = `${window.location.origin}/reservar/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('¡Enlace de reservas copiado al portapapeles!')
    } catch {
      toast.error('No se pudo copiar el enlace automáticamente')
    }
    handleClose()
  }

  // Comandos estáticos
  const defaultActions: CommandItem[] = [
    {
      id: 'act-agenda',
      category: 'ACCIONES',
      label: 'Nueva Cita en Agenda',
      description: 'Programar turno para cliente y barbero',
      icon: Calendar,
      action: () => handleNavigate(`/app/${slug}/agenda`),
      badge: 'Agenda',
    },
    {
      id: 'act-pos',
      category: 'ACCIONES',
      label: 'Cobrar en Punto de Venta (POS)',
      description: 'Emitir ticket de servicio o producto',
      icon: CreditCard,
      action: () => handleNavigate(`/app/${slug}/pos`),
      badge: 'POS',
    },
    {
      id: 'act-caja',
      category: 'ACCIONES',
      label: 'Caja & Movimientos de Turno',
      description: 'Registrar ingreso, gasto o arqueo de turno',
      icon: Wallet,
      action: () => handleNavigate(`/app/${slug}/caja`),
      badge: 'Caja',
    },
    {
      id: 'act-nuevo-cliente',
      category: 'ACCIONES',
      label: 'Registrar Nuevo Cliente',
      description: 'Crear ficha técnica y preferencias de corte',
      icon: UserPlus,
      action: () => handleNavigate(`/app/${slug}/clientes`),
      badge: 'CRM',
    },
    {
      id: 'act-link-reservas',
      category: 'ACCIONES',
      label: 'Copiar Enlace Público de Reservas',
      description: `Copiar https://.../reservar/${slug}`,
      icon: Share2,
      action: handleCopyPortalLink,
      badge: 'Enlace',
    },
  ]

  const navigationItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      category: 'NAVEGACIÓN',
      label: 'Dashboard Principal',
      description: 'Monitor en vivo de ventas, radar y citas',
      icon: BarChart3,
      action: () => handleNavigate(`/app/${slug}/dashboard`),
    },
    {
      id: 'nav-agenda',
      category: 'NAVEGACIÓN',
      label: 'Agenda & Citas',
      description: 'Calendario multi-silla y lista cronológica',
      icon: Calendar,
      action: () => handleNavigate(`/app/${slug}/agenda`),
    },
    {
      id: 'nav-pos',
      category: 'NAVEGACIÓN',
      label: 'Punto de Venta POS',
      description: 'Catálogo táctil y cobro con ticket térmico',
      icon: CreditCard,
      action: () => handleNavigate(`/app/${slug}/pos`),
    },
    {
      id: 'nav-caja',
      category: 'NAVEGACIÓN',
      label: 'Caja & Turnos',
      description: 'Arqueo ciego, balance y flujo de efectivo',
      icon: Wallet,
      action: () => handleNavigate(`/app/${slug}/caja`),
    },
    {
      id: 'nav-reportes',
      category: 'NAVEGACIÓN',
      label: 'Reportes & Finanzas',
      description: 'Exportación a Excel, liquidación de comisiones',
      icon: BarChart3,
      action: () => handleNavigate(`/app/${slug}/reportes`),
    },
    {
      id: 'nav-clientes',
      category: 'NAVEGACIÓN',
      label: 'Clientes & Fichas Técnicas',
      description: 'Preferencias de fade, historial y fidelización',
      icon: Users,
      action: () => handleNavigate(`/app/${slug}/clientes`),
    },
    {
      id: 'nav-barberos',
      category: 'NAVEGACIÓN',
      label: 'Barberos & Comisiones',
      description: 'Especialistas, horarios y porcentajes',
      icon: Scissors,
      action: () => handleNavigate(`/app/${slug}/barberos`),
    },
    {
      id: 'nav-servicios',
      category: 'NAVEGACIÓN',
      label: 'Servicios & Precios',
      description: 'Tarifario de cortes, barbas y combos',
      icon: Scissors,
      action: () => handleNavigate(`/app/${slug}/servicios`),
    },
    {
      id: 'nav-inventario',
      category: 'NAVEGACIÓN',
      label: 'Inventario & Stock',
      description: 'Productos para reventa y control de existencias',
      icon: Package,
      action: () => handleNavigate(`/app/${slug}/inventario`),
    },
    {
      id: 'nav-configuracion',
      category: 'NAVEGACIÓN',
      label: 'Configuración & Marca Blanca',
      description: 'Logotipo, portada, colores y plantillas WhatsApp',
      icon: Settings,
      action: () => handleNavigate(`/app/${slug}/configuracion`),
    },
    {
      id: 'nav-perfil',
      category: 'NAVEGACIÓN',
      label: 'Mi Perfil & Seguridad',
      description: 'Datos personales, teléfono y cambio de contraseña',
      icon: User,
      action: () => handleNavigate(`/app/${slug}/perfil`),
    },
  ]

  // Clientes dinámicos encontrados
  const clientItems: CommandItem[] = clientResults.map((c) => ({
    id: `client-${c.id}`,
    category: 'CLIENTES',
    label: c.full_name,
    description: `Tel: ${c.phone} • ${c.total_visits} visita${c.total_visits !== 1 ? 's' : ''}`,
    icon: User,
    action: () => handleNavigate(`/app/${slug}/clientes?search=${encodeURIComponent(c.phone)}`),
    badge: 'Cliente',
  }))

  // Filtrado
  const q = query.toLowerCase().trim()
  const filteredActions = defaultActions.filter(
    (a) => a.label.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q))
  )
  const filteredNav = navigationItems.filter(
    (n) => n.label.toLowerCase().includes(q) || (n.description && n.description.toLowerCase().includes(q))
  )

  const allFilteredItems: CommandItem[] = [
    ...clientItems,
    ...filteredActions,
    ...filteredNav,
  ]

  // Navegación por teclado
  const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allFilteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + allFilteredItems.length) % Math.max(1, allFilteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (allFilteredItems[selectedIndex]) {
        allFilteredItems[selectedIndex].action()
      }
    }
  }

  return (
    <>
      {/* Botón trigger en el encabezado visible */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-400 hover:text-white text-xs transition cursor-pointer group shadow-sm"
        title="Buscador global y atajos (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Buscar cliente, módulo o acción...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neutral-900 border border-white/10 text-[10px] font-mono text-neutral-400">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-[#101118] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDownInMenu}
          >
            {/* Input Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-neutral-900/50">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input aria-label="input"
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Escribe para buscar clientes, módulos o atajos..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              {isSearchingClients && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-3 flex-1">
              {allFilteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs text-neutral-400">
                    No se encontraron comandos o clientes para &quot;{query}&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Secciones agrupadas */}
                  {['CLIENTES', 'ACCIONES', 'NAVEGACIÓN'].map((cat) => {
                    const itemsInCat = allFilteredItems.filter((it) => it.category === cat)
                    if (itemsInCat.length === 0) return null

                    return (
                      <div key={cat} className="space-y-1">
                        <span className="px-3 text-[10px] font-mono tracking-widest uppercase text-neutral-500 font-bold block">
                          {cat}
                        </span>
                        {itemsInCat.map((item) => {
                          const globalIdx = allFilteredItems.indexOf(item)
                          const isSelected = selectedIndex === globalIdx
                          const Icon = item.icon

                          return (
                            <div
                              key={item.id}
                              onClick={item.action}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                                  : 'hover:bg-white/[0.04] text-neutral-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition ${
                                    isSelected
                                      ? 'bg-amber-500 text-black border-amber-400'
                                      : 'bg-neutral-900 text-amber-400 border-white/10'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold truncate leading-tight">
                                    {item.label}
                                  </h4>
                                  {item.description && (
                                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.badge && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-400 border border-white/10">
                                    {item.badge}
                                  </span>
                                )}
                                {isSelected && (
                                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Footer Shortcuts */}
            <div className="p-2.5 px-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-white/10 text-neutral-400">↑↓</kbd> Navegar
                </span>
                <span>
                  <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-white/10 text-neutral-400">↵</kbd> Ejecutar
                </span>
              </div>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-white/10 text-neutral-400">ESC</kbd> Cerrar
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
