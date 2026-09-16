'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, UserCheck, Shield } from 'lucide-react'
import { createBarberAction, updateBarberAction, type BarberInput } from '@/actions/barbers'
import type { OrganizationMember } from '@/types/database.types'

interface BarberFormModalProps {
  isOpen: boolean
  onClose: () => void
  member?: OrganizationMember | null
  organizationId: string
  slug: string
}

export default function BarberFormModal({
  isOpen,
  onClose,
  member,
  organizationId,
  slug,
}: BarberFormModalProps) {
  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'BARBER'>('BARBER')
  const [commissionRate, setCommissionRate] = useState('40')
  const [specialtiesText, setSpecialtiesText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (member) {
      setFullName(member.full_name)
      setNickname(member.nickname || '')
      setPhone(member.phone || '')
      setRole(member.role)
      setCommissionRate(String(member.commission_rate))
      setSpecialtiesText((member.specialties || []).join(', '))
      setIsActive(member.is_active)
    } else {
      setFullName('')
      setNickname('')
      setPhone('')
      setRole('BARBER')
      setCommissionRate('40')
      setSpecialtiesText('Fade, Barba, Diseños')
      setIsActive(true)
    }
    setError(null)
  }, [member, isOpen])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const specialties = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const input: BarberInput = {
      id: member?.id,
      organization_id: organizationId,
      full_name: fullName,
      nickname: nickname || null,
      phone: phone || null,
      role,
      commission_rate: parseFloat(commissionRate) || 0,
      specialties,
      is_active: isActive,
      slug,
    }

    const res = member ? await updateBarberAction(input) : await createBarberAction(input)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {member ? 'Editar Miembro del Staff' : 'Nuevo Barbero / Staff'}
              </h3>
              <p className="text-xs text-neutral-400">Registra especialistas, comisiones y roles</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nombre y Apellido *
              </label>
              <input aria-label="input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Carlos Méndez"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Apodo o Nombre de Silla
              </label>
              <input aria-label="input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej: Carlitos Barber"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Rol en Sistema
              </label>
              <select aria-label="select"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              >
                <option value="BARBER">Barbero</option>
                <option value="RECEPTIONIST">Recepcionista</option>
                <option value="ADMIN">Administrador</option>
                <option value="OWNER">Dueño / Socio</option>
              </select>
            </div>

            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input aria-label="input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="999888777"
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Comisión (%) *
              </label>
              <input aria-label="input"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Especialidades (Separadas por comas)
            </label>
            <input aria-label="input"
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="Low Fade, Taper, Arreglo de Barba, Freestyle"
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isMemberActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isMemberActiveCheck" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Barbero Activo (Aparece en la agenda y reservas online)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{member ? 'Guardar Cambios' : 'Registrar Barbero'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
