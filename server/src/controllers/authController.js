import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Registers a student or lecturer. Admin cannot self-register.
// ─────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase()
    const { password, nickname, role } = req.body

    // Validate required fields
    if (!email || !password || !nickname || !role) {
        return res.status(400).json({ message: 'email, password, nickname, and role are required.' })
    }

    // Only student or lecturer allowed at registration
    if (!['student', 'lecturer'].includes(role)) {
        return res.status(400).json({ message: 'Role must be either "student" or "lecturer".' })
    }

    try {
        // Check for duplicate email or nickname
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR nickname = $2',
            [email, nickname]
        )
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Email or nickname already in use.' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (email, password, nickname, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nickname, role, is_active`,
            [email, hashedPassword, nickname, role]
        )

        const user = result.rows[0]

        // Issue JWT
        const token = jwt.sign(
            { id: user.id, nickname: user.nickname, role: user.role, is_active: user.is_active },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        return res.status(201).json({
            message: 'Registration successful.',
            token,
            user: { id: user.id, nickname: user.nickname, role: user.role }
        })

    } catch (err) {
        console.error('register error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase()
    const { password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required.' })
    }

    try {
        const result = await pool.query(
            'SELECT id, email, password, nickname, role, points, is_active FROM users WHERE email = $1',
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' })
        }

        const user = result.rows[0]

        // Check password
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(400).json({ message: 'Invalid email or password.' })
        }

        // Check account status
        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' })
        }

        // Issue JWT
        const token = jwt.sign(
            { id: user.id, nickname: user.nickname, role: user.role, is_active: user.is_active },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        return res.status(200).json({
            message: 'Login successful.',
            token,
            user: { id: user.id, nickname: user.nickname, role: user.role, is_active: user.is_active }
        })

    } catch (err) {
        console.error('login error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}