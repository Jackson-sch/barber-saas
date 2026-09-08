import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const connectionString = "postgresql://postgres.uxictdavgghiuyhxwcoh:aflDSfUFhU5PkrAu@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

async function run() {
  console.log("Conectando a Supabase PostgreSQL...")
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log("¡Conexión exitosa a PostgreSQL Supabase!")

    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')

    console.log("Ejecutando schema.sql multi-tenant...")
    await client.query(sql)
    console.log("¡Esquema de base de datos multi-tenant aplicado correctamente!")

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)
    console.log("Tablas creadas:", res.rows.map(r => r.table_name))
  } catch (err) {
    console.error("Error al conectar o ejecutar SQL:", err)
  } finally {
    await client.end()
  }
}

run()
