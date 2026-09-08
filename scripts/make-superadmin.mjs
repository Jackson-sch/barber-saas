import pg from 'pg'

const { Client } = pg

const connectionString = "postgresql://postgres.uxictdavgghiuyhxwcoh:aflDSfUFhU5PkrAu@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

async function makeSuperAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error("⚠️  Por favor provee un email: node scripts/make-superadmin.mjs admin@tudominio.com")
    process.exit(1)
  }

  console.log(`Conectando para hacer superadmin a: ${email}...`)
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    
    // Primero, verifica si el perfil existe
    const res = await client.query('SELECT id, email, is_super_admin FROM public.profiles WHERE email = $1', [email])
    
    if (res.rows.length === 0) {
      console.error(`❌ No se encontró ningún usuario con el correo ${email} en la tabla profiles.`)
      console.log("👉 Por favor, regístrate primero usando la interfaz (por ejemplo, en /registro-barberia o /login).")
      process.exit(1)
    }

    // Actualiza is_super_admin
    await client.query('UPDATE public.profiles SET is_super_admin = true WHERE email = $1', [email])
    
    console.log(`✅ ¡Éxito! El usuario ${email} ahora es un Súper Administrador.`)
    
  } catch (err) {
    console.error("Error ejecutando la actualización:", err)
  } finally {
    await client.end()
  }
}

makeSuperAdmin()
