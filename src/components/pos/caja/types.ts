import type { Sale } from '@/types/database.types'

export interface SaleWithDetails extends Sale {
  client?: { full_name: string; phone?: string | null } | null
  items?: Array<{
    name: string
    quantity: number
    unit_price: number
    subtotal: number
    barberName?: string | null
  }>
}
