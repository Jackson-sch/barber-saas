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
          voucher_url: string | null
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
          voucher_url?: string | null
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
          voucher_url?: string | null
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
      loyalty_logs: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          sale_id: string | null
          type: 'EARN_VISIT' | 'EARN_POINTS' | 'REDEEM_REWARD' | 'MANUAL_ADJUST'
          points_delta: number
          reward_description: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          sale_id?: string | null
          type: 'EARN_VISIT' | 'EARN_POINTS' | 'REDEEM_REWARD' | 'MANUAL_ADJUST'
          points_delta?: number
          reward_description: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          sale_id?: string | null
          type?: 'EARN_VISIT' | 'EARN_POINTS' | 'REDEEM_REWARD' | 'MANUAL_ADJUST'
          points_delta?: number
          reward_description?: string
          created_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          platform_name: string
          yape_phone: string | null
          yape_holder: string | null
          yape_qr_url: string | null
          plin_phone: string | null
          bank_name: string | null
          bank_account: string | null
          bank_cci: string | null
          bank_holder: string | null
          starter_price: number
          pro_price: number
          enterprise_price: number
          trial_days: number
          support_whatsapp: string | null
          support_email: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          platform_name?: string
          yape_phone?: string | null
          yape_holder?: string | null
          yape_qr_url?: string | null
          plin_phone?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_cci?: string | null
          bank_holder?: string | null
          starter_price?: number
          pro_price?: number
          enterprise_price?: number
          trial_days?: number
          support_whatsapp?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          platform_name?: string
          yape_phone?: string | null
          yape_holder?: string | null
          yape_qr_url?: string | null
          plin_phone?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_cci?: string | null
          bank_holder?: string | null
          starter_price?: number
          pro_price?: number
          enterprise_price?: number
          trial_days?: number
          support_whatsapp?: string | null
          support_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_secrets: {
        Row: {
          organization_id: string
          culqi_secret_key: string | null
          whatsapp_access_token: string | null
          whatsapp_webhook_token: string | null
          updated_at: string
        }
        Insert: {
          organization_id: string
          culqi_secret_key?: string | null
          whatsapp_access_token?: string | null
          whatsapp_webhook_token?: string | null
          updated_at?: string
        }
        Update: {
          organization_id?: string
          culqi_secret_key?: string | null
          whatsapp_access_token?: string | null
          whatsapp_webhook_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_secrets: {
        Row: {
          id: string
          cloudinary_enabled: boolean
          cloudinary_cloud_name: string | null
          cloudinary_api_key: string | null
          cloudinary_api_secret: string | null
          cloudinary_upload_preset: string | null
          cloudinary_folder: string | null
          email_provider: string
          email_from_name: string | null
          email_from_address: string | null
          resend_api_key: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_user: string | null
          smtp_password: string | null
          whatsapp_provider: string
          whatsapp_phone_number_id: string | null
          whatsapp_access_token: string | null
          whatsapp_gateway_url: string | null
          whatsapp_admin_notify_phone: string | null
          culqi_public_key: string | null
          culqi_secret_key: string | null
          mercadopago_public_key: string | null
          mercadopago_access_token: string | null
          cron_secret: string | null
          webhook_notify_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          cloudinary_enabled?: boolean
          cloudinary_cloud_name?: string | null
          cloudinary_api_key?: string | null
          cloudinary_api_secret?: string | null
          cloudinary_upload_preset?: string | null
          cloudinary_folder?: string | null
          email_provider?: string
          email_from_name?: string | null
          email_from_address?: string | null
          resend_api_key?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_password?: string | null
          whatsapp_provider?: string
          whatsapp_phone_number_id?: string | null
          whatsapp_access_token?: string | null
          whatsapp_gateway_url?: string | null
          whatsapp_admin_notify_phone?: string | null
          culqi_public_key?: string | null
          culqi_secret_key?: string | null
          mercadopago_public_key?: string | null
          mercadopago_access_token?: string | null
          cron_secret?: string | null
          webhook_notify_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          cloudinary_enabled?: boolean
          cloudinary_cloud_name?: string | null
          cloudinary_api_key?: string | null
          cloudinary_api_secret?: string | null
          cloudinary_upload_preset?: string | null
          cloudinary_folder?: string | null
          email_provider?: string
          email_from_name?: string | null
          email_from_address?: string | null
          resend_api_key?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          smtp_password?: string | null
          whatsapp_provider?: string
          whatsapp_phone_number_id?: string | null
          whatsapp_access_token?: string | null
          whatsapp_gateway_url?: string | null
          whatsapp_admin_notify_phone?: string | null
          culqi_public_key?: string | null
          culqi_secret_key?: string | null
          mercadopago_public_key?: string | null
          mercadopago_access_token?: string | null
          cron_secret?: string | null
          webhook_notify_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          user_agent?: string | null
          created_at?: string
          updated_at?: string
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
export type LoyaltyLog = Database['public']['Tables']['loyalty_logs']['Row']
export type PlatformSettings = Database['public']['Tables']['platform_settings']['Row']
export type PlatformSecrets = Database['public']['Tables']['platform_secrets']['Row']
export type OrganizationSecret = Database['public']['Tables']['organization_secrets']['Row']

export interface LoyaltyProgramSettings {
  enabled: boolean
  program_type: 'VISITS' | 'POINTS'
  target_visits: number
  reward_title: string
  reward_discount: number
  points_per_pen: number
  target_points: number
  points_reward_discount: number
}

export interface WhatsAppNotificationSettings {
  provider?: 'MANUAL' | 'META_CLOUD_API' | 'CUSTOM_GATEWAY'
  phoneNumberId?: string
  accessToken?: string
  webhookUrl?: string
  webhookBearerToken?: string
  reminder_template?: string
  confirmation_template?: string
  reschedule_template?: string
  cancellation_template?: string
  followup_template?: string
}

export interface CulqiSettings {
  enabled: boolean
  environment: 'test' | 'production'
  public_key: string
  secret_key: string
}

export interface ManualPaymentSettings {
  enabled: boolean
  qr_image_url?: string | null
  payment_phone?: string | null
  beneficiary_name?: string | null
  wallet_type?: string | null
  instructions?: string | null
  require_voucher?: boolean
}

export interface CloudinarySettings {
  enabled: boolean
  cloud_name: string
  upload_preset: string
  folder?: string | null
}
