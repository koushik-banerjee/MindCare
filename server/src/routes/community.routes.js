import express from 'express'
import { authenticate, authorize } from '../middleware/roleAuth.js'
import {
  getPosts,
  createPost,
  deletePost,
} from '../controllers/community.controller.js'
import { validate } from '../middleware/validate.js'
import { createPostSchema, postIdParamSchema } from '../validation/schemas.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/posts', getPosts)
router.post('/posts', validate({ body: createPostSchema }), createPost)
router.delete('/posts/:postId', validate({ params: postIdParamSchema }), deletePost) // User or admin can delete

export default router
