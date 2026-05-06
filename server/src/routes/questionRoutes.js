import express from 'express'
import { 
  createQuestion, 
  getAllQuestions, 
  getQuestionById,
  searchQuestions,
  getQuestionFeed
} from '../controllers/questionController.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authenticateToken, createQuestion)
router.get('/search', searchQuestions)
router.get('/feed', authenticateToken, getQuestionFeed)
router.get('/', getAllQuestions)
router.get('/:id', getQuestionById)

export default router