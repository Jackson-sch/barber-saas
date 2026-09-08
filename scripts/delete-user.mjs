import pg from 'pg'

const { Client } = pg
const connectionString = "postgresql://postgres.uxictdavgghiuyhxwcoh:aflDSfUFhU5PkrAu@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

async function deleteUser() {
  const email = process.argv[2]
  
  if (!email) {
    console.error("⚠️  Por favor provee un email")
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    
    // Eliminar de auth.users (el cascade eliminará el profile y el tenant asociado)
    const res = await client.query('DELETE FROM auth.users WHERE email = $1 RETURNING id', [email])
    
    if (res.rows.length === 0) {
      console.log(`No se encontró al usuario ${email}.`)
    } else {
      console.log(`✅ Usuario ${email} eliminado correctamente. Ahora puedes volver a registrarte con tu nueva contraseña.`)
    }
  } catch (err) {
    console.error("Error eliminando:", err)
  } finally {
    await client.end()
  }
}

deleteUser()
