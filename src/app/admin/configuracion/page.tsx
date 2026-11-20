import { getPlatformSettings } from '@/lib/platform-settings'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export default async function AdminConfiguracionPage() {
  const settings = await getPlatformSettings()
  return <AdminSettingsClient initialSettings={settings} />
}
