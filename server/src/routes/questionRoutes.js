import express from 'express'
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} from '../controllers/questionController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

// POST   /api/questions           – auth required
router.post('/', authenticate, createQuestion)

// GET    /api/questions           – public (optional auth for interest-scoring)
router.get('/', (req, res, next) => {
    // Try to authenticate but don't block if no token
    const authHeader = req.headers['authorization']
    if (authHeader) {
        authenticate(req, res, next)
    } else {
        next()
    }
}, getAllQuestions)

// GET    /api/questions/:id       – public (optional auth for admin visibility)
router.get('/:id', (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (authHeader) {
        authenticate(req, res, next)
    } else {
        next()
    }
}, getQuestionById)

// PUT    /api/questions/:id       – auth required, owner only
router.put('/:id', authenticate, updateQuestion)

// DELETE /api/questions/:id       – auth required, owner or admin
router.delete('/:id', authenticate, deleteQuestion)

export default router