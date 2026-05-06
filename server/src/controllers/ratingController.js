import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// POST /api/ratings
// Auth required. Only the question owner can rate an answer.
// ─────────────────────────────────────────────────────────────
export const createRating = async (req, res) => {
    const { answer_id, stars } = req.body
    const { id: userId } = req.user

    if (!answer_id || stars === undefined) {
        return res.status(400).json({ message: 'answer_id and stars are required.' })
    }

    const starsInt = parseInt(stars, 10)
    if (isNaN(starsInt) || starsInt < 1 || starsInt > 5) {
        return res.status(400).json({ message: 'stars must be an integer between 1 and 5.' })
    }

    try {
        // Get answer + its question owner
        const aResult = await pool.query(
            `SELECT a.id AS answer_id, a.user_id AS answer_author_id,
                    q.id AS question_id, q.user_id AS question_owner_id
             FROM answers a
             JOIN questions q ON q.id = a.question_id
             WHERE a.id = $1`,
            [answer_id]
        )

        if (aResult.rows.length === 0) {
            return res.status(404).json({ message: 'Answer not found.' })
        }

        const { answer_author_id, question_id, question_owner_id } = aResult.rows[0]

        // Only the question owner can rate
        if (question_owner_id !== userId) {
            return res.status(403).json({ message: 'Only the question owner can rate answers.' })
        }

        // Cannot rate your own answer
        if (answer_author_id === userId) {
            return res.status(403).json({ message: 'You cannot rate your own answer.' })
        }

        // Check for existing rating
        const existing = await pool.query(
            'SELECT id, stars FROM ratings WHERE answer_id = $1 AND rater_user_id = $2',
            [answer_id, userId]
        )

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'You have already rated this answer. Use PUT to update.' })
        }

        // Insert rating
        await pool.query(
            `INSERT INTO ratings (question_id, answer_id, rater_user_id, rated_user_id, stars)
             VALUES ($1, $2, $3, $4, $5)`,
            [question_id, answer_id, userId, answer_author_id, starsInt]
        )

        // Add stars to answer author's points
        await pool.query(
            'UPDATE users SET points = points + $1 WHERE id = $2',
            [starsInt, answer_author_id]
        )

        return res.status(201).json({ message: 'Rating submitted.', stars: starsInt })

    } catch (err) {
        console.error('createRating error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/ratings/:id
// Auth required, rater only. Adjusts points by difference.
// ─────────────────────────────────────────────────────────────
export const updateRating = async (req, res) => {
    const { id } = req.params
    const { stars } = req.body
    const { id: userId } = req.user

    if (stars === undefined) {
        return res.status(400).json({ message: 'stars is required.' })
    }

    const starsInt = parseInt(stars, 10)
    if (isNaN(starsInt) || starsInt < 1 || starsInt > 5) {
        return res.status(400).json({ message: 'stars must be an integer between 1 and 5.' })
    }

    try {
        const rResult = await pool.query('SELECT * FROM ratings WHERE id = $1', [id])
        if (rResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found.' })
        }

        const rating = rResult.rows[0]

        if (rating.rater_user_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own ratings.' })
        }

        const diff = starsInt - rating.stars

        await pool.query('UPDATE ratings SET stars = $1 WHERE id = $2', [starsInt, id])

        // Adjust rated user's points by difference
        if (diff !== 0) {
            await pool.query(
                'UPDATE users SET points = points + $1 WHERE id = $2',
                [diff, rating.rated_user_id]
            )
        }

        return res.status(200).json({ message: 'Rating updated.', stars: starsInt, point_adjustment: diff })

    } catch (err) {
        console.error('updateRating error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/ratings/:id
// Auth required, rater only.
// ─────────────────────────────────────────────────────────────
export const deleteRating = async (req, res) => {
    const { id } = req.params
    const { id: userId } = req.user

    try {
        const rResult = await pool.query('SELECT * FROM ratings WHERE id = $1', [id])
        if (rResult.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found.' })
        }

        const rating = rResult.rows[0]

        if (rating.rater_user_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own ratings.' })
        }

        await pool.query('DELETE FROM ratings WHERE id = $1', [id])

        // Subtract stars from rated user's points
        await pool.query(
            'UPDATE users SET points = points - $1 WHERE id = $2',
            [rating.stars, rating.rated_user_id]
        )

        return res.status(200).json({ message: 'Rating deleted.' })

    } catch (err) {
        console.error('deleteRating error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/ratings/answer/:answerId
// Public. Returns avg stars and total count for an answer.
// ─────────────────────────────────────────────────────────────
export const getRatingsByAnswer = async (req, res) => {
    const { answerId } = req.params

    try {
        const result = await pool.query(
            `SELECT
                COALESCE(AVG(stars), 0) AS avg_stars,
                COUNT(id)               AS total_ratings
             FROM ratings
             WHERE answer_id = $1`,
            [answerId]
        )

        return res.status(200).json({ rating: result.rows[0] })

    } catch (err) {
        console.error('getRatingsByAnswer error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
