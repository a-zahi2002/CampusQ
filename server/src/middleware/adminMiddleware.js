const adminOnly = (req, res, next) => {
    if (req.user && req.user.is_admin === true) {
        next()
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' })
    }
}

export default adminOnly
