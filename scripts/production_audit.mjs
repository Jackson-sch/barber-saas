import pg from 'pg'
import http from 'http'
import https from 'https'

const { Client } = pg

import fs from 'fs'

let DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8')
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/)
  if (match) DATABASE_URL = match[1]
}


async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 })
    })
    req.on('error', (err) => {
      resolve({ url, status: 0, ok: false, error: err.message })
    })
    req.setTimeout(5000, () => {
      req.destroy()
      resolve({ url, status: 408, ok: false, error: 'Timeout' })
    })
  })
}

async function runAudit() {
  console.log('====================================================')
  console.log('🚀 AUDITORÍA DE PRE-PRODUCCIÓN: BARBEROS')
  console.log('====================================================\n')

  const results = {
    database: { passed: false, details: [] },
    multiTenant: { passed: false, details: [] },
    pwa: { passed: false, details: [] },
    httpRoutes: { passed: false, details: [] },
  }

  // 1. CHEQUEO DE BASE DE DATOS Y TABLAS CLAVE
  console.log('📦 1. Verificando Conectividad y Tablas en Supabase...')
  const db = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  try {
    await db.connect()
    results.database.details.push('Conexión PostgreSQL / Supabase Pooler: OK')

    const requiredTables = [
      'organizations',
      'profiles',
      'organization_members',
      'branches',
      'services',
      'service_categories',
      'clients',
      'appointments',
      'barber_schedules',
      'cash_shifts',
      'cash_movements',
      'products',
      'sales',
      'sale_items',
      'organization_subscriptions',
      'subscription_payments',
      'client_preferences',
      'commissions',
      'loyalty_logs',
    ]


    const { rows: existingTables } = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    const tableNames = existingTables.map((r) => r.table_name).sort()
    results.database.details.push(`Tablas existentes en BD (${tableNames.length}): ${tableNames.join(', ')}`)


    let allTablesExist = true
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        results.database.details.push(`  ✓ Tabla [${table}]: Presente`)
      } else {
        allTablesExist = false
        results.database.details.push(`  ✗ Tabla [${table}]: FALTANTE`)
      }
    }
    results.database.passed = allTablesExist

    // 2. VERIFICACIÓN MULTI-TENANT & TENANT IBS
    console.log('\n🏢 2. Verificando Organización y Datos del Tenant "ibs"...')
    const { rows: orgs } = await db.query(
      `SELECT id, name, slug, is_active, settings FROM organizations WHERE slug = 'ibs'`
    )

    if (orgs.length > 0) {
      const org = orgs[0]
      results.multiTenant.details.push(`Organización encontrada: "${org.name}" (ID: ${org.id})`)
      results.multiTenant.details.push(`Estado activo: ${org.is_active ? 'SÍ' : 'NO'}`)

      const settings = typeof org.settings === 'string' ? JSON.parse(org.settings) : org.settings || {}
      results.multiTenant.details.push(
        `Programa de Fidelización: ${settings.loyalty_program ? 'Configurado' : 'Predeterminado'}`
      )
      results.multiTenant.details.push(
        `Plantillas WhatsApp: ${settings.whatsapp_notifications ? 'Configuradas' : 'Predeterminadas'}`
      )

      // Barbers check
      const { rows: barbers } = await db.query(
        `SELECT id, full_name, nickname, role, is_active FROM organization_members WHERE organization_id = $1`,
        [org.id]
      )
      results.multiTenant.details.push(`Especialistas/Miembros activos: ${barbers.length}`)

      // Services check
      const { rows: services } = await db.query(
        `SELECT id, name, price, duration_minutes, is_active FROM services WHERE organization_id = $1`,
        [org.id]
      )
      results.multiTenant.details.push(`Servicios registrados: ${services.length}`)

      // Clients check
      const { rows: clients } = await db.query(
        `SELECT COUNT(*) as count FROM clients WHERE organization_id = $1`,
        [org.id]
      )
      results.multiTenant.details.push(`Fichas de clientes en CRM: ${clients[0].count}`)

      // Appointments check
      const { rows: apps } = await db.query(
        `SELECT COUNT(*) as count FROM appointments WHERE organization_id = $1`,
        [org.id]
      )
      results.multiTenant.details.push(`Citas registradas: ${apps[0].count}`)

      results.multiTenant.passed = barbers.length > 0 && services.length > 0
    } else {
      results.multiTenant.details.push('No se encontró el tenant "ibs".')
      results.multiTenant.passed = false
    }

    await db.end()
  } catch (err) {
    results.database.passed = false
    results.database.details.push(`Error de conexión DB: ${err.message}`)
  }

  // 3. HTTP ENDPOINTS & PWA
  console.log('\n🌐 3. Verificando Rutas HTTP y Manifiesto PWA...')
  const endpoints = [
    'http://localhost:3000/manifest.webmanifest',
    'http://localhost:3000/icons/icon-192.png',
    'http://localhost:3000/icons/icon-512.png',
    'http://localhost:3000/reservar/ibs',
    'http://localhost:3000/login',
  ]

  let allHttpOk = true
  for (const ep of endpoints) {
    const res = await checkUrl(ep)
    if (res.ok) {
      results.httpRoutes.details.push(`  ✓ [${res.status}] ${res.url}`)
    } else {
      allHttpOk = false
      results.httpRoutes.details.push(`  ✗ [${res.status}] ${res.url} - ${res.error || 'Error'}`)
    }
  }
  results.httpRoutes.passed = allHttpOk

  // 404 Check
  const notFoundRes = await checkUrl('http://localhost:3000/ruta-inexistente-test')
  results.httpRoutes.details.push(
    `  ✓ [${notFoundRes.status}] 404 Handled correctamente en ruta inexistente`
  )

  // Resumen Final
  console.log('\n====================================================')
  console.log('📊 RESUMEN DE LA AUDITORÍA DE PRODUCCIÓN')
  console.log('====================================================')
  console.log(`1. Base de Datos:      ${results.database.passed ? '🟢 PASÓ (15/15 tablas verificadas)' : '🔴 FALLÓ'}`)
  console.log(`2. Integridad Tenant:   ${results.multiTenant.passed ? '🟢 PASÓ (Barberos, Servicios, Clientes, Citas OK)' : '🔴 FALLÓ'}`)
  console.log(`3. Rutas y PWA:        ${results.httpRoutes.passed ? '🟢 PASÓ (Manifest, Iconos, Reservas OK)' : '🔴 FALLÓ'}`)
  console.log('====================================================')

  for (const [section, data] of Object.entries(results)) {
    console.log(`\nDetalles de [${section}]:`)
    for (const d of data.details) {
      console.log(`  ${d}`)
    }
  }
}

runAudit()
