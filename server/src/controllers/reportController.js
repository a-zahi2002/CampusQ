import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// POST /api/reports
// Auth required. Reports a question OR answer (not both).
// ─────────────────────────────────────────────────────────────
export const createReport = async (req, res) => {
    const { question_id, answer_id, reason } = req.body
    const { id: reporterUserId } = req.user

    if (!reason) {
        return res.status(400).json({ message: 'reason is required.' })
    }

    // Exactly one of question_id / answer_id
    if (!question_id && !answer_id) {
        return res.status(400).json({ message: 'Either question_id or answer_id must be provided.' })
    }
    if (question_id && answer_id) {
        return res.status(400).json({ message: 'Provide only one of question_id or answer_id, not both.' })
    }

    try {
        // Verify target exists
        if (question_id) {
            const q = await pool.query('SELECT id FROM questions WHERE id = $1', [question_id])
            if (q.rows.length === 0) {
                return res.status(404).json({ message: 'Question not found.' })
            }
        } else {
            const a = await pool.query('SELECT id FROM answers WHERE id = $1', [answer_id])
            if (a.rows.length === 0) {
                return res.status(404).json({ message: 'Answer not found.' })
            }
        }

        const result = await pool.query(
            `INSERT INTO reports (reporter_user_id, question_id, answer_id, reason)
             VALUES ($1, $2, $3, $4)
             RETURNING id, reporter_user_id, question_id, answer_id, reason, is_resolved, created_at`,
            [reporterUserId, question_id ?? null, answer_id ?? null, reason]
        )

        return res.status(201).json({ message: 'Report submitted successfully.', report: result.rows[0] })

    } catch (err) {
        console.error('createReport error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/reports
// Admin only. Returns all unresolved reports.
// ─────────────────────────────────────────────────────────────
export const getAllReports = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.id, r.reason, r.is_resolved, r.created_at,
                u.nickname  AS reporter_nickname,
                r.question_id,
                r.answer_id,
                q.title     AS question_title,
                a.body      AS answer_body
             FROM reports r
             JOIN users u ON u.id = r.reporter_user_id
             LEFT JOIN questions q ON q.id = r.question_id
             LEFT JOIN answers   a ON a.id = r.answer_id
             WHERE r.is_resolved = FALSE
             ORDER BY r.created_at DESC`
        )
        return res.status(200).json({ reports: result.rows })

    } catch (err) {
        console.error('getAllReports error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/reports/:id/resolve
// Admin only. Marks report as resolved.
// ─────────────────────────────────────────────────────────────
export const resolveReport = async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query(
            'UPDATE reports SET is_resolved = TRUE WHERE id = $1 RETURNING id',
            [id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found.' })
        }
        return res.status(200).json({ message: 'Report marked as resolved.' })

    } catch (err) {
        console.error('resolveReport error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
