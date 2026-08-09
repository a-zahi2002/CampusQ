import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pool from './config/db.js'

// ── Route imports ──────────────────────────────────────────────
import authRoutes        from './routes/authRoutes.js'
import questionRoutes    from './routes/questionRoutes.js'
import answerRoutes      from './routes/answerRoutes.js'
import commentRoutes     from './routes/commentRoutes.js'
import ratingRoutes      from './routes/ratingRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'
import tagRoutes         from './routes/tagRoutes.js'
import reportRoutes      from './routes/reportRoutes.js'
import adminRoutes       from './routes/adminRoutes.js'
import userRoutes        from './routes/userRoutes.js'

// ── Tag-controller imports for /api/user/interests ────────────
import { updateUserInterests, getUserInterests } from './controllers/tagController.js'
import authenticate from './middleware/authMiddleware.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ── Rate Limiting ──────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    message: { message: 'Too many authentication attempts. Please try again later.' }
})

// ── Security Middleware ───────────────────────────────────────
app.use(helmet())
app.use(globalLimiter)
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}))
app.use(express.json())

// ── DB connectivity check ─────────────────────────────────────
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected at:', result.rows[0].now)
    }
})

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        authLimiter, authRoutes)
app.use('/api/questions',   questionRoutes)
app.use('/api/answers',     answerRoutes)
app.use('/api/comments',    commentRoutes)
app.use('/api/ratings',     ratingRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/tags',        tagRoutes)
app.use('/api/reports',     reportRoutes)
app.use('/api/admin',       adminRoutes)
app.use('/api/user',        userRoutes)

// /api/user/interests (per spec: PUT and GET at /api/user/interests)
app.put('/api/user/interests',  authenticate, updateUserInterests)
app.get('/api/user/interests',  authenticate, getUserInterests)

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'CampusQ API is running!' })
})

// ── 404 fallback ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' })
})

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`CampusQ server running on port ${PORT}`)
})