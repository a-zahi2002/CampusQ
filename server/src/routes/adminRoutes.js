import express from 'express'
import {
    getAllUsers,
    deactivateUser,
    reactivateUser,
    hideQuestion,
    hideAnswer,
    adminDeleteQuestion,
    adminDeleteAnswer,
    adminDeleteComment
} from '../controllers/adminController.js'
import authenticate from '../middleware/authMiddleware.js'
import isAdmin from '../middleware/adminMiddleware.js'

const router = express.Router()

// All admin routes require authentication + admin role
router.use(authenticate)
router.use(isAdmin)

// GET    /api/admin/users
router.get('/users', getAllUsers)

// PATCH  /api/admin/users/:id/deactivate
router.patch('/users/:id/deactivate', deactivateUser)

// PATCH  /api/admin/users/:id/reactivate
router.patch('/users/:id/reactivate', reactivateUser)

// PATCH  /api/admin/questions/:id/hide
router.patch('/questions/:id/hide', hideQuestion)

// PATCH  /api/admin/answers/:id/hide
router.patch('/answers/:id/hide', hideAnswer)

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', adminDeleteQuestion)

// DELETE /api/admin/answers/:id
router.delete('/answers/:id', adminDeleteAnswer)

// DELETE /api/admin/comments/:id
router.delete('/comments/:id', adminDeleteComment)

export default router
