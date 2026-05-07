import express from 'express'
import { getAllTags, createTag, deleteTag, updateTag } from '../controllers/tagController.js'
import authenticate from '../middleware/authMiddleware.js'
import isAdmin from '../middleware/adminMiddleware.js'

const router = express.Router()

// GET    /api/tags        – public
router.get('/', getAllTags)

// Admin only routes
router.post('/', authenticate, isAdmin, createTag)
router.patch('/:id', authenticate, isAdmin, updateTag)
router.delete('/:id', authenticate, isAdmin, deleteTag)

export default router
