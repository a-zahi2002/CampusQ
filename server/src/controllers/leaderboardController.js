import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// GET /api/leaderboard/alltime
// Public. Top 10 users by total points.
// ─────────────────────────────────────────────────────────────
export const getAllTimeLeaderboard = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                ROW_NUMBER() OVER (ORDER BY points DESC) AS rank,
                nickname,
                role,
                points
             FROM users
             WHERE is_active = TRUE
             ORDER BY points DESC
             LIMIT 10`
        )
        return res.status(200).json({ leaderboard: result.rows })

    } catch (err) {
        console.error('getAllTimeLeaderboard error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/leaderboard/monthly
// Public. Top 10 users by sum of stars received this calendar month.
// ─────────────────────────────────────────────────────────────
export const getMonthlyLeaderboard = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                ROW_NUMBER() OVER (ORDER BY SUM(r.stars) DESC) AS rank,
                u.nickname,
                u.role,
                SUM(r.stars) AS monthly_points
             FROM ratings r
             JOIN users u ON u.id = r.rated_user_id
             WHERE r.created_at >= date_trunc('month', CURRENT_DATE)
             GROUP BY u.id, u.nickname, u.role
             ORDER BY monthly_points DESC
             LIMIT 10`
        )
        return res.status(200).json({ leaderboard: result.rows })

    } catch (err) {
        console.error('getMonthlyLeaderboard error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
