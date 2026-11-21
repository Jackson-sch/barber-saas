import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function buildTenantPwaIcons(logoUrl: string | null | undefined) {
  const cleanLogo = logoUrl?.trim()
  if (cleanLogo && cleanLogo.startsWith('https://res.cloudinary.com/') && cleanLogo.includes('/image/upload/')) {
    const icon192 = cleanLogo.replace('/image/upload/', '/image/upload/w_192,h_192,c_fill,f_png/')
    const icon512 = cleanLogo.replace('/image/upload/', '/image/upload/w_512,h_512,c_fill,f_png/')
    return [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ]
  }

  return [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ]
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug, logo_url, primary_color, settings')
    .eq('slug', slug)
    .maybeSingle()

  const orgName = org?.name?.trim() || 'Barbería'
  const shortName = orgName.length > 18 ? `${orgName.slice(0, 17).trim()}…` : orgName
  const settings = (
    typeof org?.settings === 'object' && org.settings !== null ? org.settings : {}
  ) as Record<string, any>
  const description =
    settings.tagline || `Reserva tu cita online en ${orgName} en segundos.`
  const themeColor = org?.primary_color || '#07080B'

  const manifest = {
    id: `/reservar/${slug}`,
    name: `${orgName} — Reservas Online`,
    short_name: shortName,
    description,
    start_url: `/reservar/${slug}`,
    scope: `/reservar/${slug}`,
    display: 'standalone',
    background_color: '#07080B',
    theme_color: themeColor,
    orientation: 'portrait-primary',
    icons: buildTenantPwaIcons(org?.logo_url),
  }

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
