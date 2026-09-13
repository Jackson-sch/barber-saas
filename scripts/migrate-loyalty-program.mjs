import pg from 'pg'

const { Client } = pg

const connectionString =
  'postgresql://postgres.uxictdavgghiuyhxwcoh:aflDSfUFhU5PkrAu@aws-0-us-west-2.pooler.supabase.com:5432/postgres'

async function run() {
  console.log('Conectando a Supabase PostgreSQL...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('¡Conexión exitosa a PostgreSQL!')

    const sql = `
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

      CREATE INDEX IF NOT EXISTS idx_loyalty_logs_client ON public.loyalty_logs(client_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_loyalty_logs_org ON public.loyalty_logs(organization_id);

      ALTER TABLE public.loyalty_logs ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view loyalty_logs of their organization" ON public.loyalty_logs;
      CREATE POLICY "Users can view loyalty_logs of their organization"
      ON public.loyalty_logs FOR SELECT
      USING (
          EXISTS (
              SELECT 1 FROM public.organization_members
              WHERE organization_members.organization_id = loyalty_logs.organization_id
              AND organization_members.user_id = auth.uid()
          )
          OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
          )
      );

      DROP POLICY IF EXISTS "Users can insert loyalty_logs in their organization" ON public.loyalty_logs;
      CREATE POLICY "Users can insert loyalty_logs in their organization"
      ON public.loyalty_logs FOR INSERT
      WITH CHECK (
          EXISTS (
              SELECT 1 FROM public.organization_members
              WHERE organization_members.organization_id = loyalty_logs.organization_id
              AND organization_members.user_id = auth.uid()
          )
          OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
          )
      );
    `

    console.log('Creando tabla loyalty_logs y políticas RLS...')
    await client.query(sql)
    console.log('¡Tabla loyalty_logs creada exitosamente!')
  } catch (err) {
    console.error('Error al ejecutar migración:', err)
  } finally {
    await client.end()
  }
}

run()
