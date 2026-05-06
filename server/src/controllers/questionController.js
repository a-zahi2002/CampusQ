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

// Get all questions (with optional tag filtering)
export const getAllQuestions = async (req, res) => {
  const { tag } = req.query

  try {
    let query = `
      SELECT q.*, 
        COALESCE(ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
        COUNT(DISTINCT a.answer_id) as answer_count,
        COALESCE(s.nickname, l.nickname) as author_nickname
      FROM questions q
      LEFT JOIN question_tags qt ON q.question_id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.tag_id
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.is_hidden = FALSE
      LEFT JOIN students s ON q.author_id = s.student_id AND q.author_role = 'student'
      LEFT JOIN lecturers l ON q.author_id = l.lecturer_id AND q.author_role = 'lecturer'
      WHERE q.is_hidden = FALSE
    `
    const params = []

    if (tag) {
      query += `
        AND q.question_id IN (
          SELECT qt2.question_id 
          FROM question_tags qt2 
          JOIN tags t2 ON qt2.tag_id = t2.tag_id 
          WHERE t2.tag_name = $1
        )
      `
      params.push(tag)
    }

    query += `
      GROUP BY q.question_id, s.nickname, l.nickname
      ORDER BY q.created_at DESC
    `

    const questions = await pool.query(query, params)
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
        COALESCE(ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
        COALESCE(s.nickname, l.nickname) as author_nickname
       FROM questions q
       LEFT JOIN question_tags qt ON q.question_id = qt.question_id
       LEFT JOIN tags t ON qt.tag_id = t.tag_id
       LEFT JOIN students s ON q.author_id = s.student_id AND q.author_role = 'student'
       LEFT JOIN lecturers l ON q.author_id = l.lecturer_id AND q.author_role = 'lecturer'
       WHERE q.question_id = $1 AND q.is_hidden = FALSE
       GROUP BY q.question_id, s.nickname, l.nickname`,
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

// Search questions
export const searchQuestions = async (req, res) => {
  const { keyword, tag } = req.query

  try {
    let query = `
      SELECT q.*, 
        COALESCE(ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), '{}') as tags,
        COUNT(DISTINCT a.answer_id) as answer_count,
        COALESCE(s.nickname, l.nickname) as author_nickname,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM question_tags qt2
            JOIN tags t2 ON qt2.tag_id = t2.tag_id
            WHERE qt2.question_id = q.question_id 
            AND LOWER(t2.tag_name) LIKE LOWER($1)
          ) THEN 1
          WHEN LOWER(q.title) LIKE LOWER($1) THEN 2
          WHEN LOWER(q.description) LIKE LOWER($1) THEN 3
          ELSE 4
        END as relevance
      FROM questions q
      LEFT JOIN question_tags qt ON q.question_id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.tag_id
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.is_hidden = FALSE
      LEFT JOIN students s ON q.author_id = s.student_id AND q.author_role = 'student'
      LEFT JOIN lecturers l ON q.author_id = l.lecturer_id AND q.author_role = 'lecturer'
    `

    const params = [`%${keyword || tag || ''}%`]

    if (tag) {
      query += `
        WHERE q.is_hidden = FALSE AND EXISTS (
          SELECT 1 FROM question_tags qt3
          JOIN tags t3 ON qt3.tag_id = t3.tag_id
          WHERE qt3.question_id = q.question_id
          AND LOWER(t3.tag_name) = LOWER($2)
        )
      `
      params.push(tag)
    } else if (keyword) {
      query += `
        WHERE q.is_hidden = FALSE AND (LOWER(q.title) LIKE LOWER($1)
        OR LOWER(q.description) LIKE LOWER($1)
        OR EXISTS (
          SELECT 1 FROM question_tags qt3
          JOIN tags t3 ON qt3.tag_id = t3.tag_id
          WHERE qt3.question_id = q.question_id
          AND LOWER(t3.tag_name) LIKE LOWER($1)
        ))
      `
    } else {
      query += ` WHERE q.is_hidden = FALSE `
    }

    query += `
      GROUP BY q.question_id, s.nickname, l.nickname
      ORDER BY relevance ASC, q.created_at DESC
    `

    const results = await pool.query(query, params)

    res.status(200).json({ questions: results.rows })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get prioritized question feed
export const getQuestionFeed = async (req, res) => {
  const { id: userId, role: userRole } = req.user

  try {
    // 1. Get user's preferred tags
    const prefResult = await pool.query(
      'SELECT tag_id FROM user_tag_preferences WHERE user_id = $1 AND user_role = $2',
      [userId, userRole]
    )
    
    const preferredTagIds = prefResult.rows.map(r => r.tag_id)

    let query = `
      SELECT q.*, 
        ARRAY_AGG(t.tag_name) as tags`
    
    if (preferredTagIds.length > 0) {
      query += `,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM question_tags qt3 
            WHERE qt3.question_id = q.question_id 
            AND qt3.tag_id = ANY($1)
          ) THEN 1 
          ELSE 0 
        END as is_preferred`
    } else {
      query += `, 0 as is_preferred`
    }

    query += `
      FROM questions q
      LEFT JOIN question_tags qt ON q.question_id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.tag_id
      WHERE q.is_hidden = FALSE
      GROUP BY q.question_id
    `

    if (preferredTagIds.length > 0) {
      query += `ORDER BY is_preferred DESC, q.created_at DESC`
      const results = await pool.query(query, [preferredTagIds])
      res.status(200).json({ questions: results.rows })
    } else {
      query += `ORDER BY q.created_at DESC`
      const results = await pool.query(query)
      res.status(200).json({ questions: results.rows })
    }

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// Get all unique tags
export const getTags = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tags ORDER BY tag_name ASC')
    res.status(200).json({ tags: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}