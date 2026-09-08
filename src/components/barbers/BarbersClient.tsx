'use client'

import { useState } from 'react'
import {
  UserCheck,
  Plus,
  Calendar,
  Edit2,
  Phone,
  Percent,
  CheckCircle2,
  XCircle,
  Shield,
  Scissors,
  Search,
} from 'lucide-react'
import BarberFormModal from './BarberFormModal'
import BarberScheduleModal from './BarberScheduleModal'
import { toggleBarberStatusAction } from '@/actions/barbers'
import type { OrganizationMember, BarberSchedule } from '@/types/database.types'

interface BarbersClientProps {
  initialMembers: OrganizationMember[]
  schedules: BarberSchedule[]
  organizationId: string
  slug: string
}

export default function BarbersClient({
  initialMembers,
  schedules,
  organizationId,
  slug,
}: BarbersClientProps) {
  const [members, setMembers] = useState<OrganizationMember[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null)

  if (initialMembers !== members) {
    setMembers(initialMembers)
  }

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase()
    return (
      m.full_name.toLowerCase().includes(q) ||
      (m.nickname && m.nickname.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    )
  })

  async function handleToggleStatus(m: OrganizationMember) {
    await toggleBarberStatusAction(m.id, organizationId, !m.is_active, slug)
  }

  function handleOpenCreate() {
    setSelectedMember(null)
    setIsFormModalOpen(true)
  }

  function handleOpenEdit(m: OrganizationMember) {
    setSelectedMember(m)
    setIsFormModalOpen(true)
  }

  function handleOpenSchedule(m: OrganizationMember) {
    setSelectedMember(m)
    setIsScheduleModalOpen(true)
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    OWNER: { label: 'Dueño', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ADMIN: { label: 'Administrador', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    RECEPTIONIST: { label: 'Recepción', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    BARBER: { label: 'Barbero', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Barberos & Equipo
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestiona tu staff, comisiones individuales y horarios de atención.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Barbero / Staff</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex justify-between items-center">
        <span className="text-xs text-neutral-400 font-medium">
          Total de integrantes: <strong className="text-white">{members.length}</strong>
        </span>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar barbero o apodo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredMembers.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
          <UserCheck className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No se encontraron barberos</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Registra a los profesionales que atienden en tu barbería para habilitar sus agendas y comisiones.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Barbero</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const roleBadge = roleLabels[member.role] || roleLabels.BARBER
            return (
              <div
                key={member.id}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                  member.is_active
                    ? 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700'
                    : 'bg-neutral-950/50 border-neutral-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
                        {member.nickname ? member.nickname.charAt(0).toUpperCase() : member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {member.full_name}
                        </h3>
                        {member.nickname && (
                          <p className="text-xs text-amber-400/90 font-medium">"{member.nickname}"</p>
                        )}
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${roleBadge.color}`}
                          >
                            {roleBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Comisión</span>
                      <span className="text-base font-bold text-white flex items-center justify-end gap-0.5">
                        {member.commission_rate}%
                      </span>
                    </div>
                  </div>

                  {/* Teléfono & Especialidades */}
                  <div className="mt-4 space-y-2 text-xs">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{member.phone}</span>
                      </div>
                    )}

                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {member.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones del Barbero */}
                <div className="mt-5 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(member)}
                    className={`text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      member.is_active
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-neutral-500 hover:text-neutral-400'
                    }`}
                  >
                    {member.is_active ? (
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(member)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                      title="Configurar horario"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Horario</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
                      title="Editar perfil"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <BarberFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        member={selectedMember}
        organizationId={organizationId}
        slug={slug}
      />

      <BarberScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        member={selectedMember}
        existingSchedules={schedules}
        organizationId={organizationId}
        slug={slug}
      />
    </div>
  )
}
