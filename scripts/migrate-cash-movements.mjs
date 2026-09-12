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

      ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view cash_movements of their organization" ON public.cash_movements;
      CREATE POLICY "Users can view cash_movements of their organization"
      ON public.cash_movements FOR SELECT
      USING (
          EXISTS (
              SELECT 1 FROM public.organization_members
              WHERE organization_members.organization_id = cash_movements.organization_id
              AND organization_members.user_id = auth.uid()
          )
          OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
          )
      );

      DROP POLICY IF EXISTS "Users can insert cash_movements in their organization" ON public.cash_movements;
      CREATE POLICY "Users can insert cash_movements in their organization"
      ON public.cash_movements FOR INSERT
      WITH CHECK (
          EXISTS (
              SELECT 1 FROM public.organization_members
              WHERE organization_members.organization_id = cash_movements.organization_id
              AND organization_members.user_id = auth.uid()
          )
          OR EXISTS (
              SELECT 1 FROM public.profiles
              WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
          )
      );
    `

    console.log('Creando tabla cash_movements y políticas RLS...')
    await client.query(sql)
    console.log('¡Tabla cash_movements creada exitosamente!')
  } catch (err) {
    console.error('Error al ejecutar migración:', err)
  } finally {
    await client.end()
  }
}

run()
