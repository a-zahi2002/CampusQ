import express from 'express'
import {
    createAnswer,
    getAnswersByQuestionId,
    updateAnswer,
    deleteAnswer,
    acceptAnswer
} from '../controllers/answerController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

// POST   /api/answers                           – auth required
router.post('/', authenticate, createAnswer)

// GET    /api/answers/question/:questionId      – public
router.get('/question/:questionId', getAnswersByQuestionId)

// PUT    /api/answers/:id                       – auth required, owner only
router.put('/:id', authenticate, updateAnswer)

// DELETE /api/answers/:id                       – auth required, owner or admin
router.delete('/:id', authenticate, deleteAnswer)

// PATCH  /api/answers/:id/accept                – auth required, question owner only
router.patch('/:id/accept', authenticate, acceptAnswer)

export default router
