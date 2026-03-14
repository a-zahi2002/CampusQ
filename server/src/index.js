import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import questionRoutes from './routes/questionRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err)
  } else {
    console.log('Database connected at:', res.rows[0].now)
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/questions', questionRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'CampusQ API is running!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})