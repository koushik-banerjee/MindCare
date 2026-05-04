import express from 'express'
import { authenticate } from '../middleware/roleAuth.js'
import { sendMessage, getConversations } from '../controllers/chat.controller.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.post('/send', sendMessage)
router.get('/conversations', getConversations)

export default router
