import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDatabaseUrl } from './db-config.mjs'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const connectionString = getDatabaseUrl()

async function run() {
  console.log('Conectando a Supabase PostgreSQL...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('¡Conexión exitosa a PostgreSQL Supabase!')

    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')

    console.log('Ejecutando schema.sql multi-tenant con RLS...')
    await client.query(sql)
    console.log('¡Esquema de base de datos multi-tenant aplicado correctamente!')

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)
    console.log('Tablas verificadas:', res.rows.map((r) => r.table_name))
  } catch (err) {
    console.error('Error al conectar o ejecutar SQL:', err)
  } finally {
    await client.end()
  }
}

run()
