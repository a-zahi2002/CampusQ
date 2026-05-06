import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

// Register Student
export const registerStudent = async (req, res) => {
    const { registration_number, email, nickname, password } = req.body

    try {
        // Check if email or nickname already exists
        const existingUser = await pool.query(
            'SELECT * FROM students WHERE email = $1 OR nickname = $2',
            [email, nickname]
        )

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email or nickname already in use.' })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert new student
        const newStudent = await pool.query(
            'INSERT INTO students (registration_number, email, nickname, password) VALUES ($1, $2, $3, $4) RETURNING student_id, nickname, email',
            [registration_number, email, nickname, hashedPassword]
        )

        res.status(201).json({
            message: 'Student registered successfully.',
            user: newStudent.rows[0]
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}


// Register Lecturer
export const registerLecturer = async (req, res) => {
    const { registration_number, email, nickname, password } = req.body

    try {
        const existingUser = await pool.query(
            'SELECT * FROM lecturers WHERE email = $1 OR nickname = $2',
            [email, nickname]
        )

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email or nickname already in use.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newLecturer = await pool.query(
            'INSERT INTO lecturers (registration_number, email, nickname, password) VALUES ($1, $2, $3, $4) RETURNING lecturer_id, nickname, email',
            [registration_number, email, nickname, hashedPassword]
        )

        res.status(201).json({
            message: 'Lecturer registered successfully.',
            user: newLecturer.rows[0]
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}

// Login - works for both students and lecturers
export const login = async (req, res) => {
    const { email, password, role } = req.body

    try {
        // Determine which table to query based on role
        const table = role === 'lecturer' ? 'lecturers' : 'students'
        const idField = role === 'lecturer' ? 'lecturer_id' : 'student_id'

        const result = await pool.query(
            `SELECT * FROM ${table} WHERE email = $1`,
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' })
        }

        const user = result.rows[0]

        // Compare password with hashed password
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' })
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact an admin.' })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user[idField], nickname: user.nickname, role: role, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user[idField],
                nickname: user.nickname,
                email: user.email,
                role: role,
                is_admin: user.is_admin
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}