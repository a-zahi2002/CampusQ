import express from 'express'
import { registerStudent, registerLecturer, login } from '../controllers/authController.js'

const router = express.Router()

// Registration routes
router.post('/register/student', registerStudent)
router.post('/register/lecturer', registerLecturer)

// Login route
router.post('/login', login)

export default router