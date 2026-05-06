import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all users including real identity (email).
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, nickname, role, points, is_active, created_at
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
