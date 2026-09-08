'use client'

import { useState } from 'react'
import { X, Loader2, FolderPlus, Trash2, Tag } from 'lucide-react'
import { createCategoryAction, deleteCategoryAction } from '@/actions/services'
import type { ServiceCategory } from '@/types/database.types'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categories: ServiceCategory[]
  organizationId: string
  slug: string
}

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  organizationId,
  slug,
}: CategoryModalProps) {
  const [newCatName, setNewCatName] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return

    setLoading(true)
    setError(null)
    const res = await createCategoryAction(organizationId, newCatName, slug)
    if (res?.error) {
      setError(res.error)
    } else {
      setNewCatName('')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    const res = await deleteCategoryAction(id, organizationId, slug)
    if (res?.error) {
      setError(res.error)
    }
    setDeletingId(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Categorías de Servicios</h3>
              <p className="text-xs text-neutral-400">Organiza tu catálogo para el portal de citas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Crear nueva categoría */}
        <form onSubmit={handleCreate} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ej: Cortes, Barba, Faciales..."
            className="flex-1 px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
            <span>Agregar</span>
          </button>
        </form>

        {/* Lista de categorías existentes */}
        <div className="mt-5 space-y-2 max-h-60 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-center py-6 text-xs text-neutral-500">No hay categorías creadas aún.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-neutral-200 font-medium">{cat.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                  title="Eliminar categoría"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
