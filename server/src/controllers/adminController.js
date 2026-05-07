import pool from '../config/db.js'
import bcrypt from 'bcrypt'

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all users including real identity (email).
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, nickname, role, points, is_active, registration_number, created_at
             FROM users
             ORDER BY created_at DESC`
        )
        return res.status(200).json({ users: result.rows })
    } catch (err) {
        console.error('getAllUsers error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/users
// Super Admin can create any user
// ─────────────────────────────────────────────────────────────
export const adminCreateUser = async (req, res) => {
    const { email, password, nickname, role, registration_number } = req.body
    
    if (!email || !password || !nickname || !role) {
        return res.status(400).json({ message: 'Required fields missing.' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            `INSERT INTO users (email, password, nickname, role, registration_number)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, nickname, role`,
            [email.toLowerCase(), hashedPassword, nickname, role, registration_number]
        )
        return res.status(201).json({ user: result.rows[0], message: 'User created successfully.' })
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'Email or Nickname already exists.' })
        console.error('adminCreateUser error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id
// Super Admin can update any user detail
// ─────────────────────────────────────────────────────────────
export const adminUpdateUser = async (req, res) => {
    const { id } = req.params
    const { email, nickname, role, is_active, registration_number } = req.body

    try {
        const result = await pool.query(
            `UPDATE users 
             SET email = COALESCE($1, email),
                 nickname = COALESCE($2, nickname),
                 role = COALESCE($3, role),
                 is_active = COALESCE($4, is_active),
                 registration_number = COALESCE($5, registration_number),
                 updated_at = NOW()
             WHERE id = $6
             RETURNING id, email, nickname, role, is_active`,
            [email, nickname, role, is_active, registration_number, id]
        )

        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' })
        return res.status(200).json({ user: result.rows[0], message: 'User updated successfully.' })
    } catch (err) {
        console.error('adminUpdateUser error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id
// Permanent deletion
// ─────────────────────────────────────────────────────────────
export const adminDeleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' })
        return res.status(200).json({ message: 'User permanently deleted.' })
    } catch (err) {
        console.error('adminDeleteUser error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────────────────────
export const getPlatformStats = async (req, res) => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*) FROM users')
        const questionsCount = await pool.query('SELECT COUNT(*) FROM questions')
        const answersCount = await pool.query('SELECT COUNT(*) FROM answers')
        const reportsCount = await pool.query('SELECT COUNT(*) FROM reports WHERE is_resolved = FALSE')

        return res.status(200).json({
            stats: {
                users: parseInt(usersCount.rows[0].count),
                questions: parseInt(questionsCount.rows[0].count),
                answers: parseInt(answersCount.rows[0].count),
                pendingReports: parseInt(reportsCount.rows[0].count)
            }
        })
    } catch (err) {
        console.error('getPlatformStats error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/admin/content
// ─────────────────────────────────────────────────────────────
export const getAllContent = async (req, res) => {
    try {
        const questions = await pool.query(`
            SELECT q.*, u.nickname as author_name 
            FROM questions q 
            JOIN users u ON q.author_id = u.id 
            ORDER BY q.created_at DESC LIMIT 50
        `)
        const answers = await pool.query(`
            SELECT a.*, u.nickname as author_name 
            FROM answers a 
            JOIN users u ON a.author_id = u.id 
            ORDER BY a.created_at DESC LIMIT 50
        `)
        return res.status(200).json({ questions: questions.rows, answers: answers.rows })
    } catch (err) {
        console.error('getAllContent error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/deactivate
// ─────────────────────────────────────────────────────────────
export const deactivateUser = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            'UPDATE users SET is_active = FALSE WHERE id = $1 RETURNING id',
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' })
        }
        return res.status(200).json({ message: 'User account deactivated.' })
    } catch (err) {
        console.error('deactivateUser error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/reactivate
// ─────────────────────────────────────────────────────────────
export const reactivateUser = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            'UPDATE users SET is_active = TRUE WHERE id = $1 RETURNING id',
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' })
        }
        return res.status(200).json({ message: 'User account reactivated.' })
    } catch (err) {
        console.error('reactivateUser error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/questions/:id/hide
// ─────────────────────────────────────────────────────────────
export const hideQuestion = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            'UPDATE questions SET is_hidden = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id',
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }
        return res.status(200).json({ message: 'Question hidden.' })
    } catch (err) {
        console.error('hideQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/answers/:id/hide
// ─────────────────────────────────────────────────────────────
export const hideAnswer = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query(
            'UPDATE answers SET is_hidden = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id',
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }
        return res.status(200).json({ message: 'Answer hidden.' })
    } catch (err) {
        console.error('hideAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/questions/:id
// ─────────────────────────────────────────────────────────────
export const adminDeleteQuestion = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }
        return res.status(200).json({ message: 'Question permanently deleted.' })
    } catch (err) {
        console.error('adminDeleteQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/answers/:id
// ─────────────────────────────────────────────────────────────
export const adminDeleteAnswer = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM answers WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }
        return res.status(200).json({ message: 'Answer permanently deleted.' })
    } catch (err) {
        console.error('adminDeleteAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/comments/:id
// ─────────────────────────────────────────────────────────────
export const adminDeleteComment = async (req, res) => {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found.' })
        }
        return res.status(200).json({ message: 'Comment permanently deleted.' })
    } catch (err) {
        console.error('adminDeleteComment error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
