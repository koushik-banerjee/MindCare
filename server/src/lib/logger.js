const sanitizeMeta = (meta = {}) => {
  const clone = { ...meta }
  const sensitiveKeys = ['authorization', 'token', 'password', 'apiKey', 'apikey', 'secret']

  for (const [key, value] of Object.entries(clone)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      clone[key] = '[REDACTED]'
      continue
    }

    if (value instanceof Error) {
      clone[key] = {
        name: value.name,
        message: value.message,
        stack: process.env.NODE_ENV === 'development' ? value.stack : undefined,
      }
    }
  }

  return clone
}

const writeLog = (level, message, meta = {}) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...sanitizeMeta(meta),
  }

  const serialized = JSON.stringify(payload)
  if (level === 'error') {
    console.error(serialized)
    return
  }
  console.log(serialized)
}

export const logger = {
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
}
