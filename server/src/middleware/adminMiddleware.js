/**
 * isAdmin – RBAC middleware (must run after authenticate).
 * Checks req.user.role === 'admin'. Returns 403 otherwise.
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next()
    }
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' })
}

export default isAdmin
