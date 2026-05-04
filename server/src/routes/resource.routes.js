import express from 'express'
import { authenticate, authorize } from '../middleware/roleAuth.js'
import {
  getResources,
  searchYouTube,
  createResource,
  deleteResource,
  uploadFile,
} from '../controllers/resource.controller.js'
import { upload } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'
import {
  createResourceSchema,
  resourceIdParamSchema,
  searchYouTubeSchema,
  uploadFileSchema,
} from '../validation/schemas.js'

const router = express.Router()

// Get resources - all authenticated users
router.get('/', authenticate, getResources)
router.get('/youtube', authenticate, validate({ query: searchYouTubeSchema }), searchYouTube)

// Admin only routes
router.post(
  '/upload',
  authenticate,
  authorize('admin'),
  upload.single('file'),
  validate({ body: uploadFileSchema }),
  uploadFile
)
router.post('/create', authenticate, authorize('admin'), validate({ body: createResourceSchema }), createResource)
router.delete(
  '/:resourceId',
  authenticate,
  authorize('admin'),
  validate({ params: resourceIdParamSchema }),
  deleteResource
)

export default router
