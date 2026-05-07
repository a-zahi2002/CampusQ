import express from 'express'
import {
    getAllUsers,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    approveUser,
    getPlatformStats,
    getAllContent,
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

// User Management
router.get('/users', getAllUsers)
router.post('/users', adminCreateUser)
router.patch('/users/:id', adminUpdateUser)
router.delete('/users/:id', adminDeleteUser)
router.patch('/users/:id/deactivate', deactivateUser)
router.patch('/users/:id/reactivate', reactivateUser)
router.patch('/users/:id/approve', approveUser)

// Platform Management
router.get('/stats', getPlatformStats)
router.get('/content', getAllContent)

// Content Moderation
router.patch('/questions/:id/hide', hideQuestion)
router.patch('/answers/:id/hide', hideAnswer)
router.delete('/questions/:id', adminDeleteQuestion)
router.delete('/answers/:id', adminDeleteAnswer)
router.delete('/comments/:id', adminDeleteComment)

export default router
