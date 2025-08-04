import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for React Native
    storage: undefined // Let Supabase use default storage for React Native
  }
})

// Re-export types for convenience
export type {
  Database,
  User,
  BabyProfile,
  Event,
  UserBabyLink,
  InviteCode,
  EventType,
  UserRole,
  BabyWithRole,
  EventWithBaby,
  EventMetadata,
  NursingEventMetadata,
  PumpingEventMetadata
} from './types/database.types'