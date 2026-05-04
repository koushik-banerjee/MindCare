import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  const missingVars = [
    !supabaseUrl ? 'SUPABASE_URL' : null,
    !supabaseServiceKey
      ? 'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)'
      : null,
  ].filter(Boolean)

  throw new Error(
    `Missing required Supabase environment variables: ${missingVars.join(', ')}.`
  )
}

// Use service role key for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
