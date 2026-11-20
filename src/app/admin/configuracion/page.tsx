import { getPlatformSettings } from '@/lib/platform-settings'
import { getPlatformSecretsServer, toPlatformSecretsSafeView } from '@/lib/platform-secrets'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export default async function AdminConfiguracionPage() {
  const [settings, secrets] = await Promise.all([
    getPlatformSettings(),
    getPlatformSecretsServer(),
  ])

  return (
    <AdminSettingsClient
      initialSettings={settings}
      initialSecrets={toPlatformSecretsSafeView(secrets)}
    />
  )
}
