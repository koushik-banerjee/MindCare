import { supabase } from '../supabaseClient.js'

/**
 * Get all bookings (admin only)
 */
export async function getAllBookings(req, res) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        student:users!bookings_student_id_fkey(full_name, email),
        consultant:users!bookings_consultant_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format response
    const formattedData = data?.map(booking => ({
      ...booking,
      student_name: booking.student?.full_name,
      consultant_name: booking.consultant?.full_name,
    }))

    res.json(formattedData || [])
  } catch (error) {
    console.error('Get all bookings error:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['student', 'consultant', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
}
