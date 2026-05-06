import express from 'express'
import {
    createRating,
    updateRating,
    deleteRating,
    getRatingsByAnswer
} from '../controllers/ratingController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

// POST   /api/ratings                        – auth required (question owner only)
router.post('/', authenticate, createRating)

// PUT    /api/ratings/:id                    – auth required, rater only
router.put('/:id', authenticate, updateRating)

// DELETE /api/ratings/:id                    – auth required, rater only
router.delete('/:id', authenticate, deleteRating)

// GET    /api/ratings/answer/:answerId       – public
router.get('/answer/:answerId', getRatingsByAnswer)

export default router
