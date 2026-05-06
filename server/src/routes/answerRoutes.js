import express from 'express'
import { 
  createAnswer, 
  getAnswersByQuestionId, 
  updateAnswer, 
  deleteAnswer, 
  acceptAnswer,
  rateAnswer 
} from '../controllers/answerController.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authenticateToken, createAnswer)
router.get('/question/:questionId', getAnswersByQuestionId)
router.put('/:id', authenticateToken, updateAnswer)
router.delete('/:id', authenticateToken, deleteAnswer)
router.patch('/:id/accept', authenticateToken, acceptAnswer)
router.post('/:id/rate', authenticateToken, rateAnswer)

export default router
