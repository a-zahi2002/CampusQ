import express from 'express'
import { 
  createComment, 
  getCommentsByParent, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController.js'
import authenticateToken from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', authenticateToken, createComment)
router.get('/parent/:type/:id', getCommentsByParent)
router.put('/:id', authenticateToken, updateComment)
router.delete('/:id', authenticateToken, deleteComment)

export default router
