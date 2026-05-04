import { supabase } from '../supabaseClient.js'
import { logger } from '../lib/logger.js'

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    req.user = profile
    next()
  } catch (error) {
    logger.error('auth.authenticate_failed', { requestId: req.requestId, error })
    res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Middleware to check user role
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
