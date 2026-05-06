import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// POST /api/comments
// Auth required.
// Only lecturers can comment on answers.
// Both students and lecturers can comment on questions.
// ─────────────────────────────────────────────────────────────
export const createComment = async (req, res) => {
    const { question_id, answer_id, body } = req.body
    const { id: userId, role } = req.user

    if (!body) {
        return res.status(400).json({ message: 'body is required.' })
    }

    // Exactly one parent must be provided
    if (!question_id && !answer_id) {
        return res.status(400).json({ message: 'Either question_id or answer_id must be provided.' })
    }
    if (question_id && answer_id) {
        return res.status(400).json({ message: 'Provide only one of question_id or answer_id, not both.' })
    }

    // Lecturers-only restriction for answer comments
    if (answer_id && role === 'student') {
        return res.status(403).json({ message: 'Only lecturers can comment on answers.' })
    }

    try {
        // Verify parent exists
        if (question_id) {
            const qResult = await pool.query('SELECT id FROM questions WHERE id = $1', [question_id])
            if (qResult.rows.length === 0) {
                return res.status(404).json({ message: 'Question not found.' })
            }
        } else {
            const aResult = await pool.query('SELECT id FROM answers WHERE id = $1', [answer_id])
            if (aResult.rows.length === 0) {
                return res.status(404).json({ message: 'Answer not found.' })
            }
        }

        const result = await pool.query(
            `INSERT INTO comments (user_id, question_id, answer_id, body)
             VALUES ($1, $2, $3, $4)
             RETURNING id, user_id, question_id, answer_id, body, created_at, updated_at`,
            [userId, question_id ?? null, answer_id ?? null, body]
        )

        return res.status(201).json({ message: 'Comment posted successfully.', comment: result.rows[0] })

    } catch (err) {
        console.error('createComment error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/comments/question/:questionId
// Public. Returns all comments on a question, ordered by created_at ASC.
// ─────────────────────────────────────────────────────────────
export const getCommentsByQuestion = async (req, res) => {
    const { questionId } = req.params

    try {
        const result = await pool.query(
            `SELECT c.id, c.body, c.created_at, c.updated_at,
                    u.nickname AS author_nickname,
                    u.role     AS author_role
             FROM comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.question_id = $1
             ORDER BY c.created_at ASC`,
            [questionId]
        )
        return res.status(200).json({ comments: result.rows })

    } catch (err) {
        console.error('getCommentsByQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/comments/answer/:answerId
// Public. Returns all comments on an answer, ordered by created_at ASC.
// ─────────────────────────────────────────────────────────────
export const getCommentsByAnswer = async (req, res) => {
    const { answerId } = req.params

    try {
        const result = await pool.query(
            `SELECT c.id, c.body, c.created_at, c.updated_at,
                    u.nickname AS author_nickname,
                    u.role     AS author_role
             FROM comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.answer_id = $1
             ORDER BY c.created_at ASC`,
            [answerId]
        )
        return res.status(200).json({ comments: result.rows })

    } catch (err) {
        console.error('getCommentsByAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/comments/:id
// Auth required, owner only.
// ─────────────────────────────────────────────────────────────
export const updateComment = async (req, res) => {
    const { id } = req.params
    const { body } = req.body
    const { id: userId } = req.user

    if (!body) {
        return res.status(400).json({ message: 'body is required.' })
    }

    try {
        const cResult = await pool.query('SELECT * FROM comments WHERE id = $1', [id])
        if (cResult.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found.' })
        }

        if (cResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only edit your own comments.' })
        }

        const updated = await pool.query(
            'UPDATE comments SET body = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [body, id]
        )

        return res.status(200).json({ message: 'Comment updated successfully.', comment: updated.rows[0] })

    } catch (err) {
        console.error('updateComment error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/comments/:id
// Auth required, owner or admin.
// ─────────────────────────────────────────────────────────────
export const deleteComment = async (req, res) => {
    const { id } = req.params
    const { id: userId, role } = req.user

    try {
        const cResult = await pool.query('SELECT * FROM comments WHERE id = $1', [id])
        if (cResult.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found.' })
        }

        if (cResult.rows[0].user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: 'Not authorised to delete this comment.' })
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [id])
        return res.status(200).json({ message: 'Comment deleted successfully.' })

    } catch (err) {
        console.error('deleteComment error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
