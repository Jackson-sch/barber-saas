'use server'

import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { validateHoneypot, validateSubmissionSpeed } from '@/lib/anti-spam'

export interface RegisterBarbershopParams {
  ownerName: string
  barbershopName: string
  email: string
  password: string
  phone: string
  city?: string
  honeypot?: string
  formLoadedAt?: number
}

export async function registerBarbershopAction(params: RegisterBarbershopParams) {
  const { ownerName, barbershopName, email, password, phone, city, honeypot, formLoadedAt } = params

  // 0. Validación Anti-Spam y Anti-Bots
  if (!validateHoneypot(honeypot)) {
    console.warn('[Anti-Spam] Bloqueado registro por Honeypot detectado:', { email, barbershopName })
    return { error: 'Solicitud no procesada (detección de actividad automatizada).' }
  }

  if (!validateSubmissionSpeed(formLoadedAt)) {
    console.warn('[Anti-Spam] Bloqueado registro por Time-Gate (demasiado veloz):', { email })
    return { error: 'Envío demasiado rápido. Por favor tómate un momento para revisar tus datos.' }
  }

  if (!ownerName || !barbershopName || !email || !password || !phone) {
    return { error: 'Todos los campos obligatorios deben ser completados' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }


  // 1. Generar slug único
  let baseSlug = slugify(barbershopName)
  if (!baseSlug || baseSlug.length < 2) {
    baseSlug = 'barberia'
  }

  let finalSlug = baseSlug
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', finalSlug)
    .single()

  if (existingOrg) {
    finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
  }

  // 2. Registrar usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: ownerName,
        phone: phone,
      },
    },
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Error al crear la cuenta de usuario' }
  }

  const userId = authData.user.id

  // 3. Crear Organización (Tenant) en estado PENDIENTE DE APROBACIÓN
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: barbershopName,
      slug: finalSlug,
      email: email,
      phone: phone,
      city: city || 'Lima',
      primary_color: '#d97706', // Ámbar Barber Studio
      secondary_color: '#0f172a',
      is_active: false, // Inactivo hasta aprobación por SuperAdmin
      settings: {
        approval_status: 'PENDING',
        registered_at: new Date().toISOString(),
        owner_name: ownerName,
      },
    })
    .select('id')
    .single()

  if (orgError || !org) {
    return { error: 'Error al registrar los datos de la barbería' }
  }

  const orgId = org.id

  // 4. Crear Suscripción Trial (se activará al ser aprobado)
  await supabase.from('organization_subscriptions').insert({
    organization_id: orgId,
    plan_tier: 'TRIAL',
    status: 'TRIAL',
  })

  // 5. Crear Sede Principal
  const { data: branch } = await supabase
    .from('branches')
    .insert({
      organization_id: orgId,
      name: 'Sede Principal',
      slug: 'central',
      is_main: true,
      phone: phone,
    })
    .select('id')
    .single()

  // 6. Crear Membresía como DUEÑO (OWNER)
  await supabase.from('organization_members').insert({
    organization_id: orgId,
    user_id: userId,
    branch_id: branch?.id ?? null,
    role: 'OWNER',
    full_name: ownerName,
    phone: phone,
    commission_rate: 50.0,
    is_active: true,
  })

  // 7. Insertar Categoría y Servicios Demo Iniciales
  const { data: cat } = await supabase
    .from('service_categories')
    .insert({
      organization_id: orgId,
      name: 'Cortes & Estilo',
      order_index: 1,
    })
    .select('id')
    .single()

  await supabase.from('services').insert([
    {
      organization_id: orgId,
      category_id: cat?.id ?? null,
      name: 'Corte Clásico / Fade',
      description: 'Corte personalizado con degradado, perfilado con navaja y acabado.',
      price: 35.0,
      duration_minutes: 35,
      commission_percent: 50.0,
      is_active: true,
    },
    {
      organization_id: orgId,
      category_id: cat?.id ?? null,
      name: 'Corte & Arreglo de Barba',
      description: 'Servicio completo de corte de cabello más diseño y perfilado de barba.',
      price: 55.0,
      duration_minutes: 50,
      commission_percent: 50.0,
      is_active: true,
    },
    {
      organization_id: orgId,
      category_id: cat?.id ?? null,
      name: 'Perfilado de Barba & Toalla Caliente',
      description: 'Ritual tradicional de afeitado con toalla caliente y bálsamo hidratante.',
      price: 25.0,
      duration_minutes: 25,
      commission_percent: 50.0,
      is_active: true,
    },
  ])

  // Desconectar sesión temporal para evitar accesos prematuros
  await supabase.auth.signOut()

  return {
    success: true,
    slug: finalSlug,
    status: 'PENDING' as const,
    barbershopName,
    ownerName,
    email,
  }
}
