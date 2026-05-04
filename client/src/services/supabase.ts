import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface User {
  id: string
  email: string
  role: 'student' | 'consultant' | 'admin'
  full_name?: string
  phone_number?: string
  address?: string
  avatar_url?: string
  created_at: string
}

export interface Booking {
  id: string
  student_id: string
  consultant_id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  notes?: string
  created_at: string
}

export interface Resource {
  id: string
  title: string
  description: string
  media_type: 'video' | 'audio'
  media_url: string
  language: string
  created_by: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  parent_id?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  created_at: string
}
