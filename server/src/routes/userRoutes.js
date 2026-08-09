import express from 'express'
import { updateUserInterests, getUserInterests } from '../controllers/tagController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

router.put('/interests', authenticate, updateUserInterests)
router.get('/interests', authenticate, getUserInterests)

export default router
