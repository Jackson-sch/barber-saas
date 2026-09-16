'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Sparkles, Scissors, ShieldAlert, Heart, Check } from 'lucide-react'
import { saveClientPreferencesAction, type ClientPreferencesInput } from '@/actions/clients'
import type { Client, ClientPreference, OrganizationMember } from '@/types/database.types'

interface TechnicalSheetModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  preferences?: ClientPreference | null
  barbers: OrganizationMember[]
  organizationId: string
  slug: string
}

const FADE_TYPES = [
  'Low Fade (Bajo)',
  'Mid Fade (Medio)',
  'High Fade (Alto)',
  'Taper Fade (Patillas y nuca)',
  'Corte Clásico a Tijera',
  'Mullet / Moicano',
  'Burst Fade',
]

const GUARD_NUMBERS = [
  '0 (Al ras / Shaver)',
  '0.5',
  '1',
  '1.5',
  '2',
  '3',
  'Tijera',
]

const BEARD_STYLES = [
  'Perfilada con navaja',
  'Degradada (Fade de barba)',
  'Afeitado completo toalla caliente',
  'Barba completa natural',
  'Solo bigote',
  'Sin barba',
]

export default function TechnicalSheetModal({
  isOpen,
  onClose,
  client,
  preferences,
  barbers,
  organizationId,
  slug,
}: TechnicalSheetModalProps) {
  const [fadeType, setFadeType] = useState('')
  const [guardNumber, setGuardNumber] = useState('')
  const [topLength, setTopLength] = useState('')
  const [beardStyle, setBeardStyle] = useState('')
  const [allergies, setAllergies] = useState('')
  const [favoriteBarberId, setFavoriteBarberId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (preferences) {
      setFadeType(preferences.hair_fade_type || '')
      setGuardNumber(preferences.hair_guard_number || '')
      setTopLength(preferences.hair_top_length || '')
      setBeardStyle(preferences.beard_style || '')
      setAllergies(preferences.allergies_notes || '')
      setFavoriteBarberId(preferences.favorite_barber_id || '')
    } else {
      setFadeType('')
      setGuardNumber('')
      setTopLength('')
      setBeardStyle('')
      setAllergies('')
      setFavoriteBarberId('')
    }
    setError(null)
    setSaved(false)
  }, [preferences, isOpen])

  if (!isOpen || !client) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!client) return
    setError(null)
    setLoading(true)

    const input: ClientPreferencesInput = {
      client_id: client.id,
      organization_id: organizationId,
      hair_fade_type: fadeType || null,
      hair_guard_number: guardNumber || null,
      hair_top_length: topLength || null,
      beard_style: beardStyle || null,
      allergies_notes: allergies || null,
      favorite_barber_id: favoriteBarberId || null,
      slug,
    }

    const res = await saveClientPreferencesAction(input)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setSaved(true)
      setLoading(false)
      setTimeout(() => {
        onClose()
      }, 700)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ficha Técnica de Estilo</h3>
              <p className="text-xs text-neutral-400">
                Preferencias de corte para: <strong className="text-amber-400">{client.full_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Tipo de Degradado */}
          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Tipo de Degradado / Fade
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FADE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFadeType(fadeType === type ? '' : type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    fadeType === type
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Guía o Peine Base */}
          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Peine o Guía Base de Inicio
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GUARD_NUMBERS.map((guard) => (
                <button
                  key={guard}
                  type="button"
                  onClick={() => setGuardNumber(guardNumber === guard ? '' : guard)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    guardNumber === guard
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {guard}
                </button>
              ))}
            </div>
          </div>

          {/* Peinado y Largo Superior */}
          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Largo y Estilo Superior
            </label>
            <input aria-label="Ej: 3 dedos de largo, texturizado con tijera de entresacar, peinado al costado"
              type="text"
              placeholder="Ej: 3 dedos de largo, texturizado con tijera de entresacar, peinado al costado"
              value={topLength}
              onChange={(e) => setTopLength(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Estilo de Barba */}
          <div>
            <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Diseño de Barba
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BEARD_STYLES.map((beard) => (
                <button
                  key={beard}
                  type="button"
                  onClick={() => setBeardStyle(beardStyle === beard ? '' : beard)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    beardStyle === beard
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {beard}
                </button>
              ))}
            </div>
          </div>

          {/* Sensibilidad / Alergias */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Sensibilidad de Piel / Alergias (Aviso para el Barbero)
              </label>
            </div>
            <input aria-label="Ej: Piel muy sensible, no usar aftershave con alcohol, enrojecimiento con navaja"
              type="text"
              placeholder="Ej: Piel muy sensible, no usar aftershave con alcohol, enrojecimiento con navaja"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Barbero Preferido */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Barbero Preferido
              </label>
            </div>
            <select aria-label="select"
              value={favoriteBarberId}
              onChange={(e) => setFavoriteBarberId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
            >
              <option value="">Cualquier barbero disponible</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nickname ? `${b.nickname} (${b.full_name})` : b.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
              <span>{saved ? 'Ficha Guardada' : 'Guardar Ficha Técnica'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
