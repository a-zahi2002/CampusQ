import express from 'express'
import { createQuestion, getAllQuestions, getQuestionById } from '../controllers/questionController.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authenticateToken, createQuestion)
router.get('/', getAllQuestions)
router.get('/:id', getQuestionById)

export default router