import multer from 'multer'
import { logger } from '../lib/logger.js'

// Configure storage (in memory for handling before Supabase upload)
const storage = multer.memoryStorage()
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 25)
const allowedMimeTypes = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'image/jpeg',
  'image/png',
  'image/webp',
]

// File filter to allow video, audio, and images
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    logger.warn('upload.file_rejected', {
      requestId: req.requestId,
      mimeType: file.mimetype,
      filename: file.originalname,
    })
    cb(new Error('Only video, audio, and image files are allowed!'), false)
  }
}

// Multer instance with different size limits
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024
  }
})
