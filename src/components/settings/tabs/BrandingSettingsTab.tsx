'use client'

import React from 'react'
import {
  Palette,
  Sparkles,
  Upload,
  Trash2,
  Check,
  Image as ImageIcon,
} from 'lucide-react'
import { COLOR_PRESETS, BANNER_PRESETS } from '../types'

interface BrandingSettingsTabProps {
  name: string
  phone: string
  tagline: string
  setTagline: (val: string) => void
  logoUrl: string
  setLogoUrl: (val: string) => void
  bannerUrl: string
  setBannerUrl: (val: string) => void
  primaryColor: string
  setPrimaryColor: (val: string) => void
  isOwner: boolean
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function BrandingSettingsTab({
  name,
  phone,
  tagline,
  setTagline,
  logoUrl,
  setLogoUrl,
  bannerUrl,
  setBannerUrl,
  primaryColor,
  setPrimaryColor,
  isOwner,
  handleLogoUpload,
  handleBannerUpload,
}: BrandingSettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D0E15] border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Palette className="w-4 h-4 text-amber-400" />
            <h2 className="font-bold text-white text-sm">Marca Blanca & Identidad Visual</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Personaliza el logotipo, imagen de portada y color corporativo que verán tus clientes en el portal de reservas y en los comprobantes.
          </p>
        </div>

        {/* 1. Logotipo del Salón */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
          <label className="block text-xs font-semibold text-neutral-200">
            Logotipo Oficial del Salón
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo Preview */}
            <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo Salón"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-amber-400">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Upload & URL Controls */}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer border border-white/10">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subir Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isOwner}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    disabled={!isOwner}
                    onClick={() => setLogoUrl('')}
                    className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition flex items-center gap-1.5 border border-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar Logo</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  disabled={!isOwner}
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="O pega la URL directa del logo (https://...)"
                  className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                Recomendado: Imagen cuadrada (PNG o WebP) con fondo transparente o color sólido.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Portada / Banner de Fondo */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-neutral-200">
              Portada de Fondo para Portal de Reservas
            </label>
            {bannerUrl && (
              <button
                type="button"
                disabled={!isOwner}
                onClick={() => setBannerUrl('')}
                className="text-[11px] text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Quitar portada</span>
              </button>
            )}
          </div>

          {/* Banner Preview */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt="Banner Salón"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-6 h-6 text-neutral-600 mx-auto mb-1" />
                <span className="text-xs text-neutral-500">Sin imagen de portada configurada</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Presets de Portada */}
          <div>
            <p className="text-[11px] text-neutral-400 mb-2">
              O selecciona una de nuestras portadas predeterminadas de barbería:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANNER_PRESETS.map((bp) => (
                <button
                  key={bp.name}
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setBannerUrl(bp.url)}
                  className={`relative rounded-lg overflow-hidden border transition text-left cursor-pointer group h-14 ${
                    bannerUrl === bp.url
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={bp.url}
                    alt={bp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                    <span className="text-[10px] font-semibold text-white truncate leading-tight">
                      {bp.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload or Custom URL */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <label className="py-2 px-3 rounded-xl bg-white/[0.07] hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer border border-white/10 shrink-0 w-full sm:w-auto justify-center">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Subir Portada</span>
              <input
                type="file"
                accept="image/*"
                disabled={!isOwner}
                onChange={handleBannerUpload}
                className="hidden"
              />
            </label>
            <input
              type="url"
              disabled={!isOwner}
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="O ingresa una URL de imagen..."
              className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* 3. Paleta de Color Corporativo */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-3">
          <label className="block text-xs font-semibold text-neutral-200">
            Color de Acento de la Marca
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COLOR_PRESETS.map((cp) => {
              const isSelected = primaryColor.toUpperCase() === cp.hex.toUpperCase()
              return (
                <button
                  key={cp.hex}
                  type="button"
                  disabled={!isOwner}
                  onClick={() => setPrimaryColor(cp.hex)}
                  className={`py-2 px-3 rounded-xl border transition flex items-center gap-2.5 text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-white/30 text-white shadow-sm'
                      : 'bg-[#0D0E15] border-white/10 text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/20"
                    style={{ backgroundColor: cp.hex }}
                  />
                  <span className="truncate">{cp.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Custom Color input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-neutral-400">Color Personalizado:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                disabled={!isOwner}
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
              />
              <input
                type="text"
                disabled={!isOwner}
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-28 p-1.5 rounded-lg bg-[#0D0E15] border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Slogan / Lema Comercial */}
        <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] space-y-2">
          <label className="block text-xs font-semibold text-neutral-200">
            Slogan o Lema Comercial (Opcional)
          </label>
          <input
            type="text"
            disabled={!isOwner}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ej. El arte del corte clásico y cuidado masculino de alta gama"
            className="w-full p-2.5 rounded-xl bg-[#0D0E15] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
          />
          <p className="text-[11px] text-neutral-400">
            Aparecerá en el portal de reservas debajo del nombre de tu salón.
          </p>
        </div>

        {/* 5. Vista Previa en Vivo */}
        <div className="p-5 rounded-2xl bg-neutral-950 border border-white/10 relative overflow-hidden shadow-xl space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Vista Previa en Vivo de tu Marca
          </span>

          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0e1017] p-5">
            {bannerUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs pointer-events-none"
                style={{ backgroundImage: `url(${bannerUrl})` }}
              />
            )}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div
                className="w-16 h-16 rounded-2xl border flex items-center justify-center overflow-hidden shadow-xl shrink-0"
                style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}15` }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black" style={{ color: primaryColor }}>
                    {name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-extrabold text-white tracking-tight">{name}</h3>
                {tagline ? (
                  <p className="text-xs text-neutral-300 italic mt-0.5">{tagline}</p>
                ) : (
                  <p className="text-xs text-neutral-400 mt-0.5">Barbería & Salón Exclusivo</p>
                )}
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-bold text-black shadow-sm inline-block"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Reservar Cita
                  </span>
                  <span className="text-xs text-neutral-400">
                    {phone || '+51 987 654 321'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
