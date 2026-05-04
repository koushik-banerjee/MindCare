import { randomUUID } from 'crypto'
import { logger } from '../lib/logger.js'

export function requestContext(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID()
  req.requestId = requestId
  res.setHeader('x-request-id', requestId)

  const start = Date.now()
  res.on('finish', () => {
    const durationMs = Date.now() - start
    logger.info('request.completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    })
  })

  next()
}
