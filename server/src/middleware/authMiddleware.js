import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * authenticate – JWT authentication middleware.
 * Attaches req.user = { id, nickname, role, is_active } on success.
 * Returns 401 if no token, 403 if invalid/expired.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // Attach only the fields consumers need
        req.user = {
            id:        decoded.id,
            nickname:  decoded.nickname,
            role:      decoded.role,
            is_active: decoded.is_active
        }
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' })
    }
}

export default authenticate