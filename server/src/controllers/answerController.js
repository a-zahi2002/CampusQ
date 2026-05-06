import pool from '../config/db.js'

// Post an answer
export const createAnswer = async (req, res) => {
  const { question_id, content } = req.body
  const { id, role } = req.user

  try {
    // Check if question exists
    const questionResult = await pool.query('SELECT * FROM questions WHERE question_id = $1', [question_id])
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' })
    }

    const newAnswer = await pool.query(
      `INSERT INTO answers (question_id, author_id, author_role, content) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [question_id, id, role, content]
    )

    res.status(201).json({
      message: 'Answer posted successfully.',
      answer: newAnswer.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get all answers for a question
export const getAnswersByQuestionId = async (req, res) => {
  const { questionId } = req.params

  try {
    const answers = await pool.query(
      `SELECT * FROM answers WHERE question_id = $1 AND is_hidden = FALSE ORDER BY created_at ASC`,
      [questionId]
    )

    res.status(200).json({ answers: answers.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Update an answer
export const updateAnswer = async (req, res) => {
  const { id } = req.params
  const { content } = req.body
  const { id: userId, role: userRole } = req.user

  try {
    // Check if answer exists
    const answerResult = await pool.query('SELECT * FROM answers WHERE answer_id = $1', [id])
    if (answerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Answer not found.' })
    }

    const answer = answerResult.rows[0]

    // Check ownership or admin role
    if (answer.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to edit this answer.' })
    }

    const updatedAnswer = await pool.query(
      `UPDATE answers SET content = $1 WHERE answer_id = $2 RETURNING *`,
      [content, id]
    )

    res.status(200).json({
      message: 'Answer updated successfully.',
      answer: updatedAnswer.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Delete an answer
export const deleteAnswer = async (req, res) => {
  const { id } = req.params
  const { id: userId, role: userRole } = req.user

  try {
    // Check if answer exists
    const answerResult = await pool.query('SELECT * FROM answers WHERE answer_id = $1', [id])
    if (answerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Answer not found.' })
    }

    const answer = answerResult.rows[0]

    // Check ownership or admin role
    if (answer.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this answer.' })
    }

    await pool.query('DELETE FROM answers WHERE answer_id = $1', [id])

    res.status(200).json({ message: 'Answer deleted successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Mark an answer as accepted
export const acceptAnswer = async (req, res) => {
  const { id } = req.params
  const { id: userId } = req.user

  try {
    // Get answer and question info
    const result = await pool.query(
      `SELECT a.*, q.author_id as question_author_id 
       FROM answers a 
       JOIN questions q ON a.question_id = q.question_id 
       WHERE a.answer_id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Answer not found.' })
    }

    const answer = result.rows[0]

    // Only the question owner can accept an answer
    if (answer.question_author_id !== userId) {
      return res.status(403).json({ message: 'Only the question owner can accept an answer.' })
    }

    // Reset any previously accepted answer for this question
    await pool.query(
      'UPDATE answers SET is_accepted = false WHERE question_id = $1',
      [answer.question_id]
    )

    // Mark this answer as accepted
    const updatedAnswer = await pool.query(
      'UPDATE answers SET is_accepted = true WHERE answer_id = $1 RETURNING *',
      [id]
    )

    res.status(200).json({
      message: 'Answer marked as accepted.',
      answer: updatedAnswer.rows[0]
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Rate an answer
export const rateAnswer = async (req, res) => {
  const { id } = req.params // answer_id
  const { rating } = req.body
  const { id: userId, role: userRole } = req.user

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' })
  }

  try {
    // 1. Get answer and question info to verify ownership
    const result = await pool.query(
      `SELECT a.*, q.author_id as question_author_id 
       FROM answers a 
       JOIN questions q ON a.question_id = q.question_id 
       WHERE a.answer_id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Answer not found.' })
    }

    const answer = result.rows[0]

    // 2. Only the question owner can rate an answer
    if (answer.question_author_id !== userId) {
      return res.status(403).json({ message: 'Only the question owner can rate answers.' })
    }

    // 3. Check for existing rating
    const existingRatingResult = await pool.query(
      'SELECT * FROM answer_ratings WHERE answer_id = $1 AND rater_id = $2 AND rater_role = $3',
      [id, userId, userRole]
    )

    let pointDifference = rating

    if (existingRatingResult.rows.length > 0) {
      // Update existing rating
      const oldRating = existingRatingResult.rows[0].rating
      pointDifference = rating - oldRating

      await pool.query(
        'UPDATE answer_ratings SET rating = $1 WHERE rating_id = $2',
        [rating, existingRatingResult.rows[0].rating_id]
      )
    } else {
      // Create new rating
      await pool.query(
        'INSERT INTO answer_ratings (answer_id, rater_id, rater_role, rating) VALUES ($1, $2, $3, $4)',
        [id, userId, userRole, rating]
      )
    }

    // 4. Update the answer author's cumulative points
    const authorTable = answer.author_role === 'lecturer' ? 'lecturers' : 'students'
    const authorIdField = answer.author_role === 'lecturer' ? 'lecturer_id' : 'student_id'

    await pool.query(
      `UPDATE ${authorTable} SET points = points + $1 WHERE ${authorIdField} = $2`,
      [pointDifference, answer.author_id]
    )

    res.status(200).json({
      message: existingRatingResult.rows.length > 0 ? 'Rating updated.' : 'Rating submitted.',
      newRating: rating,
      pointAdjustment: pointDifference
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
