import { supabase } from '../supabaseClient.js'
import { logger } from '../lib/logger.js'

/**
 * Get all consultants
 */
export async function getConsultants(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, specialization, bio')
      .eq('role', 'consultant')

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    logger.error('booking.get_consultants_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to fetch consultants' })
  }
}

/**
 * Create a new booking
 */
export async function createBooking(req, res) {
  try {
    const { consultant_id, appointment_date, appointment_time, notes } = req.body
    const studentId = req.user.id

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        student_id: studentId,
        consultant_id,
        appointment_date,
        appointment_time,
        notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    logger.error('booking.create_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to create booking' })
  }
}

/**
 * Get user's bookings
 */
export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let query = supabase
      .from('bookings')
      .select(`
        *,
        student:users!bookings_student_id_fkey(full_name, email),
        consultant:users!bookings_consultant_id_fkey(full_name, email)
      `)

    // Filter based on role
    if (userRole === 'student') {
      query = query.eq('student_id', userId)
    } else if (userRole === 'consultant') {
      query = query.eq('consultant_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Format response
    const formattedData = data?.map(booking => ({
      ...booking,
      student_name: booking.student?.full_name,
      consultant_name: booking.consultant?.full_name,
    }))

    res.json(formattedData || [])
  } catch (error) {
    logger.error('booking.list_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

/**
 * Update booking status (consultant or admin only)
 */
export async function updateBookingStatus(req, res) {
  try {
    const { bookingId } = req.params
    const { status } = req.body
    const userId = req.user.id
    const userRole = req.user.role

    // Fetch the booking to check authorization and current status
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('consultant_id, status')
      .eq('id', bookingId)
      .single()

    if (fetchError) throw fetchError

    // Check if user is authorized to update this booking
    if (userRole !== 'admin' && booking.consultant_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this booking' })
    }

    // Enforce status transition: can only mark as 'completed' if current status is 'approved'
    if (status === 'completed' && booking.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved bookings can be marked as completed' })
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    logger.error('booking.update_status_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to update booking' })
  }
}
