import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BarberOS — Gestión Inteligente de Barberías',
    short_name: 'BarberOS',
    description: 'Sistema Operativo Profesional para Barberías y Salones de Alta Gama. Agenda, POS y Caja.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07080B',
    theme_color: '#07080B',
    orientation: 'any',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
