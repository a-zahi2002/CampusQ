import pool from '../config/db.js'

// Get all-time leaderboard (Top 10)
export const getAllTimeLeaderboard = async (req, res) => {
  try {
    const query = `
      SELECT nickname, 'student' as role, points FROM students
      UNION ALL
      SELECT nickname, 'lecturer' as role, points FROM lecturers
      ORDER BY points DESC
      LIMIT 10
    `
    const result = await pool.query(query)
    res.status(200).json({ leaderboard: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get monthly leaderboard (Top 10)
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(s.nickname, l.nickname) as nickname,
        a.author_role as role,
        SUM(r.rating) as points
      FROM answer_ratings r
      JOIN answers a ON r.answer_id = a.answer_id
      LEFT JOIN students s ON a.author_id = s.student_id AND a.author_role = 'student'
      LEFT JOIN lecturers l ON a.author_id = l.lecturer_id AND a.author_role = 'lecturer'
      WHERE r.created_at >= date_trunc('month', current_date)
      GROUP BY a.author_id, a.author_role, nickname
      ORDER BY points DESC
      LIMIT 10
    `
    const result = await pool.query(query)
    res.status(200).json({ leaderboard: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
