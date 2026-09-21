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

export interface ManualPaymentSettings {
  enabled: boolean
  qrImageUrl?: string | null
  paymentPhone?: string | null
  beneficiaryName?: string | null
  walletType?: string | null
  instructions?: string | null
  requireVoucher?: boolean
}

export interface BookingOrganization {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  city: string | null
  culqiSettings?: {
    enabled: boolean
    public_key: string
    environment?: 'test' | 'production'
  } | null
  manualPaymentSettings?: ManualPaymentSettings | null
}

export interface ConfirmedBookingInfo {
  serviceName: string
  startTime: string
  isPaidOnline?: boolean
  chargeId?: string
  paymentMethod?: 'IN_PERSON' | 'QR_WALLET' | 'CULQI_ONLINE'
  opReference?: string
  voucherUrl?: string
}
