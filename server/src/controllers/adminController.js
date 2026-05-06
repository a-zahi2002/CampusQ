import pool from '../config/db.js'

// View all users with real identity info
export const getAllUsers = async (req, res) => {
    try {
        const students = await pool.query('SELECT student_id as id, registration_number, email, nickname, created_at, is_admin, is_active, \'student\' as role FROM students')
        const lecturers = await pool.query('SELECT lecturer_id as id, registration_number, email, nickname, created_at, is_admin, is_active, \'lecturer\' as role FROM lecturers')
        
        res.status(200).json({
            users: [...students.rows, ...lecturers.rows]
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}

// View any user's full profile
export const getUserProfile = async (req, res) => {
    const { id, role } = req.params
    try {
        const table = role === 'lecturer' ? 'lecturers' : 'students'
        const idField = role === 'lecturer' ? 'lecturer_id' : 'student_id'

        const result = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = $1`, [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' })
        }

        const user = result.rows[0]
        delete user.password // Security

        res.status(200).json({ user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}

// Deactivate or reactivate a user account
export const toggleUserStatus = async (req, res) => {
    const { id, role, status } = req.body // status: true for activate, false for deactivate
    try {
        const table = role === 'lecturer' ? 'lecturers' : 'students'
        const idField = role === 'lecturer' ? 'lecturer_id' : 'student_id'

        await pool.query(`UPDATE ${table} SET is_active = $1 WHERE ${idField} = $2`, [status, id])
        
        res.status(200).json({ message: `User account ${status ? 'activated' : 'deactivated'} successfully.` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}

// View all reported/flagged questions and answers
export const getAllReports = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
            CASE 
                WHEN r.target_type = 'question' THEN q.title 
                WHEN r.target_type = 'answer' THEN a.content 
            END as target_preview,
            CASE 
                WHEN r.target_type = 'question' THEN q.is_hidden 
                WHEN r.target_type = 'answer' THEN a.is_hidden 
            END as is_hidden
            FROM reports r
            LEFT JOIN questions q ON r.target_type = 'question' AND r.target_id = q.question_id
            LEFT JOIN answers a ON r.target_type = 'answer' AND r.target_id = a.answer_id
            ORDER BY r.created_at DESC
        `)
        res.status(200).json({ reports: result.rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}

// Hide or permanently delete any question, answer, or comment
export const handleContent = async (req, res) => {
    const { action, type, id } = req.body // action: 'hide', 'show', 'delete'; type: 'question', 'answer', 'comment'
    try {
        let table, idField
        if (type === 'question') { table = 'questions'; idField = 'question_id' }
        else if (type === 'answer') { table = 'answers'; idField = 'answer_id' }
        else if (type === 'comment') { table = 'comments'; idField = 'comment_id' }
        else return res.status(400).json({ message: 'Invalid content type.' })

        if (action === 'hide') {
            await pool.query(`UPDATE ${table} SET is_hidden = TRUE WHERE ${idField} = $1`, [id])
            res.status(200).json({ message: 'Content hidden successfully.' })
        } else if (action === 'show') {
            await pool.query(`UPDATE ${table} SET is_hidden = FALSE WHERE ${idField} = $1`, [id])
            res.status(200).json({ message: 'Content unhidden successfully.' })
        } else if (action === 'delete') {
            await pool.query(`DELETE FROM ${table} WHERE ${idField} = $1`, [id])
            res.status(200).json({ message: 'Content permanently deleted.' })
        } else {
            res.status(400).json({ message: 'Invalid action.' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error.' })
    }
}
