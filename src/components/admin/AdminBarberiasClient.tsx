'use client'

import { useState } from 'react'
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Pencil,
} from 'lucide-react'
import { toggleOrganizationStatusAction, approveOrganizationAction } from '@/actions/subscription'
import { formatDateOnly } from '@/lib/utils'
import EditBarberiaModal from './EditBarberiaModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import Link from 'next/link'
import type { Organization, OrganizationSubscription } from '@/types/database.types'
import { Clock } from 'lucide-react'

export interface OrgWithSubscription extends Organization {
  subscription?: OrganizationSubscription | null
}

interface AdminBarberiasClientProps {
  initialOrgs: OrgWithSubscription[]
}

export default function AdminBarberiasClient({ initialOrgs }: AdminBarberiasClientProps) {
  const [orgs, setOrgs] = useState<OrgWithSubscription[]>(initialOrgs)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingOrg, setEditingOrg] = useState<OrgWithSubscription | null>(null)
  const [togglingOrg, setTogglingOrg] = useState<OrgWithSubscription | null>(null)
  const [approvingOrg, setApprovingOrg] = useState<OrgWithSubscription | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (initialOrgs !== orgs) {
    setOrgs(initialOrgs)
  }

  function getOrgApprovalStatus(org: OrgWithSubscription): 'PENDING' | 'APPROVED' | 'SUSPENDED' {
    const settings = (typeof org.settings === 'object' && org.settings !== null ? org.settings : {}) as Record<string, any>
    if (!org.is_active && settings.approval_status === 'PENDING') {
      return 'PENDING'
    }
    if (!org.is_active) {
      return 'SUSPENDED'
    }
    return 'APPROVED'
  }

  const pendingCount = orgs.filter((o) => getOrgApprovalStatus(o) === 'PENDING').length
  const activeCount = orgs.filter((o) => o.is_active).length
  const suspendedCount = orgs.filter((o) => getOrgApprovalStatus(o) === 'SUSPENDED').length

  const filteredOrgs = orgs.filter((o) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      o.name.toLowerCase().includes(q) ||
      o.slug.toLowerCase().includes(q) ||
      (o.phone && o.phone.includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q))

    if (!matchesSearch) return false

    const status = getOrgApprovalStatus(o)
    if (statusFilter === 'PENDING') return status === 'PENDING'
    if (statusFilter === 'ACTIVE') return o.is_active
    if (statusFilter === 'SUSPENDED') return status === 'SUSPENDED'

    return true
  })

  function handleToggleStatus(org: OrgWithSubscription) {
    setTogglingOrg(org)
  }

  async function handleConfirmToggle() {
    if (!togglingOrg) return
    const newStatus = !togglingOrg.is_active
    setLoadingId(togglingOrg.id)
    const res = await toggleOrganizationStatusAction(togglingOrg.id, newStatus)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast(
        'success',
        newStatus
          ? `Barbería "${togglingOrg.name}" reactivada con éxito.`
          : `Barbería "${togglingOrg.name}" suspendida.`
      )
      setOrgs((prev) =>
        prev.map((item) => (item.id === togglingOrg.id ? { ...item, is_active: newStatus } : item))
      )
    }
    setLoadingId(null)
    setTogglingOrg(null)
  }

  async function handleConfirmApprove() {
    if (!approvingOrg) return
    setLoadingId(approvingOrg.id)
    const res = await approveOrganizationAction(approvingOrg.id)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', res.message || `Barbería "${approvingOrg.name}" aprobada exitosamente.`)
      setOrgs((prev) =>
        prev.map((item) =>
          item.id === approvingOrg.id
            ? {
                ...item,
                is_active: true,
                settings: {
                  ...((typeof item.settings === 'object' && item.settings !== null ? item.settings : {}) as Record<string, any>),
                  approval_status: 'APPROVED',
                  approved_at: new Date().toISOString(),
                },
              }
            : item
        )
      )
    }
    setLoadingId(null)
    setApprovingOrg(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Directorio de Barberías (Tenants)
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Supervisa las cuentas de barberías registradas, sus planes y controla el acceso global.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'ALL'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Todas</span>
          <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-300">
            {orgs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendientes de Aprobación</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-bold text-[10px] animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
              : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-500/10'
          }`}
        >
          <span>Activas</span>
          <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-300">
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
            statusFilter === 'SUSPENDED'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-semibold'
              : 'text-neutral-400 hover:text-red-300 hover:bg-red-500/10'
          }`}
        >
          <span>Suspendidas</span>
          <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-300">
            {suspendedCount}
          </span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <span className="text-xs text-neutral-400">
          Mostrando: <strong className="text-white">{filteredOrgs.length}</strong> de {orgs.length} barberías
        </span>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input aria-label="Buscar por nombre, slug o teléfono..."
            type="text"
            placeholder="Buscar por nombre, slug o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Grid of Tenants */}
      {filteredOrgs.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
          <Building2 className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No se encontraron barberías con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map((org) => {
            const sub = org.subscription
            const planTier = sub?.plan_tier || 'TRIAL'
            const subStatus = sub?.status || 'TRIAL'
            const endDate = sub?.current_period_end ? new Date(sub.current_period_end) : new Date(org.trial_ends_at)
            const isProcessing = loadingId === org.id
            const approvalStatus = getOrgApprovalStatus(org)

            return (
              <div
                key={org.id}
                className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-base">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">{org.name}</h3>
                        <span className="text-xs text-amber-400 font-mono">/{org.slug}</span>
                      </div>
                    </div>

                    {approvalStatus === 'PENDING' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        Pendiente
                      </span>
                    ) : org.is_active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Activa
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        Suspendida
                      </span>
                    )}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
                    {org.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{org.phone}</span>
                      </div>
                    )}
                    {org.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="truncate">{org.email}</span>
                      </div>
                    )}
                    {org.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{org.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Plan Details */}
                  <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Plan Actual:</span>
                      <span className="font-bold text-white">{planTier}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500">Estado Suscripción:</span>
                      <span className="font-semibold text-amber-400 uppercase">{subStatus}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-neutral-800/60 text-[11px]">
                      <span className="text-neutral-500">Vence:</span>
                      <span className="text-neutral-300 font-mono text-[11px]" suppressHydrationWarning>
                        {formatDateOnly(endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/reservar/${org.slug}`}
                      target="_blank"
                      className="text-xs text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1.5 font-medium py-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
                    >
                      <span>Ver Portal Público</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingOrg(org)}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/10 text-neutral-200 border border-white/10 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Pencil className="w-3 h-3 text-amber-400" />
                      <span>Editar</span>
                    </button>

                    {approvalStatus === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => setApprovingOrg(org)}
                        disabled={isProcessing}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Aprobar Salón</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(org)}
                        disabled={isProcessing}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1 ${
                          org.is_active
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{org.is_active ? 'Suspender' : 'Reactivar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Edición SuperAdmin */}
      <EditBarberiaModal
        isOpen={!!editingOrg}
        onClose={() => setEditingOrg(null)}
        org={editingOrg}
      />

      {/* Modal de Confirmación Aprobar Barbería */}
      <ConfirmModal
        isOpen={!!approvingOrg}
        onClose={() => setApprovingOrg(null)}
        onConfirm={handleConfirmApprove}
        variant="primary"
        title="Aprobar y Activar Barbería"
        description={`¿Deseas autorizar el acceso y activar la barbería "${approvingOrg?.name}"? Esta acción habilitará el acceso completo para su administrador e iniciará sus 14 días de prueba gratuita.`}
        confirmText="Sí, Aprobar y Activar"
        cancelText="Revisar luego"
        loading={!!loadingId}
        details={
          approvingOrg
            ? [
                { label: 'Barbería', value: approvingOrg.name },
                { label: 'Slug', value: `/${approvingOrg.slug}` },
                { label: 'Teléfono', value: approvingOrg.phone || 'No especificado' },
                { label: 'Email', value: approvingOrg.email || 'No especificado' },
                { label: 'Ciudad', value: approvingOrg.city || 'No especificada' },
              ]
            : undefined
        }
      />

      {/* Modal de Confirmación Suspender/Reactivar */}
      <ConfirmModal
        isOpen={!!togglingOrg}
        onClose={() => setTogglingOrg(null)}
        onConfirm={handleConfirmToggle}
        variant={togglingOrg?.is_active ? 'danger' : 'success'}
        title={togglingOrg?.is_active ? 'Suspender Barbería' : 'Reactivar Barbería'}
        description={
          togglingOrg?.is_active
            ? `¿Estás seguro de suspender "${togglingOrg.name}"? Sus barberos y clientes no podrán acceder ni realizar reservas mientras esté suspendida.`
            : `¿Deseas reactivar el acceso para "${togglingOrg?.name}"? Sus funciones y reservas quedarán disponibles de inmediato.`
        }
        confirmText={togglingOrg?.is_active ? 'Sí, suspender' : 'Sí, reactivar'}
        loading={!!loadingId}
        details={
          togglingOrg
            ? [
                { label: 'Barbería', value: togglingOrg.name },
                { label: 'Slug / URL', value: `/reservar/${togglingOrg.slug}` },
                {
                  label: 'Estado actual',
                  value: togglingOrg.is_active ? (
                    <span className="text-emerald-400 font-semibold">Activa</span>
                  ) : (
                    <span className="text-red-400 font-semibold">Suspendida</span>
                  ),
                },
              ]
            : undefined
        }
      />

      {/* Notificaciones flotantes */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
