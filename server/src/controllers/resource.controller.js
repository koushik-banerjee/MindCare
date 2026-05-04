import { supabase } from '../supabaseClient.js'
import { logger } from '../lib/logger.js'

/**
 * Get resources with optional filters
 */
export async function getResources(req, res) {
  try {
    const { language, mediaType } = req.query

    let query = supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (language) {
      query = query.eq('language', language)
    }

    if (mediaType) {
      query = query.eq('media_type', mediaType)
    }

    const { data, error } = await query

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    logger.error('resource.list_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to fetch resources' })
  }
}

/**
 * Search YouTube for psychological session videos
 */
export async function searchYouTube(req, res) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing YouTube API key' })
    }

    const {
      q = 'psychological therapy session',
      maxResults = 12,
      safeSearch = 'strict',
      relevanceLanguage = 'en',
    } = req.query

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      q: String(q),
      maxResults: String(maxResults),
      safeSearch: String(safeSearch),
      relevanceLanguage: String(relevanceLanguage),
      key: apiKey,
    })

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`)
    if (!response.ok) {
      await response.text()
      logger.error('resource.youtube_api_failed', { requestId: req.requestId, status: response.status })
      return res.status(500).json({ error: 'Failed to fetch YouTube videos' })
    }

    const data = await response.json()
    const items = (data.items || []).map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      channelTitle: item.snippet?.channelTitle,
      publishedAt: item.snippet?.publishedAt,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
    }))

    res.json(items)
  } catch (error) {
    logger.error('resource.youtube_search_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to search YouTube' })
  }
}

/**
 * Create a new resource (admin only)
 */
export async function createResource(req, res) {
  try {
    const { title, description, media_type, media_url, language } = req.body
    const createdBy = req.user.id

    const { data, error } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        media_type,
        media_url,
        language,
        created_by: createdBy,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    logger.error('resource.create_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to create resource' })
  }
}

/**
 * Delete a resource (admin only)
 */
export async function deleteResource(req, res) {
  try {
    const { resourceId } = req.params

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (error) throw error

    res.json({ message: 'Resource deleted successfully' })
  } catch (error) {
    logger.error('resource.delete_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to delete resource' })
  }
}

/**
 * Upload a file to Supabase Storage (admin only)
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { mediaType } = req.body // 'video' or 'audio'

    const fileExt = req.file.originalname.split('.').pop()
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`
    const filePath = `${mediaType}s/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath)

    res.json({ 
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: fileName
    })
  } catch (error) {
    logger.error('resource.upload_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Failed to upload file' })
  }
}
