'use client'

import { useState } from 'react'
import ClientsHeader from './ClientsHeader'
import ClientsMetrics from './ClientsMetrics'
import ClientsSearchBar from './ClientsSearchBar'
import ClientsGrid from './ClientsGrid'
import ClientModal from './ClientModal'
import TechnicalSheetModal from './TechnicalSheetModal'
import LoyaltyHistoryModal from './LoyaltyHistoryModal'
import ClientHistoryModal from './ClientHistoryModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import { deleteClientAction } from '@/actions/clients'
import { formatPrice } from '@/lib/utils'
import type { Client, ClientPreference, OrganizationMember, LoyaltyProgramSettings } from '@/types/database.types'

export interface ClientWithPreferences extends Client {
  preferences?: ClientPreference | null
}

interface ClientsClientProps {
  initialClients: ClientWithPreferences[]
  barbers: OrganizationMember[]
  organizationId: string
  loyaltyProgram?: LoyaltyProgramSettings | null
  slug: string
}

export default function ClientsClient({
  initialClients,
  barbers,
  organizationId,
  loyaltyProgram = null,
  slug,
}: ClientsClientProps) {
  const [clients, setClients] = useState<ClientWithPreferences[]>(initialClients)
  const [searchQuery, setSearchQuery] = useState('')
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isTechSheetOpen, setIsTechSheetOpen] = useState(false)
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithPreferences | null>(null)
  const [selectedLoyaltyClient, setSelectedLoyaltyClient] = useState<ClientWithPreferences | null>(null)
  const [selectedHistoryClient, setSelectedHistoryClient] = useState<ClientWithPreferences | null>(null)
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

  function handleOpenLoyalty(client: ClientWithPreferences) {
    setSelectedLoyaltyClient(client)
    setIsLoyaltyModalOpen(true)
  }

  function handleOpenHistory(client: ClientWithPreferences) {
    setSelectedHistoryClient(client)
    setIsHistoryModalOpen(true)
  }

  function handleUpdateClientPoints(clientId: string, newPoints: number) {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, loyalty_points: newPoints } : c))
    )
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
      <ClientsHeader onOpenCreate={handleOpenCreate} />

      {/* KPI Stats Strip */}
      <ClientsMetrics
        totalClients={totalClients}
        totalVisits={totalVisits}
        totalSpent={totalSpent}
      />

      {/* Search Bar */}
      <ClientsSearchBar
        filteredCount={filteredClients.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Clients Grid */}
      <ClientsGrid
        filteredClients={filteredClients}
        searchQuery={searchQuery}
        loyaltyProgram={loyaltyProgram}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onOpenTechSheet={handleOpenTechSheet}
        onOpenLoyalty={handleOpenLoyalty}
        onOpenHistory={handleOpenHistory}
        onDeletePrompt={handleDeletePrompt}
      />

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

      <LoyaltyHistoryModal
        isOpen={isLoyaltyModalOpen}
        onClose={() => {
          setIsLoyaltyModalOpen(false)
          setSelectedLoyaltyClient(null)
        }}
        client={selectedLoyaltyClient}
        loyaltyProgram={loyaltyProgram}
        organizationId={organizationId}
        slug={slug}
        onUpdateClientPoints={handleUpdateClientPoints}
      />

      <ClientHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedHistoryClient(null)
        }}
        client={selectedHistoryClient}
        organizationId={organizationId}
        barberiaName={slug}
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
