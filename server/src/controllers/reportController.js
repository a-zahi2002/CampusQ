import pool from '../config/db.js'

export const createReport = async (req, res) => {
    const { target_type, target_id, reason } = req.body
    const { id: reporter_id, role: reporter_role } = req.user

    if (!['question', 'answer'].includes(target_type)) {
        return res.status(400).json({ message: 'Invalid target type. Must be "question" or "answer".' })
    }

    try {
        // Optional: Check if target exists
        let targetExists = false
        if (target_type === 'question') {
            const q = await pool.query('SELECT question_id FROM questions WHERE question_id = $1', [target_id])
            targetExists = q.rows.length > 0
        } else {
            const a = await pool.query('SELECT answer_id FROM answers WHERE answer_id = $1', [target_id])
            targetExists = a.rows.length > 0
        }

        if (!targetExists) {
            return res.status(404).json({ message: 'Target content not found.' })
        }

        const newReport = await pool.query(
            'INSERT INTO reports (reporter_id, reporter_role, target_type, target_id, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [reporter_id, reporter_role, target_type, target_id, reason]
        )

        res.status(201).json({
            message: 'Report submitted successfully.',
            report: newReport.rows[0]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}
