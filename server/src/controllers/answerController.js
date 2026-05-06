import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// POST /api/answers
// Auth required (student or lecturer)
// ─────────────────────────────────────────────────────────────
export const createAnswer = async (req, res) => {
    const { question_id, body } = req.body
    const { id: userId, role } = req.user

    if (!question_id || !body) {
        return res.status(400).json({ message: 'question_id and body are required.' })
    }

    if (!['student', 'lecturer'].includes(role)) {
        return res.status(403).json({ message: 'Only students and lecturers can post answers.' })
    }

    try {
        // Verify question exists and is not hidden
        const qResult = await pool.query(
            'SELECT id, is_hidden FROM questions WHERE id = $1',
            [question_id]
        )
        if (qResult.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }
        if (qResult.rows[0].is_hidden) {
            return res.status(403).json({ message: 'Cannot answer a hidden question.' })
        }

        const result = await pool.query(
            `INSERT INTO answers (question_id, user_id, body)
             VALUES ($1, $2, $3)
             RETURNING id, question_id, user_id, body, is_accepted, is_hidden, created_at, updated_at`,
            [question_id, userId, body]
        )

        return res.status(201).json({ message: 'Answer posted successfully.', answer: result.rows[0] })

    } catch (err) {
        console.error('createAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/answers/question/:questionId
// Public. Sorted: accepted first, then avg stars desc, then created_at asc.
// ─────────────────────────────────────────────────────────────
export const getAnswersByQuestionId = async (req, res) => {
    const { questionId } = req.params

    try {
        const result = await pool.query(
            `SELECT
                a.id, a.question_id, a.body, a.is_accepted, a.is_hidden, a.created_at, a.updated_at,
                u.nickname    AS author_nickname,
                u.role        AS author_role,
                COALESCE(AVG(r.stars), 0)  AS avg_stars,
                COUNT(r.id)                AS rating_count
             FROM answers a
             JOIN users u ON u.id = a.user_id
             LEFT JOIN ratings r ON r.answer_id = a.id
             WHERE a.question_id = $1 AND a.is_hidden = FALSE
             GROUP BY a.id, u.nickname, u.role
             ORDER BY a.is_accepted DESC, avg_stars DESC, a.created_at ASC`,
            [questionId]
        )

        return res.status(200).json({ answers: result.rows })

    } catch (err) {
        console.error('getAnswersByQuestionId error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/answers/:id
// Auth required, owner only.
// ─────────────────────────────────────────────────────────────
export const updateAnswer = async (req, res) => {
    const { id } = req.params
    const { body } = req.body
    const { id: userId } = req.user

    if (!body) {
        return res.status(400).json({ message: 'body is required.' })
    }

    try {
        const aResult = await pool.query('SELECT * FROM answers WHERE id = $1', [id])
        if (aResult.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }

        if (aResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only edit your own answers.' })
        }

        const updated = await pool.query(
            'UPDATE answers SET body = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [body, id]
        )

        return res.status(200).json({ message: 'Answer updated successfully.', answer: updated.rows[0] })

    } catch (err) {
        console.error('updateAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/answers/:id
// Auth required, owner or admin.
// ─────────────────────────────────────────────────────────────
export const deleteAnswer = async (req, res) => {
    const { id } = req.params
    const { id: userId, role } = req.user

    try {
        const aResult = await pool.query('SELECT * FROM answers WHERE id = $1', [id])
        if (aResult.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }

        if (aResult.rows[0].user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: 'Not authorised to delete this answer.' })
        }

        await pool.query('DELETE FROM answers WHERE id = $1', [id])
        return res.status(200).json({ message: 'Answer deleted successfully.' })

    } catch (err) {
        console.error('deleteAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/answers/:id/accept
// Auth required, question owner only.
// Marks this answer accepted; un-accepts any previous one.
// ─────────────────────────────────────────────────────────────
export const acceptAnswer = async (req, res) => {
    const { id } = req.params
    const { id: userId } = req.user

    try {
        const aResult = await pool.query(
            `SELECT a.*, q.user_id AS question_owner_id
             FROM answers a
             JOIN questions q ON q.id = a.question_id
             WHERE a.id = $1`,
            [id]
        )

        if (aResult.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }

        const answer = aResult.rows[0]

        if (answer.question_owner_id !== userId) {
            return res.status(403).json({ message: 'Only the question owner can accept an answer.' })
        }

        // Un-accept all answers on this question first
        await pool.query(
            'UPDATE answers SET is_accepted = FALSE, updated_at = NOW() WHERE question_id = $1',
            [answer.question_id]
        )

        // Accept this answer
        const updated = await pool.query(
            'UPDATE answers SET is_accepted = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
            [id]
        )

        return res.status(200).json({ message: 'Answer marked as accepted.', answer: updated.rows[0] })

    } catch (err) {
        console.error('acceptAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
