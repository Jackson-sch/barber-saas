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
