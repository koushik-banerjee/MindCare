import { z } from 'zod'

const uuidSchema = z.string().uuid()

export const createBookingSchema = z.object({
  consultant_id: uuidSchema,
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  notes: z.string().max(2000).optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
})

export const bookingIdParamSchema = z.object({
  bookingId: uuidSchema,
})

export const createResourceSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  media_type: z.enum(['video', 'audio', 'article', 'pdf']),
  media_url: z.string().url(),
  language: z.string().trim().min(2).max(12),
})

export const resourceIdParamSchema = z.object({
  resourceId: uuidSchema,
})

export const uploadFileSchema = z.object({
  mediaType: z.enum(['video', 'audio']),
})

export const createPostSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  parent_id: uuidSchema.optional(),
})

export const postIdParamSchema = z.object({
  postId: uuidSchema,
})

export const updateProfileSchema = z
  .object({
    full_name: z.string().trim().min(1).max(120).optional(),
    bio: z.string().trim().max(1500).optional(),
    specialization: z.string().trim().max(120).optional(),
    avatar_url: z.string().url().optional(),
    phone_number: z.string().trim().max(30).optional(),
    address: z.string().trim().max(300).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No valid fields provided for update',
  })

export const searchYouTubeSchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  maxResults: z.coerce.number().int().min(1).max(25).optional(),
  safeSearch: z.enum(['moderate', 'none', 'strict']).optional(),
  relevanceLanguage: z.string().trim().min(2).max(5).optional(),
})
