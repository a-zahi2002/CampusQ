import pool from '../config/db.js'

// Update user tag preferences
export const updateTagPreferences = async (req, res) => {
  const { tag_ids } = req.body // Array of tag IDs
  const { id: userId } = req.user

  if (!Array.isArray(tag_ids)) {
    return res.status(400).json({ message: 'tag_ids must be an array.' })
  }

  try {
    // 1. Delete existing preferences
    await pool.query(
      'DELETE FROM user_interests WHERE user_id = $1',
      [userId]
    )

    // 2. Insert new preferences
    if (tag_ids.length > 0) {
      const values = tag_ids.map(tagId => `(${userId}, ${tagId})`).join(',')
      await pool.query(
        `INSERT INTO user_interests (user_id, tag_id) VALUES ${values}`
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
  const { id: userId } = req.user

  try {
    const result = await pool.query(
      `SELECT t.* FROM tags t
       JOIN user_interests ui ON t.id = ui.tag_id
       WHERE ui.user_id = $1`,
      [userId]
    )

    res.status(200).json({ preferences: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
