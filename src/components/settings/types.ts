import type { LoyaltyProgramSettings, WhatsAppNotificationSettings, CulqiSettings } from '@/types/database.types'

export type SettingsTab = 'general' | 'branding' | 'loyalty' | 'whatsapp' | 'payments'

export interface SalonSettingsProps {
  organization: {
    id: string
    name: string
    slug: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
    openingTime: string
    closingTime: string
    loyaltyProgram?: LoyaltyProgramSettings | null
    whatsappSettings?: WhatsAppNotificationSettings | null
    culqiSettings?: CulqiSettings | null
    logoUrl?: string | null
    primaryColor?: string
    secondaryColor?: string
    bannerUrl?: string | null
    tagline?: string | null
  }
  isOwner: boolean
  slug: string
}

export const COLOR_PRESETS = [
  { name: 'Ámbar Imperial', hex: '#F59E0B' },
  { name: 'Azul Zafiro', hex: '#3B82F6' },
  { name: 'Verde Esmeralda', hex: '#10B981' },
  { name: 'Rojo Rubí', hex: '#EF4444' },
  { name: 'Púrpura Amatista', hex: '#8B5CF6' },
  { name: 'Platino Cromo', hex: '#E5E5E5' },
]

export const BANNER_PRESETS = [
  {
    name: 'Madera & Cuero',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Estación Moderna',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Navaja Vintage',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sillón Clásico',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80',
  },
]
