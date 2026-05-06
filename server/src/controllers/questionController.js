import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// POST /api/questions
// Auth required (student or lecturer)
// ─────────────────────────────────────────────────────────────
export const createQuestion = async (req, res) => {
    const { title, body, tags } = req.body
    const { id: userId, role } = req.user

    if (!title || !body) {
        return res.status(400).json({ message: 'title and body are required.' })
    }

    if (!['student', 'lecturer'].includes(role)) {
        return res.status(403).json({ message: 'Only students and lecturers can post questions.' })
    }

    try {
        // Validate tag IDs if provided
        if (tags && tags.length > 0) {
            const tagCheck = await pool.query(
                'SELECT id FROM tags WHERE id = ANY($1::int[])',
                [tags]
            )
            if (tagCheck.rows.length !== tags.length) {
                return res.status(400).json({ message: 'One or more tag IDs are invalid.' })
            }
        }

        // Insert question
        const result = await pool.query(
            `INSERT INTO questions (user_id, title, body)
             VALUES ($1, $2, $3)
             RETURNING id, user_id, title, body, is_hidden, created_at, updated_at`,
            [userId, title, body]
        )

        const question = result.rows[0]

        // Link tags
        if (tags && tags.length > 0) {
            for (const tagId of tags) {
                await pool.query(
                    'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [question.id, tagId]
                )
            }
        }

        return res.status(201).json({ message: 'Question posted successfully.', question })

    } catch (err) {
        console.error('createQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/questions
// Public. Supports: ?search=, ?tag_id=
// If authenticated with interests, interest-matched questions float up.
// ─────────────────────────────────────────────────────────────
export const getAllQuestions = async (req, res) => {
    const { search, tag_id } = req.query
    const userId = req.user?.id ?? null

    try {
        // Fetch user interests if authenticated
        let preferredTagIds = []
        if (userId) {
            const pref = await pool.query(
                'SELECT tag_id FROM user_interests WHERE user_id = $1',
                [userId]
            )
            preferredTagIds = pref.rows.map(r => r.tag_id)
        }

        const params = []
        let paramIdx = 1

        let interestExpr = '0'
        if (preferredTagIds.length > 0) {
            params.push(preferredTagIds)
            interestExpr = `(SELECT COUNT(*) FROM question_tags qi WHERE qi.question_id = q.id AND qi.tag_id = ANY($${paramIdx}::int[]))::int`
            paramIdx++
        }

        let whereClause = 'WHERE q.is_hidden = FALSE'

        if (tag_id) {
            params.push(parseInt(tag_id, 10))
            whereClause += ` AND EXISTS (
                SELECT 1 FROM question_tags qt2
                WHERE qt2.question_id = q.id AND qt2.tag_id = $${paramIdx}
            )`
            paramIdx++
        }

        if (search) {
            params.push(`%${search}%`)
            whereClause += ` AND (q.title ILIKE $${paramIdx} OR q.body ILIKE $${paramIdx})`
            paramIdx++
        }

        const query = `
            SELECT
                q.id, q.title, q.body, q.is_hidden, q.created_at, q.updated_at,
                u.nickname   AS author_nickname,
                u.role       AS author_role,
                COALESCE(
                    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}'
                ) AS tags,
                COUNT(DISTINCT a.id) AS answer_count,
                ${interestExpr} AS interest_score
            FROM questions q
            JOIN users u ON u.id = q.user_id
            LEFT JOIN question_tags qt ON qt.question_id = q.id
            LEFT JOIN tags t           ON t.id = qt.tag_id
            LEFT JOIN answers a        ON a.question_id = q.id AND a.is_hidden = FALSE
            ${whereClause}
            GROUP BY q.id, u.nickname, u.role
            ORDER BY interest_score DESC, q.created_at DESC
        `

        const result = await pool.query(query, params)
        return res.status(200).json({ questions: result.rows })

    } catch (err) {
        console.error('getAllQuestions error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/questions/:id
// Public. Hidden questions only visible to admins.
// ─────────────────────────────────────────────────────────────
export const getQuestionById = async (req, res) => {
    const { id } = req.params
    const userRole = req.user?.role ?? null

    try {
        const result = await pool.query(
            `SELECT
                q.id, q.title, q.body, q.is_hidden, q.created_at, q.updated_at,
                u.nickname AS author_nickname,
                u.role     AS author_role,
                COALESCE(
                    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}'
                ) AS tags,
                COUNT(DISTINCT a.id) AS answer_count
             FROM questions q
             JOIN users u ON u.id = q.user_id
             LEFT JOIN question_tags qt ON qt.question_id = q.id
             LEFT JOIN tags t           ON t.id = qt.tag_id
             LEFT JOIN answers a        ON a.question_id = q.id AND a.is_hidden = FALSE
             WHERE q.id = $1
             GROUP BY q.id, u.nickname, u.role`,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }

        const question = result.rows[0]

        if (question.is_hidden && userRole !== 'admin') {
            return res.status(404).json({ message: 'Question not found.' })
        }

        return res.status(200).json({ question })

    } catch (err) {
        console.error('getQuestionById error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/questions/:id
// Auth required, owner only.
// ─────────────────────────────────────────────────────────────
export const updateQuestion = async (req, res) => {
    const { id } = req.params
    const { title, body, tags } = req.body
    const { id: userId } = req.user

    if (!title && !body && !tags) {
        return res.status(400).json({ message: 'At least one of title, body, or tags is required.' })
    }

    try {
        const qResult = await pool.query('SELECT * FROM questions WHERE id = $1', [id])
        if (qResult.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }

        const question = qResult.rows[0]
        if (question.user_id !== userId) {
            return res.status(403).json({ message: 'You can only edit your own questions.' })
        }

        // Validate new tags if provided
        if (tags && tags.length > 0) {
            const tagCheck = await pool.query(
                'SELECT id FROM tags WHERE id = ANY($1::int[])',
                [tags]
            )
            if (tagCheck.rows.length !== tags.length) {
                return res.status(400).json({ message: 'One or more tag IDs are invalid.' })
            }
        }

        const updatedTitle = title ?? question.title
        const updatedBody  = body  ?? question.body

        const updated = await pool.query(
            `UPDATE questions SET title = $1, body = $2, updated_at = NOW()
             WHERE id = $3 RETURNING *`,
            [updatedTitle, updatedBody, id]
        )

        // Replace tags
        if (tags !== undefined) {
            await pool.query('DELETE FROM question_tags WHERE question_id = $1', [id])
            for (const tagId of tags) {
                await pool.query(
                    'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [id, tagId]
                )
            }
        }

        return res.status(200).json({ message: 'Question updated successfully.', question: updated.rows[0] })

    } catch (err) {
        console.error('updateQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/questions/:id
// Auth required, owner or admin.
// ─────────────────────────────────────────────────────────────
export const deleteQuestion = async (req, res) => {
    const { id } = req.params
    const { id: userId, role } = req.user

    try {
        const qResult = await pool.query('SELECT * FROM questions WHERE id = $1', [id])
        if (qResult.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found.' })
        }

        const question = qResult.rows[0]
        if (question.user_id !== userId && role !== 'admin') {
            return res.status(403).json({ message: 'Not authorised to delete this question.' })
        }

        await pool.query('DELETE FROM questions WHERE id = $1', [id])
        return res.status(200).json({ message: 'Question deleted successfully.' })

    } catch (err) {
        console.error('deleteQuestion error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}