import { NextResponse } from 'next/server'
import { getPlatformSecretsServer } from '@/lib/platform-secrets'
import { processSubscriptionExpirationsAndReminders } from '@/lib/subscription-reminders'

export async function GET(req: Request) {
  const secrets = await getPlatformSecretsServer()
  const expectedSecret = secrets.cron_secret?.trim() || process.env.CRON_SECRET?.trim()

  if (expectedSecret) {
    const authHeader = req.headers.get('authorization') || ''
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const summary = await processSubscriptionExpirationsAndReminders()
    return NextResponse.json({ ok: true, ...summary })
  } catch (err: any) {
    console.error('[cron/subscriptions] error:', err)
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal error' },
      { status: 500 }
    )
  }
}
