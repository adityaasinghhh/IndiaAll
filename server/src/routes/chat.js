import { Router } from 'express'
import { chat } from '../controllers/chatController.js'
import { chatLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/', chatLimiter, chat)

export default router
