import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

async function runMigration() {
    try {
        const sql = fs.readFileSync('migration_ratings.sql', 'utf8')
        await pool.query(sql)
        console.log('Migration successful')
    } catch (err) {
        console.error('Migration failed:', err)
    } finally {
        await pool.end()
    }
}

runMigration()
