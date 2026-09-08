-- =========================================================
-- BARBEROS SAAS - SCHEMA MULTI-TENANT CON RLS
-- PostgreSQL / Supabase
-- =========================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORGANIZACIONES (TENANTS)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    primary_color TEXT DEFAULT '#d97706',
    secondary_color TEXT DEFAULT '#0f172a',
    is_active BOOLEAN DEFAULT true,
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
    settings JSONB DEFAULT '{
        "opening_time": "09:00",
        "closing_time": "21:00",
        "slot_interval": 30,
        "currency": "PEN",
        "currency_symbol": "S/",
        "whatsapp_reminder": true
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SUSCRIPCIONES SAAS
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL DEFAULT 'TRIAL', -- TRIAL, STARTER, PRO, ENTERPRISE
    status TEXT NOT NULL DEFAULT 'TRIAL', -- TRIAL, ACTIVE, EXPIRED, SUSPENDED
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id)
);

-- 5. PAGOS DE SUSCRIPCIÓN (VALIDACIÓN MANUAL)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    plan_tier TEXT NOT NULL,
    months_paid INT DEFAULT 1,
    payment_method TEXT NOT NULL DEFAULT 'YAPE', -- YAPE, PLIN, TRANSFER, OTHER
    voucher_url TEXT NOT NULL,
    reference_code TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    submitted_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    notes TEXT
);

-- 6. SEDES / SUCURSALES (BRANCHES)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_main BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, slug)
);

-- 7. MIEMBROS DE LA ORGANIZACIÓN (STAFF & BARBEROS)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'BARBER', -- OWNER, ADMIN, RECEPTIONIST, BARBER
    full_name TEXT NOT NULL,
    nickname TEXT,
    phone TEXT,
    avatar_url TEXT,
    specialties TEXT[] DEFAULT '{}',
    commission_rate NUMERIC(5,2) DEFAULT 40.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- 8. CATEGORÍAS DE SERVICIOS
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. SERVICIOS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    image_url TEXT,
    commission_percent NUMERIC(5,2) DEFAULT 40.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    loyalty_points INT DEFAULT 0,
    total_visits INT DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, phone)
);

-- 11. FICHA TÉCNICA DE ESTILO
CREATE TABLE IF NOT EXISTS public.client_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    hair_fade_type TEXT, -- Low fade, Mid fade, High fade, Taper fade, Clásico
    hair_guard_number TEXT, -- Ej: 0.5, 1, 1.5, 2
    hair_top_length TEXT, -- Ej: 3 dedos, corto texturizado, peinado hacia atrás
    beard_style TEXT, -- Perfilada, degradada, completa, afeitado total
    allergies_notes TEXT,
    favorite_barber_id UUID REFERENCES public.organization_members(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id)
);

-- 12. HORARIOS DE BARBEROS
CREATE TABLE IF NOT EXISTS public.barber_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0=Domingo, 1=Lunes... 6=Sábado
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '21:00',
    lunch_start TIME DEFAULT '13:00',
    lunch_end TIME DEFAULT '14:00',
    is_working BOOLEAN DEFAULT true,
    UNIQUE(member_id, day_of_week)
);

-- 13. CITAS
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
    source TEXT NOT NULL DEFAULT 'ONLINE', -- ONLINE, WALK_IN, PHONE, WHATSAPP
    notes TEXT,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. TURNOS DE CAJA
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    opened_by UUID NOT NULL REFERENCES auth.users(id),
    closed_by UUID REFERENCES auth.users(id),
    opened_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    initial_cash NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_cash NUMERIC(10,2),
    expected_cash NUMERIC(10,2),
    difference NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    notes TEXT
);

-- 15. PRODUCTOS E INVENTARIO
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT DEFAULT 5,
    is_internal_use BOOLEAN DEFAULT false, -- Insumo de barbería
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. VENTAS
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES public.cash_shifts(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    sold_by UUID REFERENCES auth.users(id),
    subtotal NUMERIC(10,2) NOT NULL,
    discount NUMERIC(10,2) DEFAULT 0,
    tip NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'CASH', -- CASH, CARD, YAPE, PLIN, TRANSFER, MIXED
    status TEXT NOT NULL DEFAULT 'COMPLETED', -- COMPLETED, REFUNDED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. DETALLES DE VENTA
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- SERVICE, PRODUCT
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    barber_id UUID REFERENCES public.organization_members(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    commission_amount NUMERIC(10,2) DEFAULT 0
);

-- 18. COMISIONES
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TRIGGER AUTOMÁTICO PARA CREAR PROFILE CUANDO UN USUARIO SE REGISTRA EN AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ÍNDICES DE ALTO RENDIMIENTO POR TENANT
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_services_org ON public.services(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_org ON public.appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_sales_org ON public.sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
