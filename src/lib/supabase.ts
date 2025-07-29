import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_key'

// Development mode flag
export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://demo.supabase.co'

if (isDemoMode) {
  console.warn('Running in demo mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)