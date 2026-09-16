// tests/setup.ts
import { beforeAll, afterEach, vi } from 'vitest'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake-project.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fake-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-service-role-key'
})

afterEach(() => {
  vi.clearAllMocks()
})
