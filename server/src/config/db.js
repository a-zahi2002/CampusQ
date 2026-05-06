import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Use individual params instead of a connection string URL so that
// special characters in the password (e.g. #) are never URL-parsed.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl:      false
    })

export default pool
