import pool from '../config/db.js'

// ─────────────────────────────────────────────────────────────
// GET /api/tags  – public
// ─────────────────────────────────────────────────────────────
export const getAllTags = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name FROM tags ORDER BY name ASC')
        return res.status(200).json({ tags: result.rows })
    } catch (err) {
        console.error('getAllTags error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/tags  – admin only
// ─────────────────────────────────────────────────────────────
export const createTag = async (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).json({ message: 'name is required.' })
    }

    try {
        const result = await pool.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id, name',
            [name.trim()]
        )
        return res.status(201).json({ message: 'Tag created.', tag: result.rows[0] })
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'A tag with that name already exists.' })
        }
        console.error('createTag error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/tags/:id  – admin only
// ─────────────────────────────────────────────────────────────
export const deleteTag = async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tag not found.' })
        }
        return res.status(200).json({ message: 'Tag deleted.' })
    } catch (err) {
        console.error('deleteTag error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/tags/:id  – admin only
// ─────────────────────────────────────────────────────────────
export const updateTag = async (req, res) => {
    const { id } = req.params
    const { name } = req.body

    if (!name) return res.status(400).json({ message: 'name is required.' })

    try {
        const result = await pool.query(
            'UPDATE tags SET name = $1 WHERE id = $2 RETURNING id, name',
            [name.trim(), id]
        )
        if (result.rows.length === 0) return res.status(404).json({ message: 'Tag not found.' })
        return res.status(200).json({ message: 'Tag updated.', tag: result.rows[0] })
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ message: 'A tag with that name already exists.' })
        console.error('updateTag error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/user/interests  – auth required
// Replaces entire interest set for the authenticated user.
// ─────────────────────────────────────────────────────────────
export const updateUserInterests = async (req, res) => {
    const { tag_ids } = req.body
    const { id: userId } = req.user

    if (!Array.isArray(tag_ids)) {
        return res.status(400).json({ message: 'tag_ids must be an array.' })
    }

    try {
        // Validate all tag IDs exist
        if (tag_ids.length > 0) {
            const tagCheck = await pool.query(
                'SELECT id FROM tags WHERE id = ANY($1::int[])',
                [tag_ids]
            )
            if (tagCheck.rows.length !== tag_ids.length) {
                return res.status(400).json({ message: 'One or more tag IDs are invalid.' })
            }
        }

        // Replace interests atomically
        await pool.query('DELETE FROM user_interests WHERE user_id = $1', [userId])

        if (tag_ids.length > 0) {
            // Parameterised bulk insert
            const values = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ')
            await pool.query(
                `INSERT INTO user_interests (user_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
                [userId, ...tag_ids]
            )
        }

        return res.status(200).json({ message: 'Interests updated successfully.' })

    } catch (err) {
        console.error('updateUserInterests error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/user/interests  – auth required
// ─────────────────────────────────────────────────────────────
export const getUserInterests = async (req, res) => {
    const { id: userId } = req.user

    try {
        const result = await pool.query(
            `SELECT t.id, t.name
             FROM tags t
             JOIN user_interests ui ON ui.tag_id = t.id
             WHERE ui.user_id = $1
             ORDER BY t.name ASC`,
            [userId]
        )
        return res.status(200).json({ interests: result.rows })
    } catch (err) {
        console.error('getUserInterests error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}
