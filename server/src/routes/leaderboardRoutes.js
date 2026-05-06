import express from 'express'
import { getAllTimeLeaderboard, getMonthlyLeaderboard } from '../controllers/leaderboardController.js'

const router = express.Router()

router.get('/all-time', getAllTimeLeaderboard)
router.get('/monthly', getMonthlyLeaderboard)

export default router
