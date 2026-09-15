'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || ''

  if (!email || !password) {
    return { error: 'Por favor ingresa tu correo y contraseña' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: 'Credenciales inválidas o correo no registrado' }
  }

  // Si tiene redirección explícita, usarla
  if (redirectTo && redirectTo.startsWith('/app/')) {
    redirect(redirectTo)
  }

  // Verificar si es superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', data.user.id)
    .single()

  if (profile?.is_super_admin) {
    redirect('/admin')
  }

  // Buscar a qué organizaciones pertenece el usuario
  const { data: member } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      organizations (slug)
    `)
    .eq('user_id', data.user.id)
    .limit(1)
    .single()

  const orgSlug = (member?.organizations as unknown as { slug: string })?.slug

  if (orgSlug) {
    redirect(`/app/${orgSlug}/dashboard`)
  }

  redirect('/registro-barberia')
}

export async function logoutAction(slug?: string) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  if (slug) {
    redirect(`/login?redirect=/app/${slug}/dashboard`)
  }
  redirect('/login')
}

export async function requestPasswordResetAction(email: string) {
  if (!email || !email.includes('@')) {
    return { error: 'Por favor ingresa un correo electrónico válido' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?reset=success`,
    })

    if (error) {
      return { error: error.message || 'No se pudo enviar el correo de recuperación.' }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Error in requestPasswordResetAction:', err)
    return { error: 'Error inesperado al solicitar el restablecimiento.' }
  }
}

interface UpdateProfileInput {
  fullName: string
  phone?: string | null
  avatarUrl?: string | null
  slug?: string
}

export async function updateUserProfileInfoAction(input: UpdateProfileInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado.' }

    const fullName = input.fullName.trim()
    if (!fullName || fullName.length < 2) {
      return { error: 'El nombre debe tener al menos 2 caracteres.' }
    }

    const phone = input.phone?.trim() || null
    const avatarUrl = input.avatarUrl?.trim() || null

    // 1. Actualizar tabla profiles
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileErr) {
      console.error('Error updating profiles table:', profileErr)
      return { error: 'Error al actualizar el perfil en base de datos.' }
    }

    // 2. Sincronizar en organization_members vinculados al usuario
    await supabase
      .from('organization_members')
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      })
      .eq('user_id', user.id)

    // 3. Actualizar metadata de auth
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    return { success: true }
  } catch (err: any) {
    console.error('Error in updateUserProfileInfoAction:', err)
    return { error: err.message || 'Error inesperado al guardar perfil.' }
  }
}

interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
}

export async function updateUserPasswordAction(input: UpdatePasswordInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) return { error: 'No autenticado.' }

    if (!input.currentPassword) {
      return { error: 'Ingresa tu contraseña actual.' }
    }

    if (!input.newPassword || input.newPassword.length < 6) {
      return { error: 'La nueva contraseña debe tener al menos 6 caracteres.' }
    }

    // 1. Verificar contraseña actual intentando autenticación
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: input.currentPassword,
    })

    if (verifyErr) {
      return { error: 'La contraseña actual ingresada es incorrecta.' }
    }

    // 2. Actualizar a la nueva contraseña
    const { error: updateErr } = await supabase.auth.updateUser({
      password: input.newPassword,
    })

    if (updateErr) {
      return { error: updateErr.message || 'Error al actualizar la contraseña.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Error in updateUserPasswordAction:', err)
    return { error: err.message || 'Error al cambiar la contraseña.' }
  }
}


