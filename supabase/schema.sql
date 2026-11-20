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
    voucher_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS voucher_url TEXT;

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

-- 18. MOVIMIENTOS Y EGRESOS DE CAJA (GASTOS MENORES / RETIROS)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES public.cash_shifts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    barber_id UUID REFERENCES public.organization_members(id) ON DELETE SET NULL,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. LOGS DE FIDELIZACIÓN (SELLOS, PUNTOS Y CANJES)
CREATE TABLE IF NOT EXISTS public.loyalty_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('EARN_VISIT', 'EARN_POINTS', 'REDEEM_REWARD', 'MANUAL_ADJUST')),
    points_delta INT NOT NULL DEFAULT 0,
    reward_description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. CONFIGURACIÓN GLOBAL DE LA PLATAFORMA (SUPERADMIN)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    platform_name TEXT NOT NULL DEFAULT 'BarberOS',
    yape_phone TEXT,
    yape_holder TEXT,
    yape_qr_url TEXT,
    plin_phone TEXT,
    bank_name TEXT DEFAULT 'BCP Soles',
    bank_account TEXT,
    bank_cci TEXT,
    bank_holder TEXT,
    starter_price NUMERIC(10,2) NOT NULL DEFAULT 59.00,
    pro_price NUMERIC(10,2) NOT NULL DEFAULT 99.00,
    enterprise_price NUMERIC(10,2) NOT NULL DEFAULT 179.00,
    trial_days INT NOT NULL DEFAULT 14,
    support_whatsapp TEXT,
    support_email TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22. SECRETOS GLOBALES E INTEGRACIONES DE LA PLATAFORMA (EXCLUSIVO SUPERADMIN)
