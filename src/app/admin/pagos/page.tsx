import { createClient } from '@/lib/supabase/server'
import AdminPaymentsClient, { type PaymentWithOrg } from '@/components/admin/AdminPaymentsClient'

export default async function AdminPagosPage() {
  const supabase = await createClient()

  // Obtener todos los pagos de suscripciones con los datos de la organización
  const { data: payments } = await supabase
    .from('subscription_payments')
    .select(`
      *,
      organization:organizations(name, slug)
    `)
    .order('submitted_at', { ascending: false })

  return (
    <AdminPaymentsClient initialPayments={(payments || []) as unknown as PaymentWithOrg[]} />
  )
}
