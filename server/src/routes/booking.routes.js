import express from 'express'
import { authenticate, authorize } from '../middleware/roleAuth.js'
import {
  getConsultants,
  createBooking,
  getMyBookings,
  updateBookingStatus,
} from '../controllers/booking.controller.js'
import { validate } from '../middleware/validate.js'
import {
  bookingIdParamSchema,
  createBookingSchema,
  updateBookingStatusSchema,
} from '../validation/schemas.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/consultants', getConsultants)
router.post('/create', authorize('student'), validate({ body: createBookingSchema }), createBooking)
router.get('/my-bookings', getMyBookings)
router.patch(
  '/:bookingId/status',
  authorize('consultant', 'admin'),
  validate({ params: bookingIdParamSchema, body: updateBookingStatusSchema }),
  updateBookingStatus
)

export default router
