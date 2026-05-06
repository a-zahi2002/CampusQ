import express from 'express'
import { updateTagPreferences, getTagPreferences } from '../controllers/userController.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.put('/preferences/tags', authenticateToken, updateTagPreferences)
router.get('/preferences/tags', authenticateToken, getTagPreferences)

export default router
