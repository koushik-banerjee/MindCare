import express from 'express'
import { authenticate, authorize } from '../middleware/roleAuth.js'
import {
  getAllBookings,
  getAllUsers,
  updateUserRole,
} from '../controllers/admin.controller.js'

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticate)
router.use(authorize('admin'))

router.get('/bookings', getAllBookings)
router.get('/users', getAllUsers)
router.patch('/users/:userId/role', updateUserRole)

export default router
