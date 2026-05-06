import express from 'express'
import {
    createComment,
    getCommentsByQuestion,
    getCommentsByAnswer,
    updateComment,
    deleteComment
} from '../controllers/commentController.js'
import authenticate from '../middleware/authMiddleware.js'

const router = express.Router()

// POST  /api/comments                         – auth required
router.post('/', authenticate, createComment)

// GET   /api/comments/question/:questionId    – public
router.get('/question/:questionId', getCommentsByQuestion)

// GET   /api/comments/answer/:answerId        – public
router.get('/answer/:answerId', getCommentsByAnswer)

// PUT   /api/comments/:id                     – auth required, owner only
router.put('/:id', authenticate, updateComment)

// DELETE /api/comments/:id                    – auth required, owner or admin
router.delete('/:id', authenticate, deleteComment)

export default router
