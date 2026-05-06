import pool from '../config/db.js'

// Post a comment
export const createComment = async (req, res) => {
  const { parent_type, parent_id, content } = req.body
  const { id, role } = req.user

  if (!['question', 'answer'].includes(parent_type)) {
    return res.status(400).json({ message: 'Invalid parent type. Must be question or answer.' })
  }

  try {
    // Check if parent exists
    const table = parent_type === 'question' ? 'questions' : 'answers'
    const idField = parent_type === 'question' ? 'question_id' : 'answer_id'
    
    const parentResult = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = $1`, [parent_id])
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ message: `${parent_type.charAt(0).toUpperCase() + parent_type.slice(1)} not found.` })
    }

    const newComment = await pool.query(
      `INSERT INTO comments (parent_type, parent_id, author_id, author_role, content) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [parent_type, parent_id, id, role, content]
    )

    res.status(201).json({
      message: 'Comment posted successfully.',
      comment: newComment.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get comments for a parent (question or answer)
export const getCommentsByParent = async (req, res) => {
  const { type, id } = req.params

  if (!['question', 'answer'].includes(type)) {
    return res.status(400).json({ message: 'Invalid parent type.' })
  }

  try {
    const comments = await pool.query(
      `SELECT c.*, 
        COALESCE(s.nickname, l.nickname) as author_nickname
       FROM comments c
       LEFT JOIN students s ON c.author_id = s.student_id AND c.author_role = 'student'
       LEFT JOIN lecturers l ON c.author_id = l.lecturer_id AND c.author_role = 'lecturer'
       WHERE c.parent_type = $1 AND c.parent_id = $2 AND c.is_hidden = FALSE 
       ORDER BY c.created_at ASC`,
      [type, id]
    )

    res.status(200).json({ comments: comments.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Update a comment
export const updateComment = async (req, res) => {
  const { id } = req.params
  const { content } = req.body
  const { id: userId, role: userRole } = req.user

  try {
    // Check if comment exists
    const commentResult = await pool.query('SELECT * FROM comments WHERE comment_id = $1', [id])
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found.' })
    }

    const comment = commentResult.rows[0]

    // Check ownership or admin role
    if (comment.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to edit this comment.' })
    }

    const updatedComment = await pool.query(
      `UPDATE comments SET content = $1 WHERE comment_id = $2 RETURNING *`,
      [content, id]
    )

    res.status(200).json({
      message: 'Comment updated successfully.',
      comment: updatedComment.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Delete a comment
export const deleteComment = async (req, res) => {
  const { id } = req.params
  const { id: userId, role: userRole } = req.user

  try {
    // Check if comment exists
    const commentResult = await pool.query('SELECT * FROM comments WHERE comment_id = $1', [id])
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found.' })
    }

    const comment = commentResult.rows[0]

    // Check ownership or admin role
    if (comment.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this comment.' })
    }

    await pool.query('DELETE FROM comments WHERE comment_id = $1', [id])

    res.status(200).json({ message: 'Comment deleted successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
