import { supabase } from '../supabaseClient.js'
import { logger } from '../lib/logger.js'

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
  try {
    // req.user is already populated by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    res.json(req.user)
  } catch (error) {
    logger.error('user.get_profile_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

/**
 * Update current user profile
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id
    const { full_name, bio, specialization, avatar_url, phone_number, address } = req.body

    // Define allowed updates based on what's in the users table
    const updates = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (bio !== undefined) updates.bio = bio
    if (specialization !== undefined) updates.specialization = specialization
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (phone_number !== undefined) updates.phone_number = phone_number
    if (address !== undefined) updates.address = address

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    logger.error('user.update_profile_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

/**
 * Upload avatar picture to Supabase Storage
 */
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const userId = req.user.id
    const fileExt = req.file.originalname.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage in 'profiles' bucket
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      })

    if (error) {
      if (error.message.includes('bucket not found')) {
        return res.status(404).json({ 
          error: 'Storage bucket "profiles" not found',
          message: 'Please create a public bucket named "profiles" in your Supabase dashboard.'
        })
      }
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    // Update user's avatar_url in the database and return the updated user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    res.json({ 
      message: 'Avatar uploaded successfully',
      url: publicUrl,
      user: updatedUser
    })
  } catch (error) {
    logger.error('user.upload_avatar_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
}
