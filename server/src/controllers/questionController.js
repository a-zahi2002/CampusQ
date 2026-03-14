import pool from '../config/db.js'

// Post a question
export const createQuestion = async (req, res) => {
  const { title, description, subject, semester, year, tags } = req.body
  const { id, role } = req.user

  try {
    // Insert the question
    const newQuestion = await pool.query(
      `INSERT INTO questions 
        (title, description, subject, semester, year, author_id, author_role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, subject, semester, year, id, role]
    )

    const question = newQuestion.rows[0]

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Insert tag if it doesn't exist, get its id
        const tag = await pool.query(
          `INSERT INTO tags (tag_name) 
           VALUES ($1) 
           ON CONFLICT (tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name 
           RETURNING tag_id`,
          [tagName]
        )

        const tagId = tag.rows[0].tag_id

        // Link tag to question
        await pool.query(
          `INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)`,
          [question.question_id, tagId]
        )
      }
    }

    res.status(201).json({
      message: 'Question posted successfully.',
      question
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await pool.query(
      `SELECT q.*, 
        ARRAY_AGG(t.tag_name) as tags
       FROM questions q
       LEFT JOIN question_tags qt ON q.question_id = qt.question_id
       LEFT JOIN tags t ON qt.tag_id = t.tag_id
       GROUP BY q.question_id
       ORDER BY q.created_at DESC`
    )

    res.status(200).json({ questions: questions.rows })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get single question by id
export const getQuestionById = async (req, res) => {
  const { id } = req.params

  try {
    const question = await pool.query(
      `SELECT q.*, 
        ARRAY_AGG(t.tag_name) as tags
       FROM questions q
       LEFT JOIN question_tags qt ON q.question_id = qt.question_id
       LEFT JOIN tags t ON qt.tag_id = t.tag_id
       WHERE q.question_id = $1
       GROUP BY q.question_id`,
      [id]
    )

    if (question.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' })
    }

    res.status(200).json({ question: question.rows[0] })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}