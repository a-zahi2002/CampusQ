import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { Pool } = pg

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

async function runSchema() {
    try {
        const schemaPath = path.join(__dirname, 'database_schema.sql')
        const schemaSql = fs.readFileSync(schemaPath, 'utf8')
        
        await pool.query(schemaSql)
        console.log('Schema executed successfully.')
    } catch (err) {
        console.error('Error executing schema:', err)
    } finally {
        await pool.end()
    }
}

runSchema()
