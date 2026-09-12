export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          is_super_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          primary_color: string
          secondary_color: string
          is_active: boolean
          trial_ends_at: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          primary_color?: string
          secondary_color?: string
          is_active?: boolean
          trial_ends_at?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          primary_color?: string
          secondary_color?: string
          is_active?: boolean
          trial_ends_at?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_tier: 'TRIAL' | 'STARTER' | 'PRO' | 'ENTERPRISE'
          status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_tier?: 'TRIAL' | 'STARTER' | 'PRO' | 'ENTERPRISE'
          status?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_tier?: 'TRIAL' | 'STARTER' | 'PRO' | 'ENTERPRISE'
          status?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          id: string
          organization_id: string
          amount: number
          plan_tier: string
          months_paid: number
          payment_method: 'YAPE' | 'PLIN' | 'TRANSFER' | 'OTHER'
          voucher_url: string
          reference_code: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          amount: number
          plan_tier: string
          months_paid?: number
          payment_method?: 'YAPE' | 'PLIN' | 'TRANSFER' | 'OTHER'
          voucher_url: string
          reference_code?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          amount?: number
          plan_tier?: string
          months_paid?: number
          payment_method?: 'YAPE' | 'PLIN' | 'TRANSFER' | 'OTHER'
          voucher_url?: string
          reference_code?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          address: string | null
          phone: string | null
          is_main: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          address?: string | null
          phone?: string | null
          is_main?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string
          address?: string | null
          phone?: string | null
          is_main?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          branch_id: string | null
          role: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'BARBER'
          full_name: string
          nickname: string | null
          phone: string | null
          avatar_url: string | null
          specialties: string[]
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          branch_id?: string | null
          role?: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'BARBER'
          full_name: string
          nickname?: string | null
          phone?: string | null
          avatar_url?: string | null
          specialties?: string[]
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          branch_id?: string | null
          role?: 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'BARBER'
          full_name?: string
          nickname?: string | null
          phone?: string | null
          avatar_url?: string | null
          specialties?: string[]
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          organization_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          duration_minutes: number
          image_url: string | null
          commission_percent: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          duration_minutes?: number
          image_url?: string | null
          commission_percent?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          image_url?: string | null
          commission_percent?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          full_name: string
          phone: string
          email: string | null
          notes: string | null
          loyalty_points: number
          total_visits: number
          total_spent: number
          last_visit_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          full_name: string
          phone: string
          email?: string | null
          notes?: string | null
          loyalty_points?: number
          total_visits?: number
          total_spent?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          notes?: string | null
          loyalty_points?: number
          total_visits?: number
          total_spent?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_preferences: {
        Row: {
          id: string
          client_id: string
          organization_id: string
          hair_fade_type: string | null
          hair_guard_number: string | null
          hair_top_length: string | null
          beard_style: string | null
          allergies_notes: string | null
          favorite_barber_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          organization_id: string
          hair_fade_type?: string | null
          hair_guard_number?: string | null
          hair_top_length?: string | null
          beard_style?: string | null
          allergies_notes?: string | null
          favorite_barber_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          organization_id?: string
          hair_fade_type?: string | null
          hair_guard_number?: string | null
          hair_top_length?: string | null
          beard_style?: string | null
          allergies_notes?: string | null
          favorite_barber_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      barber_schedules: {
        Row: {
          id: string
          organization_id: string
          member_id: string
          day_of_week: number
          start_time: string
          end_time: string
          lunch_start: string | null
          lunch_end: string | null
          is_working: boolean
        }
        Insert: {
          id?: string
          organization_id: string
          member_id: string
          day_of_week: number
          start_time?: string
          end_time?: string
          lunch_start?: string | null
          lunch_end?: string | null
          is_working?: boolean
        }
        Update: {
          id?: string
          organization_id?: string
          member_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          lunch_start?: string | null
          lunch_end?: string | null
          is_working?: boolean
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          branch_id: string | null
          client_id: string
          barber_id: string
          service_id: string
          start_time: string
          end_time: string
          status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          source: 'ONLINE' | 'WALK_IN' | 'PHONE' | 'WHATSAPP'
          notes: string | null
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          branch_id?: string | null
          client_id: string
          barber_id: string
          service_id: string
          start_time: string
          end_time: string
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          source?: 'ONLINE' | 'WALK_IN' | 'PHONE' | 'WHATSAPP'
          notes?: string | null
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          branch_id?: string | null
          client_id?: string
          barber_id?: string
          service_id?: string
          start_time?: string
          end_time?: string
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          source?: 'ONLINE' | 'WALK_IN' | 'PHONE' | 'WHATSAPP'
          notes?: string | null
          total_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_shifts: {
        Row: {
          id: string
          organization_id: string
          branch_id: string | null
          opened_by: string
          closed_by: string | null
          opened_at: string
          closed_at: string | null
          initial_cash: number
          final_cash: number | null
          expected_cash: number | null
          difference: number | null
          status: 'OPEN' | 'CLOSED'
          notes: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          branch_id?: string | null
          opened_by: string
          closed_by?: string | null
          opened_at?: string
          closed_at?: string | null
          initial_cash?: number
          final_cash?: number | null
          expected_cash?: number | null
          difference?: number | null
          status?: 'OPEN' | 'CLOSED'
          notes?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          branch_id?: string | null
          opened_by?: string
          closed_by?: string | null
          opened_at?: string
          closed_at?: string | null
          initial_cash?: number
          final_cash?: number | null
          expected_cash?: number | null
          difference?: number | null
          status?: 'OPEN' | 'CLOSED'
          notes?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          organization_id: string
          name: string
          sku: string | null
          barcode: string | null
          cost_price: number
          sale_price: number
          stock: number
          min_stock: number
          is_internal_use: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          sku?: string | null
          barcode?: string | null
          cost_price?: number
          sale_price?: number
          stock?: number
          min_stock?: number
          is_internal_use?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          sku?: string | null
          barcode?: string | null
          cost_price?: number
          sale_price?: number
          stock?: number
          min_stock?: number
          is_internal_use?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          organization_id: string
          branch_id: string | null
          shift_id: string | null
          client_id: string | null
          appointment_id: string | null
          sold_by: string | null
          subtotal: number
          discount: number
          tip: number
          total: number
          payment_method: 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED'
          status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          branch_id?: string | null
          shift_id?: string | null
          client_id?: string | null
          appointment_id?: string | null
          sold_by?: string | null
          subtotal: number
          discount?: number
          tip?: number
          total: number
          payment_method?: 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED'
          status?: 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          branch_id?: string | null
          shift_id?: string | null
          client_id?: string | null
          appointment_id?: string | null
          sold_by?: string | null
          subtotal?: number
          discount?: number
          tip?: number
          total?: number
          payment_method?: 'CASH' | 'CARD' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED'
          status?: 'COMPLETED' | 'REFUNDED' | 'CANCELLED'
          created_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          item_type: 'SERVICE' | 'PRODUCT'
          service_id: string | null
          product_id: string | null
          barber_id: string | null
          quantity: number
          unit_price: number
          subtotal: number
          commission_amount: number
        }
        Insert: {
          id?: string
          sale_id: string
          item_type: 'SERVICE' | 'PRODUCT'
          service_id?: string | null
          product_id?: string | null
          barber_id?: string | null
          quantity?: number
          unit_price: number
          subtotal: number
          commission_amount?: number
        }
        Update: {
          id?: string
          sale_id?: string
          item_type?: 'SERVICE' | 'PRODUCT'
          service_id?: string | null
          product_id?: string | null
          barber_id?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          commission_amount?: number
        }
        Relationships: []
      }
      commissions: {
        Row: {
          id: string
          organization_id: string
          barber_id: string
          sale_id: string | null
          amount: number
          is_paid: boolean
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          barber_id: string
          sale_id?: string | null
          amount: number
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          barber_id?: string
          sale_id?: string | null
          amount?: number
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          id: string
          organization_id: string
          shift_id: string
          type: 'EXPENSE' | 'INCOME'
          category: string
          amount: number
          description: string
          barber_id: string | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          shift_id: string
          type: 'EXPENSE' | 'INCOME'
          category: string
          amount: number
          description: string
          barber_id?: string | null
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          shift_id?: string
          type?: 'EXPENSE' | 'INCOME'
          category?: string
          amount?: number
          description?: string
          barber_id?: string | null
          performed_by?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationSubscription = Database['public']['Tables']['organization_subscriptions']['Row']
export type SubscriptionPayment = Database['public']['Tables']['subscription_payments']['Row']
export type Branch = Database['public']['Tables']['branches']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientPreference = Database['public']['Tables']['client_preferences']['Row']
export type BarberSchedule = Database['public']['Tables']['barber_schedules']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type CashShift = Database['public']['Tables']['cash_shifts']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type Commission = Database['public']['Tables']['commissions']['Row']
export type CashMovement = Database['public']['Tables']['cash_movements']['Row']
