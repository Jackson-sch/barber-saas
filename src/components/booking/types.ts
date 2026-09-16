export interface BookingService {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
}

export interface BookingBarber {
  id: string
  full_name: string
  nickname: string | null
  specialties: string[]
}

export interface BookingOrganization {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  city: string | null
}

export interface ConfirmedBookingInfo {
  serviceName: string
  startTime: string
}
