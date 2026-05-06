import express from 'express'
import { getAllUsers, getUserProfile, toggleUserStatus, getAllReports, handleContent } from '../controllers/adminController.js'
import authenticateToken from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminMiddleware.js'

const router = express.Router()

// All routes here are protected by both authentication and admin check
router.use(authenticateToken)
router.use(adminOnly)

router.get('/users', getAllUsers)
router.get('/users/:role/:id', getUserProfile)
router.post('/users/toggle-status', toggleUserStatus)
router.get('/reports', getAllReports)
router.post('/content/handle', handleContent)

export default router
