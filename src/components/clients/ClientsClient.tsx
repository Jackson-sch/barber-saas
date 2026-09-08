'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  MessageCircle,
  Edit2,
  Trash2,
  Scissors,
  DollarSign,
  UserCheck,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import ClientModal from './ClientModal'
import TechnicalSheetModal from './TechnicalSheetModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import { deleteClientAction } from '@/actions/clients'
import Link from 'next/link'
import type { Client, ClientPreference, OrganizationMember } from '@/types/database.types'

export interface ClientWithPreferences extends Client {
  preferences?: ClientPreference | null
}

interface ClientsClientProps {
  initialClients: ClientWithPreferences[]
  barbers: OrganizationMember[]
  organizationId: string
  slug: string
}

export default function ClientsClient({
  initialClients,
  barbers,
  organizationId,
  slug,
}: ClientsClientProps) {
  const [clients, setClients] = useState<ClientWithPreferences[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState('')
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isTechSheetOpen, setIsTechSheetOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithPreferences | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ClientWithPreferences | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (initialClients !== clients) {
    setClients(initialClients)
  }

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  // KPIs
  const totalClients = clients.length
  const totalVisits = clients.reduce((acc, c) => acc + (c.total_visits || 0), 0)
  const totalSpent = clients.reduce((acc, c) => acc + Number(c.total_spent || 0), 0)

  function handleOpenCreate() {
    setSelectedClient(null)
    setIsClientModalOpen(true)
  }

  function handleOpenEdit(client: ClientWithPreferences) {
    setSelectedClient(client)
    setIsClientModalOpen(true)
  }

  function handleOpenTechSheet(client: ClientWithPreferences) {
    setSelectedClient(client)
    setIsTechSheetOpen(true)
  }

  function handleDeletePrompt(client: ClientWithPreferences) {
    setClientToDelete(client)
  }

  async function handleConfirmDelete() {
    if (!clientToDelete) return
    setIsDeleting(true)
    const res = await deleteClientAction(clientToDelete.id, organizationId, slug)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', `Ficha del cliente "${clientToDelete.full_name}" eliminada correctamente.`)
    }
    setIsDeleting(false)
    setClientToDelete(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Directorio de Clientes
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Fichas de estilo, preferencias de corte, fidelización e historial de visitas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Clientes Totales</span>
            <p className="text-xl font-bold text-white mt-0.5">{totalClients}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Visitas Acumuladas</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{totalVisits}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Facturación Histórica</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{formatPrice(totalSpent)}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex justify-between items-center">
        <span className="text-xs text-neutral-400 font-medium">
          Mostrando: <strong className="text-white">{filteredClients.length}</strong> clientes
        </span>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No se encontraron clientes</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Prueba a cambiar tu búsqueda o verificar el número de teléfono.'
              : 'Registra a tus clientes habituales para guardar sus preferencias de corte y contactarlos por WhatsApp.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Primer Cliente</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const prefs = client.preferences
            const phoneClean = client.phone?.replace(/\D/g, '') || ''
            const waUrl = phoneClean ? `https://wa.me/51${phoneClean}` : null

            return (
              <div
                key={client.id}
                className="bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-5 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shrink-0">
                        {client.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-white leading-tight truncate">
                          {client.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                    </div>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Visit Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-neutral-800/60 text-xs">
                    <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Visitas
                      </span>
                      <span className="font-bold text-white mt-0.5 block">
                        {client.total_visits || 0} visitas
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Gasto Total
                      </span>
                      <span className="font-bold text-amber-400 mt-0.5 block">
                        {formatPrice(Number(client.total_spent || 0))}
                      </span>
                    </div>
                  </div>

                  {/* Technical Sheet Preview Tags */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                      Ficha de Estilo:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prefs?.hair_fade_type ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                          {prefs.hair_fade_type}
                        </span>
                      ) : null}
                      {prefs?.hair_guard_number ? (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]">
                          Peine: {prefs.hair_guard_number}
                        </span>
                      ) : null}
                      {prefs?.beard_style ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                          {prefs.beard_style}
                        </span>
                      ) : null}
                      {!prefs?.hair_fade_type && !prefs?.hair_guard_number && !prefs?.beard_style && (
                        <span className="text-[11px] text-neutral-600 italic">
                          Sin preferencias registradas aún
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenTechSheet(client)}
                    className="py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ficha Técnica</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                      title="Editar datos"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(client)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={selectedClient}
        organizationId={organizationId}
        slug={slug}
      />

      <TechnicalSheetModal
        isOpen={isTechSheetOpen}
        onClose={() => setIsTechSheetOpen(false)}
        client={selectedClient}
        preferences={selectedClient?.preferences}
        barbers={barbers}
        organizationId={organizationId}
        slug={slug}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Ficha de Cliente"
        description={`¿Estás seguro de que deseas eliminar permanentemente a "${clientToDelete?.full_name}"? Esta acción no se puede deshacer y borrará sus preferencias técnicas, notas y su historial de visitas.`}
        confirmText="Sí, eliminar cliente"
        cancelText="Conservar"
        loading={isDeleting}
        details={
          clientToDelete
            ? [
                { label: 'Cliente', value: clientToDelete.full_name },
                { label: 'Teléfono', value: clientToDelete.phone },
                { label: 'Visitas registradas', value: `${clientToDelete.total_visits || 0}` },
                {
                  label: 'Total consumido',
                  value: formatPrice(Number(clientToDelete.total_spent || 0)),
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