CREATE TABLE IF NOT EXISTS public.platform_secrets (
    id TEXT PRIMARY KEY DEFAULT 'default',
    -- Cloudinary de la Plataforma (comprobantes de pago SaaS, QR y assets globales)
    cloudinary_enabled BOOLEAN NOT NULL DEFAULT false,
    cloudinary_cloud_name TEXT,
    cloudinary_api_key TEXT,
    cloudinary_api_secret TEXT,
    cloudinary_upload_preset TEXT,
    cloudinary_folder TEXT DEFAULT 'barberos-saas',
    -- Correo Transaccional (Resend / SMTP)
    email_provider TEXT NOT NULL DEFAULT 'NONE',
    email_from_name TEXT DEFAULT 'BarberOS',
    email_from_address TEXT,
    resend_api_key TEXT,
    smtp_host TEXT,
    smtp_port INT DEFAULT 587,
    smtp_user TEXT,
    smtp_password TEXT,
    -- WhatsApp Oficial de la Plataforma (notificaciones SaaS y alertas)
    whatsapp_provider TEXT NOT NULL DEFAULT 'NONE',
    whatsapp_phone_number_id TEXT,
    whatsapp_access_token TEXT,
    whatsapp_gateway_url TEXT,
    whatsapp_admin_notify_phone TEXT,
    -- Pasarela de Pagos SaaS (cobro automático de suscripciones)
    culqi_public_key TEXT,
    culqi_secret_key TEXT,
    mercadopago_public_key TEXT,
    mercadopago_access_token TEXT,
    -- Automatización & Alertas
    cron_secret TEXT,
    webhook_notify_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. SECRETOS PRIVADOS POR ORGANIZACIÓN (CULQI SECRET KEY, TOKENS WHATSAPP)
CREATE TABLE IF NOT EXISTS public.organization_secrets (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    culqi_secret_key TEXT,
    whatsapp_access_token TEXT,
    whatsapp_webhook_token TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migración idempotente: mover llaves privadas desde organizations.settings a organization_secrets y sanear JSON público
INSERT INTO public.organization_secrets (
    organization_id,
    culqi_secret_key,
    whatsapp_access_token,
    whatsapp_webhook_token,
    updated_at
)
SELECT
    id,
    NULLIF(TRIM(settings->'culqi_settings'->>'secret_key'), ''),
    NULLIF(TRIM(COALESCE(
        settings->'whatsapp_notifications'->>'accessToken',
        settings->'whatsapp_settings'->>'accessToken',
        settings->'whatsappSettings'->>'accessToken'
    )), ''),
    NULLIF(TRIM(COALESCE(
        settings->'whatsapp_notifications'->>'webhookBearerToken',
        settings->'whatsapp_settings'->>'webhookBearerToken',
        settings->'whatsappSettings'->>'webhookBearerToken'
    )), ''),
    now()
FROM public.organizations
WHERE
    NULLIF(TRIM(settings->'culqi_settings'->>'secret_key'), '') IS NOT NULL
    OR NULLIF(TRIM(COALESCE(
        settings->'whatsapp_notifications'->>'accessToken',
        settings->'whatsapp_settings'->>'accessToken',
        settings->'whatsappSettings'->>'accessToken'
    )), '') IS NOT NULL
    OR NULLIF(TRIM(COALESCE(
        settings->'whatsapp_notifications'->>'webhookBearerToken',
        settings->'whatsapp_settings'->>'webhookBearerToken',
        settings->'whatsappSettings'->>'webhookBearerToken'
    )), '') IS NOT NULL
ON CONFLICT (organization_id) DO UPDATE SET
    culqi_secret_key = COALESCE(NULLIF(EXCLUDED.culqi_secret_key, ''), public.organization_secrets.culqi_secret_key),
    whatsapp_access_token = COALESCE(NULLIF(EXCLUDED.whatsapp_access_token, ''), public.organization_secrets.whatsapp_access_token),
    whatsapp_webhook_token = COALESCE(NULLIF(EXCLUDED.whatsapp_webhook_token, ''), public.organization_secrets.whatsapp_webhook_token),
    updated_at = now();

UPDATE public.organizations
SET settings = (
    settings
    #- '{culqi_settings,secret_key}'
    #- '{whatsapp_notifications,accessToken}'
    #- '{whatsapp_notifications,webhookBearerToken}'
    #- '{whatsapp_settings,accessToken}'
    #- '{whatsapp_settings,webhookBearerToken}'
    #- '{whatsappSettings,accessToken}'
    #- '{whatsappSettings,webhookBearerToken}'
)
WHERE
    (settings->'culqi_settings' ? 'secret_key')
    OR (settings->'whatsapp_notifications' ?| ARRAY['accessToken', 'webhookBearerToken'])
    OR (settings->'whatsapp_settings' ?| ARRAY['accessToken', 'webhookBearerToken'])
    OR (settings->'whatsappSettings' ?| ARRAY['accessToken', 'webhookBearerToken']);

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
CREATE INDEX IF NOT EXISTS idx_loyalty_logs_client ON public.loyalty_logs(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_logs_org ON public.loyalty_logs(organization_id);

-- =========================================================
-- 20. FUNCIONES HELPER Y POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =========================================================

-- Verifica si el usuario actual es SuperAdmin global
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Garantizar que ningún OWNER quede desactivado por accidente
UPDATE public.organization_members SET is_active = true WHERE role = 'OWNER' AND is_active = false;

-- Verifica si el usuario actual pertenece a la organización indicada
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND (is_active = true OR role = 'OWNER')
  ) OR public.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifica si el usuario actual es OWNER o ADMIN de la organización indicada
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('OWNER', 'ADMIN')
      AND (is_active = true OR role = 'OWNER')
  ) OR public.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Habilitar RLS en las 19 tablas del esquema
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_secrets ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (id = auth.uid() OR public.is_super_admin());

-- 2. ORGANIZATIONS (Lectura pública por slug para portal de citas y login; inserción en onboarding; edición por dueño/admin)
DROP POLICY IF EXISTS "organizations_select_public" ON public.organizations;
CREATE POLICY "organizations_select_public" ON public.organizations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;
CREATE POLICY "organizations_insert_authenticated" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "organizations_update_admin" ON public.organizations;
CREATE POLICY "organizations_update_admin" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(id))
  WITH CHECK (public.is_org_admin(id));

DROP POLICY IF EXISTS "organizations_delete_superadmin" ON public.organizations;
CREATE POLICY "organizations_delete_superadmin" ON public.organizations
  FOR DELETE USING (public.is_super_admin());

