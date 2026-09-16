'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database, LoyaltyProgramSettings, WhatsAppNotificationSettings, CulqiSettings } from '@/types/database.types'

export interface UpdateOrgByAdminInput {
  orgId: string
  name: string
  slug: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
}

export interface UpdateTenantSettingsInput {
  organizationId: string
  currentSlug: string
  name: string
  newSlug?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  openingTime?: string
  closingTime?: string
  loyaltyProgram?: LoyaltyProgramSettings
  whatsappSettings?: WhatsAppNotificationSettings
  culqiSettings?: CulqiSettings
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  bannerUrl?: string | null
  tagline?: string | null
}

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 1. Edición por el SuperAdmin
export async function updateOrganizationByAdminAction(input: UpdateOrgByAdminInput) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Verificar superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_super_admin) {
    return { error: 'Acceso denegado: solo para súper administradores.' }
  }

  const name = input.name.trim()
  const slug = cleanSlug(input.slug)

  if (!name || name.length < 2) {
    return { error: 'El nombre de la barbería debe tener al menos 2 caracteres.' }
  }

  if (!slug || slug.length < 3) {
    return { error: 'El slug debe tener al menos 3 caracteres alfanuméricos.' }
  }

  // Verificar unicidad de slug
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .neq('id', input.orgId)
    .maybeSingle()

  if (existingOrg) {
    return { error: `El slug "/${slug}" ya está en uso por otra barbería. Elige otro diferente.` }
  }

  const { error: updateErr } = await supabase
    .from('organizations')
    .update({
      name,
      slug,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      city: input.city?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.orgId)

  if (updateErr) {
    console.error('Error updating organization by admin:', updateErr)
    return { error: 'Error al actualizar los datos de la barbería.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/barberias')
  revalidatePath(`/reservar/${slug}`)
  revalidatePath(`/app/${slug}/dashboard`)

  return { success: true, newSlug: slug }
}

// 2. Edición por el Dueño / Admin de la barbería
export async function updateTenantSettingsAction(input: UpdateTenantSettingsInput) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado.' }

  // Verificar rol del usuario en la barbería
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', input.organizationId)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single()

  const isOwner = member?.role === 'OWNER'

  if (!isOwner) {
    return { error: 'Solo el dueño legítimo de la barbería puede modificar la configuración del salón.' }
  }

  const name = input.name.trim()
  if (!name || name.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' }
  }

  let finalSlug = input.currentSlug
  if (input.newSlug && input.newSlug.trim()) {
    const desiredSlug = cleanSlug(input.newSlug)
    if (desiredSlug.length < 3) {
      return { error: 'El slug debe tener al menos 3 caracteres.' }
    }

    if (desiredSlug !== input.currentSlug) {
      const { data: slugTaken } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', desiredSlug)
        .neq('id', input.organizationId)
        .maybeSingle()

      if (slugTaken) {
        return { error: `El slug "/${desiredSlug}" ya está ocupado. Elige otro.` }
      }
      finalSlug = desiredSlug
    }
  }

  // Actualizar settings json
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', input.organizationId)
    .single()

  const currentSettings = (currentOrg?.settings as Record<string, any>) || {}
  const updatedSettings = {
    ...currentSettings,
    opening_time: input.openingTime || currentSettings.opening_time || '09:00',
    closing_time: input.closingTime || currentSettings.closing_time || '21:00',
    ...(input.loyaltyProgram !== undefined ? { loyalty_program: input.loyaltyProgram } : {}),
    ...(input.whatsappSettings !== undefined ? { whatsapp_notifications: input.whatsappSettings } : {}),
    ...(input.culqiSettings !== undefined ? { culqi_settings: input.culqiSettings } : {}),
    ...(input.bannerUrl !== undefined ? { banner_url: input.bannerUrl } : {}),
    ...(input.tagline !== undefined ? { tagline: input.tagline } : {}),
  }

  const updatePayload: Database['public']['Tables']['organizations']['Update'] = {
    name,
    slug: finalSlug,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    settings: updatedSettings as any,
    updated_at: new Date().toISOString(),
  }

  if (input.logoUrl !== undefined) {
    updatePayload.logo_url = input.logoUrl ? input.logoUrl.trim() : null
  }
  if (input.primaryColor !== undefined) {
    updatePayload.primary_color = input.primaryColor.trim()
  }
  if (input.secondaryColor !== undefined) {
    updatePayload.secondary_color = input.secondaryColor.trim()
  }

  const { error: updateErr } = await supabase
    .from('organizations')
    .update(updatePayload)
    .eq('id', input.organizationId)

  if (updateErr) {
    console.error('Error updating tenant settings:', updateErr)
    return { error: 'No se pudieron guardar los cambios.' }
  }

  revalidatePath(`/app/${finalSlug}/configuracion`)
  revalidatePath(`/app/${finalSlug}/clientes`)
  revalidatePath(`/app/${finalSlug}/pos`)
  revalidatePath(`/app/${finalSlug}/dashboard`)
  revalidatePath(`/reservar/${finalSlug}`)

  return { success: true, newSlug: finalSlug, slugChanged: finalSlug !== input.currentSlug }
}

/**
 * Prueba en vivo de la conexión con Culqi usando la llave secreta proporcionada.
 */
export async function testCulqiConnectionAction(secretKey: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { error: 'No autorizado' }

  const trimmedKey = secretKey.trim()
  if (!trimmedKey) {
    return { error: 'Por favor ingresa la Llave Secreta para probar la conexión.' }
  }

  if (!trimmedKey.startsWith('sk_test_') && !trimmedKey.startsWith('sk_live_')) {
    return {
      error: 'Formato de llave inválido. Debe comenzar con "sk_test_" (Pruebas) o "sk_live_" (Producción).',
    }
  }

  try {
    const response = await fetch('https://api.culqi.com/v2/charges?limit=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 200) {
      const mode = trimmedKey.startsWith('sk_test_') ? 'Pruebas (Sandbox)' : 'Producción (En vivo)'
      return {
        success: true,
        message: `¡Conexión exitosa con Culqi! Modo detectado: ${mode}.`,
      }
    }

    if (response.status === 401) {
      return {
        error: 'Culqi rechazó la llave secreta (Error 401: No autorizado). Verifica que esté copiada correctamente.',
      }
    }

    return {
      error: `Culqi respondió con código de estado ${response.status}. Verifica que tu cuenta en culqi.com esté activa.`,
    }
  } catch (err: any) {
    console.error('Error testing Culqi connection:', err)
    return {
      error: 'No se pudo contactar los servidores de Culqi. Verifica tu conexión a internet.',
    }
  }
}
