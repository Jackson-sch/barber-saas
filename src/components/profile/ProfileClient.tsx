'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  KeyRound,
  Camera,
  Check,
  Building,
  Calendar,
} from 'lucide-react'
import { updateUserProfileInfoAction, updateUserPasswordAction } from '@/actions/auth'
import { toast } from 'sonner'

interface ProfileClientProps {
  slug: string
  user: {
    id: string
    email: string
    fullName: string
    phone: string | null
    avatarUrl: string | null
    role: string
    joinedAt?: string
  }
  organizationName: string
}

export default function ProfileClient({ slug, user, organizationName }: ProfileClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')

  // Estado Información Personal
  const [fullName, setFullName] = useState(user.fullName || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)

  // Estado Seguridad y Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setInfoError('La imagen no debe superar los 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavingInfo(true)
    setInfoError(null)
    setInfoSuccess(false)

    try {
      const res = await updateUserProfileInfoAction({
        fullName,
        phone,
        avatarUrl,
        slug,
      })

      if (res?.error) {
        setInfoError(res.error)
        toast.error(res.error)
      } else {
        setInfoSuccess(true)
        toast.success('Perfil actualizado con éxito.')
        router.refresh()
        setTimeout(() => setInfoSuccess(false), 3000)
      }
    } catch (err: any) {
      setInfoError(err.message || 'Error al guardar los datos')
      toast.error('Error al guardar datos')
    } finally {
      setSavingInfo(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.')
      return
    }

    setUpdatingPassword(true)

    try {
      const res = await updateUserPasswordAction({
        currentPassword,
        newPassword,
      })

      if (res?.error) {
        setPasswordError(res.error)
        toast.error(res.error)
      } else {
        setPasswordSuccess(true)
        toast.success('Contraseña actualizada correctamente.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 4000)
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error al actualizar contraseña')
      toast.error('Error al actualizar contraseña')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Mi Cuenta
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-neutral-400 font-mono">Seguridad & Credenciales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Perfil de Usuario
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Administra tu información personal de acceso y la seguridad de tu cuenta en{' '}
            <strong className="text-neutral-200">{organizationName}</strong>.
          </p>
        </div>

        {/* Resumen del Rol */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0D0E15] border border-white/10 self-start sm:self-auto">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{fullName.charAt(0) || user.email.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{fullName || user.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                {user.role === 'OWNER'
                  ? 'Dueño'
                  : user.role === 'ADMIN'
                    ? 'Administrador'
                    : user.role === 'BARBER'
                      ? 'Barbero'
                      : 'Recepcionista'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`py-2.5 px-4 rounded-t-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'info'
              ? 'bg-[#0D0E15] text-amber-400 border-t border-x border-white/10 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Datos Personales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-2.5 px-4 rounded-t-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#0D0E15] text-amber-400 border-t border-x border-white/10 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Seguridad & Contraseña</span>
        </button>
      </div>

      {/* TAB 1: DATOS PERSONALES */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="space-y-5">
          <div className="p-6 rounded-2xl bg-[#0D0E15] border border-white/[0.08] space-y-6">
            {/* Foto de Perfil */}
            <div>
              <label htmlFor="field" className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-[#090A0E] border-2 border-white/10 overflow-hidden flex items-center justify-center text-neutral-400 shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 opacity-40" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="field" className="py-2 px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition inline-flex items-center gap-2 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cambiar Foto</span>
                    <input aria-label="input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    Formatos JPG, PNG o WebP. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Campos de texto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nombre Completo *
                </label>
                <input aria-label="input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Teléfono Móvil
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input aria-label="input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="987 654 321"
                    className="w-full pl-9 pr-3 p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Correo Electrónico (No modificable)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input aria-label="input"
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-9 pr-3 p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 text-neutral-400 text-xs font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Barbería Vinculada
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input aria-label="input"
                    type="text"
                    disabled
                    value={organizationName}
                    className="w-full pl-9 pr-3 p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 text-neutral-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Mensajes de feedback */}
            {infoSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tus datos personales se han guardado correctamente.</span>
              </div>
            )}

            {infoError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{infoError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingInfo}
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {savingInfo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SEGURIDAD & CONTRASEÑA */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="p-6 rounded-2xl bg-[#0D0E15] border border-white/[0.08] space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cambiar Contraseña de Acceso
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Asegura tu cuenta con una contraseña fuerte de al menos 6 caracteres.
              </p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Contraseña Actual *
                </label>
                <input aria-label="input"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nueva Contraseña *
                </label>
                <input aria-label="input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label htmlFor="field" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirmar Nueva Contraseña *
                </label>
                <input aria-label="input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full p-2.5 rounded-xl bg-[#090A0E] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Mensajes de feedback */}
            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tu contraseña ha sido actualizada con éxito. Úsala en tu próximo inicio de sesión.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updatingPassword}
              className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {updatingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>Actualizar Contraseña</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
