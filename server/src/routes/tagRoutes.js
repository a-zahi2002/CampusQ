import express from 'express'
import { getAllTags, createTag, deleteTag } from '../controllers/tagController.js'
import authenticate from '../middleware/authMiddleware.js'
import isAdmin from '../middleware/adminMiddleware.js'

const router = express.Router()

// GET    /api/tags        – public
router.get('/', getAllTags)

// POST   /api/tags        – admin only
router.post('/', authenticate, isAdmin, createTag)

// DELETE /api/tags/:id    – admin only
router.delete('/:id', authenticate, isAdmin, deleteTag)

export default router
