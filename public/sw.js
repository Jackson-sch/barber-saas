// Service Worker mínimo para habilitar la instalación PWA Multi-Tenant en BarberOS
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Pass-through directo a red para garantizar disponibilidad en tiempo real
  if (event.request.method !== 'GET') return
})
