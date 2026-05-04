import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { supabase } from './supabaseClient.js'
import { requestContext } from './middleware/requestContext.js'
import { logger } from './lib/logger.js'

// Import routes
import chatRoutes from './routes/chat.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import authRoutes from './routes/auth.routes.js'
import resourceRoutes from './routes/resource.routes.js'
import communityRoutes from './routes/community.routes.js'
import adminRoutes from './routes/admin.routes.js'
import userRoutes from './routes/user.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const IS_PROD = process.env.NODE_ENV === 'production'
const RAW_ALLOWED_ORIGINS = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173'
const ALLOWED_ORIGINS = RAW_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
const BODY_LIMIT = process.env.BODY_LIMIT || '1mb'
const TRUST_PROXY = process.env.TRUST_PROXY === 'true'

if (TRUST_PROXY) {
  app.set('trust proxy', 1)
}

let isShuttingDown = false

// Security middleware
app.use(requestContext)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    contentSecurityPolicy: false,
  })
)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    logger.warn('cors.blocked_origin', { origin })
    return callback(new Error('CORS origin denied'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 86400,
}))
app.options('*', cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: BODY_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

app.get('/readyz', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'not_ready', reason: 'shutting_down' })
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      throw error
    }
    return res.json({ status: 'ready', timestamp: new Date().toISOString() })
  } catch (error) {
    logger.error('readiness.check_failed', { requestId: req.requestId, error })
    return res.status(503).json({ status: 'not_ready', reason: 'dependency_unavailable' })
  }
})

// API Routes
app.use('/api/chat', chatRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  logger.error('request.unhandled_error', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    error: err,
  })
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  })
})

const startServer = () => {
  const server = app.listen(PORT, () => {
    logger.info('server.started', {
      port: Number(PORT),
      environment: process.env.NODE_ENV || 'development',
      health: `/health`,
      readiness: `/readyz`,
    })
  })

  const shutdown = (signal) => {
    if (isShuttingDown) return
    isShuttingDown = true
    logger.info('server.shutdown_initiated', { signal })

    server.close((error) => {
      if (error) {
        logger.error('server.shutdown_failed', { signal, error })
        process.exit(1)
      }
      logger.info('server.shutdown_complete', { signal })
      process.exit(0)
    })

    setTimeout(() => {
      logger.error('server.shutdown_timeout', { signal })
      process.exit(1)
    }, 10000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  return server
}

const entryFilePath = process.argv[1] ? fileURLToPath(import.meta.url) === process.argv[1] : false
if (entryFilePath) {
  startServer()
}

export default app
