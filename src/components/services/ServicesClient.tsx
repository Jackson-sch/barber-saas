'use client'

import { useState } from 'react'
import {
  Scissors,
  Plus,
  FolderTree,
  Edit2,
  Trash2,
  Clock,
  Percent,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react'
import { formatPrice, formatMinutes } from '@/lib/utils'
import { toggleServiceStatusAction, deleteServiceAction } from '@/actions/services'
import ServiceFormModal from './ServiceFormModal'
import CategoryModal from './CategoryModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ToastContainer, { type ToastMessage } from '@/components/ui/Toast'
import type { Service, ServiceCategory } from '@/types/database.types'

interface ServicesClientProps {
  initialServices: Service[]
  categories: ServiceCategory[]
  organizationId: string
  slug: string
}

export default function ServicesClient({
  initialServices,
  categories,
  organizationId,
  slug,
}: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(type: 'success' | 'error', text: string) {
    setToasts((prev) => [...prev, { id: Math.random().toString(), type, text }])
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Sincronizar si cambia initialServices
  if (initialServices !== services) {
    setServices(initialServices)
  }

  const filteredServices = services.filter((svc) => {
    const matchesCategory =
      selectedCategory === 'ALL'
        ? true
        : selectedCategory === 'UNCATEGORIZED'
        ? !svc.category_id
        : svc.category_id === selectedCategory

    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  async function handleToggleStatus(svc: Service) {
    const newStatus = !svc.is_active
    await toggleServiceStatusAction(svc.id, organizationId, newStatus, slug)
  }

  function handleDeletePrompt(svc: Service) {
    setServiceToDelete(svc)
  }

  async function handleConfirmDelete() {
    if (!serviceToDelete) return
    setIsDeleting(true)
    const res = await deleteServiceAction(serviceToDelete.id, organizationId, slug)
    if (res?.error) {
      addToast('error', res.error)
    } else {
      addToast('success', `Servicio "${serviceToDelete.name}" eliminado correctamente.`)
    }
    setIsDeleting(false)
    setServiceToDelete(null)
  }

  function handleOpenCreate() {
    setEditingService(null)
    setIsServiceModalOpen(true)
  }

  function handleOpenEdit(svc: Service) {
    setEditingService(svc)
    setIsServiceModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Servicios & Precios
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configura el catálogo de cortes, tratamientos, comisiones y duraciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Categorías ({categories.length})</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category_id === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input aria-label="Buscar por nombre..."
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
          <Scissors className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No se encontraron servicios</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Prueba a cambiar tus filtros de búsqueda.'
              : 'Agrega tu primer servicio para que tus clientes puedan empezar a reservar.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Servicio Ahora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => {
            const cat = categories.find((c) => c.id === svc.category_id)
            return (
              <div
                key={svc.id}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                  svc.is_active
                    ? 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-neutral-950/50 border-neutral-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider">
                          {cat?.name || 'General'}
                        </span>
                        {!svc.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1 leading-snug">{svc.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">
                      {formatPrice(Number(svc.price))}
                    </span>
                  </div>

                  {svc.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-2 leading-relaxed">
                      {svc.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{formatMinutes(svc.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{svc.commission_percent}% barbero</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(svc)}
                    className={`text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      svc.is_active
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-neutral-500 hover:text-neutral-400'
                    }`}
                  >
                    {svc.is_active ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Inactivo</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(svc)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(svc)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition cursor-pointer"
                      title="Eliminar servicio"
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
      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        service={editingService}
        categories={categories}
        organizationId={organizationId}
        slug={slug}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        organizationId={organizationId}
        slug={slug}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Eliminar Servicio"
        description={`¿Estás seguro de que deseas eliminar "${serviceToDelete?.name}"? Esta acción lo removerá permanentemente del catálogo y del portal de reservas.`}
        confirmText="Sí, eliminar servicio"
        cancelText="Conservar"
        loading={isDeleting}
        details={
          serviceToDelete
            ? [
                { label: 'Servicio', value: serviceToDelete.name },
                { label: 'Precio', value: formatPrice(Number(serviceToDelete.price)) },
                { label: 'Duración', value: formatMinutes(serviceToDelete.duration_minutes) },
                { label: 'Comisión al barbero', value: `${serviceToDelete.commission_percent}%` },
              ]
            : undefined
        }
      />

      {/* Notificaciones flotantes */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
