import express from 'express'
import { authenticate } from '../middleware/roleAuth.js'
import { getProfile, updateProfile, uploadAvatar } from '../controllers/user.controller.js'
import { upload } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import { updateProfileSchema } from '../validation/schemas.js'

const router = express.Router()

// All user routes require authentication
router.use(authenticate)

router.get('/profile', getProfile)
router.patch('/profile', validate({ body: updateProfileSchema }), updateProfile)
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar)

export default router