-- 3. ORGANIZATION_SUBSCRIPTIONS
DROP POLICY IF EXISTS "org_subscriptions_select" ON public.organization_subscriptions;
CREATE POLICY "org_subscriptions_select" ON public.organization_subscriptions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "org_subscriptions_insert" ON public.organization_subscriptions;
CREATE POLICY "org_subscriptions_insert" ON public.organization_subscriptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "org_subscriptions_update_superadmin" ON public.organization_subscriptions;
CREATE POLICY "org_subscriptions_update_superadmin" ON public.organization_subscriptions
  FOR UPDATE USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 4. SUBSCRIPTION_PAYMENTS
DROP POLICY IF EXISTS "sub_payments_select_member" ON public.subscription_payments;
CREATE POLICY "sub_payments_select_member" ON public.subscription_payments
  FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "sub_payments_insert_member" ON public.subscription_payments;
CREATE POLICY "sub_payments_insert_member" ON public.subscription_payments
  FOR INSERT WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "sub_payments_update_superadmin" ON public.subscription_payments;
CREATE POLICY "sub_payments_update_superadmin" ON public.subscription_payments
  FOR UPDATE USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 5. BRANCHES
DROP POLICY IF EXISTS "branches_select_public" ON public.branches;
CREATE POLICY "branches_select_public" ON public.branches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "branches_insert_auth" ON public.branches;
CREATE POLICY "branches_insert_auth" ON public.branches
  FOR INSERT WITH CHECK (
    public.is_org_admin(organization_id)
    OR (auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = branches.organization_id))
  );

DROP POLICY IF EXISTS "branches_update_admin" ON public.branches;
CREATE POLICY "branches_update_admin" ON public.branches
  FOR UPDATE USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "branches_delete_admin" ON public.branches;
CREATE POLICY "branches_delete_admin" ON public.branches
  FOR DELETE USING (public.is_org_admin(organization_id));

-- 6. ORGANIZATION_MEMBERS (Lectura pública de barberos activos para portal de reservas)
DROP POLICY IF EXISTS "org_members_select_public" ON public.organization_members;
CREATE POLICY "org_members_select_public" ON public.organization_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
CREATE POLICY "org_members_insert" ON public.organization_members
  FOR INSERT WITH CHECK (
    public.is_org_admin(organization_id)
    OR (
      auth.uid() = user_id
      AND role = 'OWNER'
      AND NOT EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = organization_members.organization_id)
    )
  );

DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
CREATE POLICY "org_members_update" ON public.organization_members
  FOR UPDATE USING (public.is_org_admin(organization_id) OR user_id = auth.uid())
  WITH CHECK (public.is_org_admin(organization_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;
CREATE POLICY "org_members_delete" ON public.organization_members
  FOR DELETE USING (public.is_org_admin(organization_id));

-- 7. SERVICE_CATEGORIES
DROP POLICY IF EXISTS "service_categories_select_public" ON public.service_categories;
CREATE POLICY "service_categories_select_public" ON public.service_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_categories_write_member" ON public.service_categories;
CREATE POLICY "service_categories_write_member" ON public.service_categories
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 8. SERVICES
DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public" ON public.services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "services_write_member" ON public.services;
CREATE POLICY "services_write_member" ON public.services
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 9. BARBER_SCHEDULES
DROP POLICY IF EXISTS "barber_schedules_select_public" ON public.barber_schedules;
CREATE POLICY "barber_schedules_select_public" ON public.barber_schedules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "barber_schedules_write_member" ON public.barber_schedules;
CREATE POLICY "barber_schedules_write_member" ON public.barber_schedules
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 10. CLIENTS (Soporta reserva pública online y gestión del tenant)
DROP POLICY IF EXISTS "clients_select_public_or_member" ON public.clients;
CREATE POLICY "clients_select_public_or_member" ON public.clients
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "clients_insert_public_or_member" ON public.clients;
CREATE POLICY "clients_insert_public_or_member" ON public.clients
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "clients_update_public_or_member" ON public.clients;
CREATE POLICY "clients_update_public_or_member" ON public.clients
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "clients_delete_member" ON public.clients;
CREATE POLICY "clients_delete_member" ON public.clients
  FOR DELETE USING (public.is_org_admin(organization_id));

-- 11. CLIENT_PREFERENCES
DROP POLICY IF EXISTS "client_preferences_select" ON public.client_preferences;
CREATE POLICY "client_preferences_select" ON public.client_preferences
  FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "client_preferences_insert_public_or_member" ON public.client_preferences;
CREATE POLICY "client_preferences_insert_public_or_member" ON public.client_preferences
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "client_preferences_update_member" ON public.client_preferences;
CREATE POLICY "client_preferences_update_member" ON public.client_preferences
  FOR UPDATE USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "client_preferences_delete_member" ON public.client_preferences;
CREATE POLICY "client_preferences_delete_member" ON public.client_preferences
  FOR DELETE USING (public.is_org_admin(organization_id));

-- 12. APPOINTMENTS (Lectura de disponibilidad y creación pública; actualización/borrado solo miembros del tenant)
DROP POLICY IF EXISTS "appointments_select_public_or_member" ON public.appointments;
CREATE POLICY "appointments_select_public_or_member" ON public.appointments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "appointments_insert_public_or_member" ON public.appointments;
CREATE POLICY "appointments_insert_public_or_member" ON public.appointments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_update_member" ON public.appointments;
CREATE POLICY "appointments_update_member" ON public.appointments
  FOR UPDATE USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "appointments_delete_member" ON public.appointments;
CREATE POLICY "appointments_delete_member" ON public.appointments
  FOR DELETE USING (public.is_org_admin(organization_id));

-- 13. CASH_SHIFTS
DROP POLICY IF EXISTS "cash_shifts_member_all" ON public.cash_shifts;
CREATE POLICY "cash_shifts_member_all" ON public.cash_shifts
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 14. PRODUCTS
DROP POLICY IF EXISTS "products_member_all" ON public.products;
CREATE POLICY "products_member_all" ON public.products
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 15. SALES
DROP POLICY IF EXISTS "sales_member_all" ON public.sales;
CREATE POLICY "sales_member_all" ON public.sales
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 16. SALE_ITEMS (Vinculada a sales.organization_id)
DROP POLICY IF EXISTS "sale_items_member_all" ON public.sale_items;
CREATE POLICY "sale_items_member_all" ON public.sale_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = sale_items.sale_id AND public.is_org_member(s.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = sale_items.sale_id AND public.is_org_member(s.organization_id)
    )
  );

-- 17. COMMISSIONS
DROP POLICY IF EXISTS "commissions_member_all" ON public.commissions;
CREATE POLICY "commissions_member_all" ON public.commissions
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 18. CASH_MOVEMENTS
DROP POLICY IF EXISTS "Users can view cash_movements of their organization" ON public.cash_movements;
DROP POLICY IF EXISTS "Users can insert cash_movements in their organization" ON public.cash_movements;
DROP POLICY IF EXISTS "cash_movements_member_all" ON public.cash_movements;
CREATE POLICY "cash_movements_member_all" ON public.cash_movements
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 19. LOYALTY_LOGS
DROP POLICY IF EXISTS "Users can view loyalty_logs of their organization" ON public.loyalty_logs;
DROP POLICY IF EXISTS "Users can insert loyalty_logs in their organization" ON public.loyalty_logs;
DROP POLICY IF EXISTS "loyalty_logs_member_all" ON public.loyalty_logs;
CREATE POLICY "loyalty_logs_member_all" ON public.loyalty_logs
  FOR ALL USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- 20. PLATFORM_SETTINGS (Lectura para mostrar datos de pago SaaS; edición solo SuperAdmin)
DROP POLICY IF EXISTS "platform_settings_select_all" ON public.platform_settings;
CREATE POLICY "platform_settings_select_all" ON public.platform_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "platform_settings_write_superadmin" ON public.platform_settings;
CREATE POLICY "platform_settings_write_superadmin" ON public.platform_settings
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 21. ORGANIZATION_SECRETS (Acceso exclusivo para OWNER/ADMIN de la barbería o SuperAdmin)
DROP POLICY IF EXISTS "organization_secrets_admin_all" ON public.organization_secrets;
CREATE POLICY "organization_secrets_admin_all" ON public.organization_secrets
  FOR ALL USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

-- 22. PLATFORM_SECRETS (Acceso exclusivo SuperAdmin)
DROP POLICY IF EXISTS "platform_secrets_superadmin_all" ON public.platform_secrets;
CREATE POLICY "platform_secrets_superadmin_all" ON public.platform_secrets
  FOR ALL USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
