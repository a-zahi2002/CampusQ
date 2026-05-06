import express from 'express'
import { getAllTimeLeaderboard, getMonthlyLeaderboard } from '../controllers/leaderboardController.js'

const router = express.Router()

// GET /api/leaderboard/alltime
router.get('/alltime', getAllTimeLeaderboard)

// GET /api/leaderboard/monthly
router.get('/monthly', getMonthlyLeaderboard)

export default router
