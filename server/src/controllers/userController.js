import pool from '../config/db.js'

// Update user tag preferences
export const updateTagPreferences = async (req, res) => {
  const { tag_ids } = req.body // Array of tag IDs
  const { id: userId, role: userRole } = req.user

  if (!Array.isArray(tag_ids)) {
    return res.status(400).json({ message: 'tag_ids must be an array.' })
  }

  try {
    // 1. Delete existing preferences
    await pool.query(
      'DELETE FROM user_tag_preferences WHERE user_id = $1 AND user_role = $2',
      [userId, userRole]
    )

    // 2. Insert new preferences
    if (tag_ids.length > 0) {
      const values = tag_ids.map(tagId => `(${userId}, '${userRole}', ${tagId})`).join(',')
      await pool.query(
        `INSERT INTO user_tag_preferences (user_id, user_role, tag_id) VALUES ${values}`
      )
    }

    res.status(200).json({ message: 'Tag preferences updated successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get user preferences
export const getTagPreferences = async (req, res) => {
  const { id: userId, role: userRole } = req.user

  try {
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN user_tag_preferences utp ON t.tag_id = utp.tag_id
       WHERE utp.user_id = $1 AND utp.user_role = $2`,
      [userId, userRole]
    )

    res.status(200).json({ preferences: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
