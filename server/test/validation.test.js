import test from 'node:test'
import assert from 'node:assert/strict'
import {
  bookingIdParamSchema,
  createBookingSchema,
  searchYouTubeSchema,
  updateBookingStatusSchema,
} from '../src/validation/schemas.js'

test('createBookingSchema accepts valid payload', () => {
  const parsed = createBookingSchema.parse({
    consultant_id: '550e8400-e29b-41d4-a716-446655440000',
    appointment_date: '2026-05-01',
    appointment_time: '14:30',
    notes: 'Need support with stress management',
  })

  assert.equal(parsed.appointment_time, '14:30')
})

test('createBookingSchema rejects invalid date format', () => {
  assert.throws(
    () =>
      createBookingSchema.parse({
        consultant_id: '550e8400-e29b-41d4-a716-446655440000',
        appointment_date: '01-05-2026',
        appointment_time: '14:30',
      }),
    /YYYY-MM-DD/
  )
})

test('updateBookingStatusSchema rejects unsupported status', () => {
  assert.throws(
    () => updateBookingStatusSchema.parse({ status: 'archived' }),
    /Invalid option/
  )
})

test('bookingIdParamSchema rejects non-uuid', () => {
  assert.throws(() => bookingIdParamSchema.parse({ bookingId: '1234' }), /Invalid UUID/)
})

test('searchYouTubeSchema coerces maxResults and clamps limits', () => {
  const parsed = searchYouTubeSchema.parse({
    q: 'anxiety help',
    maxResults: '12',
    safeSearch: 'strict',
    relevanceLanguage: 'en',
  })

  assert.equal(parsed.maxResults, 12)
})
