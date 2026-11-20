import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const envLocalPath = path.join(__dirname, '../.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8')
    const match = envContent.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m)
    if (match && match[1]) {
      return match[1]
    }
  }

  console.error('❌ Error: DATABASE_URL no está configurada en las variables de entorno ni en .env.local')
  process.exit(1)
}
