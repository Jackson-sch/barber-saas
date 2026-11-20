'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  UserCheck,
  Shield,
  User,
  Scissors,
  Phone,
  Percent,
  Lock,
  CheckCircle2,
  Crown,
} from 'lucide-react'
import { createBarberAction, updateBarberAction, type BarberInput } from '@/actions/barbers'
import type { OrganizationMember } from '@/types/database.types'

interface BarberFormModalProps {
  isOpen: boolean
  onClose: () => void
  member?: OrganizationMember | null
  activeMembersCount?: number
  organizationId: string
  slug: string
}

const ROLE_OPTIONS = [
  { id: 'BARBER' as const, label: 'Barbero', desc: 'Agenda y atención', icon: Scissors },
  { id: 'RECEPTIONIST' as const, label: 'Recepcionista', desc: 'Agenda, POS y Caja', icon: UserCheck },
  { id: 'ADMIN' as const, label: 'Administrador', desc: 'Gestión y reportes', icon: Shield },
  { id: 'OWNER' as const, label: 'Dueño / Socio', desc: 'Control total', icon: Crown },
]

const SPECIALTY_PRESETS = [
  'Low Fade',
  'Taper Fade',
  'Corte Clásico',
  'Arreglo de Barba',
  'Toalla Caliente',
  'Freestyle / Diseños',
]

export default function BarberFormModal({
  isOpen,
  onClose,
  member,
  activeMembersCount = 1,
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

  const isOwnerMember = member?.role === 'OWNER'
  const isSoleActiveMember = Boolean(member && activeMembersCount <= 1 && member.is_active)
  const cannotDeactivate = Boolean(isOwnerMember || isSoleActiveMember)

  useEffect(() => {
    if (member) {
      setFullName(member.full_name)
      setNickname(member.nickname || '')
      setPhone(member.phone || '')
      setRole(member.role)
      setCommissionRate(String(member.commission_rate))
      setSpecialtiesText((member.specialties || []).join(', '))
      setIsActive(member.role === 'OWNER' ? true : member.is_active)
    } else {
      setFullName('')
      setNickname('')
      setPhone('')
      setRole('BARBER')
      setCommissionRate('40')
      setSpecialtiesText('Low Fade, Arreglo de Barba, Corte Clásico')
      setIsActive(true)
    }
    setError(null)
  }, [member, isOpen])

  if (!isOpen) return null

  function toggleSpecialtyPreset(preset: string) {
    const current = specialtiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const exists = current.some((s) => s.toLowerCase() === preset.toLowerCase())
    const next = exists
      ? current.filter((s) => s.toLowerCase() !== preset.toLowerCase())
      : [...current, preset]
    setSpecialtiesText(next.join(', '))
  }

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
      role: isOwnerMember ? 'OWNER' : role,
      commission_rate: parseFloat(commissionRate) || 0,
      specialties,
      is_active: cannotDeactivate ? true : isActive,
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

  const currentSpecialtiesList = specialtiesText
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0E15] border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">
                {member ? 'Editar Miembro del Staff' : 'Nuevo Barbero / Staff'}
              </h3>
              <p className="text-xs text-neutral-400">
                Configura datos del especialista, rol operativo y porcentaje de comisión
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl hover:bg-white/[0.06] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Fila 1: Nombre y Apodo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="barber_full_name"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Nombre y Apellido *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="barber_full_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Carlos Méndez"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="barber_nickname"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Apodo o Nombre de Silla
              </label>
              <div className="relative">
                <Scissors className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="barber_nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ej: Carlitos Barber"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Teléfono y Comisión (2 columnas perfectamente alineadas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="barber_phone"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="barber_phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="999 888 777"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="barber_commission"
                  className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider"
                >
                  Comisión (%) *
                </label>
                <div className="flex items-center gap-1">
                  {['40', '50', '60'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionRate(pct)}
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono border transition cursor-pointer ${
                        commissionRate === pct
                          ? 'bg-amber-500 text-black border-amber-400 font-bold'
                          : 'bg-[#090A0E] text-neutral-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="barber_commission"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Rol en el Sistema */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Rol en el Sistema
              </span>
              {isOwnerMember && (
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Rol de propietario protegido
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = role === opt.id
                const isDisabled = Boolean(isOwnerMember && opt.id !== 'OWNER')
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setRole(opt.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                        : isDisabled
                          ? 'bg-[#090A0E]/40 border-white/[0.04] text-neutral-600 cursor-not-allowed'
                          : 'bg-[#090A0E] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5 leading-tight">
                        {opt.desc}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fila 4: Especialidades con Chips Rápidos */}
          <div>
            <label
              htmlFor="barber_specialties"
              className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Especialidades (Separadas por comas)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {SPECIALTY_PRESETS.map((preset) => {
                const active = currentSpecialtiesList.includes(preset.toLowerCase())
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => toggleSpecialtyPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                        : 'bg-[#090A0E] border-white/[0.07] text-neutral-400 hover:text-white'
                    }`}
                  >
                    + {preset}
                  </button>
                )
              })}
            </div>
            <input
              id="barber_specialties"
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="Low Fade, Taper, Arreglo de Barba, Freestyle"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090A0E] border border-white/[0.08] text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Fila 5: Estado del Barbero (Protegido si es Dueño o único barbero activo) */}
          <div className="p-3.5 rounded-2xl bg-[#090A0E] border border-white/[0.07] flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              {cannotDeactivate ? (
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <input
                  type="checkbox"
                  id="isMemberActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500 w-4 h-4 mt-1 cursor-pointer"
                />
              )}
              <div>
                <label
                  htmlFor={cannotDeactivate ? undefined : 'isMemberActiveCheck'}
                  className={`text-xs font-bold block ${
                    cannotDeactivate ? 'text-amber-300' : 'text-white cursor-pointer'
                  }`}
                >
                  {cannotDeactivate
                    ? isOwnerMember
                      ? 'Propietario Siempre Activo'
                      : 'Único Barbero Activo del Salón'
                    : 'Barbero Activo (Aparece en agenda y reservas online)'}
                </label>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  {cannotDeactivate
                    ? 'El dueño o único barbero activo no puede desactivarse a sí mismo para mantener operativo el panel y el portal de citas.'
                    : 'Si lo desactivas temporalmente, no recibirá nuevas reservas online.'}
                </p>
              </div>
            </div>

            {cannotDeactivate && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase shrink-0">
                Activo
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
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
