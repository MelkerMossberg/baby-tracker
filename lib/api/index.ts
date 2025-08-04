// Export all API functions for easy importing
export * from './auth'
export * from './baby'
export * from './events'

// Re-export the main client and types
export { supabase } from '../supabase'
export type * from '../supabase'