import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Connect to default 'postgres' database to create the new one
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

async function createDatabase() {
    try {
        await pool.query('CREATE DATABASE campusq')
        console.log('Database campusq created successfully.')
    } catch (err) {
        if (err.code === '42P04') {
            console.log('Database campusq already exists.')
        } else {
            console.error('Error creating database:', err)
        }
    } finally {
        await pool.end()
    }
}

createDatabase()
