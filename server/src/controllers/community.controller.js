import { supabase } from '../supabaseClient.js'
import { logger } from '../lib/logger.js'

/**
 * Get all posts with author information
 */
export async function getPosts(req, res) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Format response
    const formattedData = data?.map(post => ({
      ...post,
      author_name: post.author?.full_name || 'Anonymous',
    }))

    res.json(formattedData || [])
  } catch (error) {
    logger.error('community.get_posts_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
}

/**
 * Create a new post or reply
 */
export async function createPost(req, res) {
  try {
    const { content, parent_id } = req.body
    const authorId = req.user.id

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: authorId,
        content,
        parent_id: parent_id || null,
      })
      .select(`
        *,
        author:users!posts_author_id_fkey(full_name, email)
      `)
      .single()

    if (error) throw error

    const formattedData = {
      ...data,
      author_name: data.author?.full_name || 'Anonymous',
    }

    res.status(201).json(formattedData)
  } catch (error) {
    logger.error('community.create_post_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to create post' })
  }
}

/**
 * Delete a post (author or admin only)
 */
export async function deletePost(req, res) {
  try {
    const { postId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    // Check if user is authorized to delete this post
    if (userRole !== 'admin') {
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()

      if (fetchError) throw fetchError

      if (post.author_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this post' })
      }
    }

    // Delete the post and its replies
    const { error } = await supabase
      .from('posts')
      .delete()
      .or(`id.eq.${postId},parent_id.eq.${postId}`)

    if (error) throw error

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    logger.error('community.delete_post_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to delete post' })
  }
}
