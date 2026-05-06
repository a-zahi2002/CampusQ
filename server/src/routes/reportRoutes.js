import express from 'express'
import { createReport, getAllReports, resolveReport } from '../controllers/reportController.js'
import authenticate from '../middleware/authMiddleware.js'
import isAdmin from '../middleware/adminMiddleware.js'

const router = express.Router()

// POST   /api/reports            – auth required
router.post('/', authenticate, createReport)

// GET    /api/reports            – admin only
router.get('/', authenticate, isAdmin, getAllReports)

// PATCH  /api/reports/:id/resolve – admin only
router.patch('/:id/resolve', authenticate, isAdmin, resolveReport)

export default router
