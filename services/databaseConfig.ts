// Database configuration - switch between mock and Supabase
export const USE_SUPABASE = true; // Set to true to use Supabase, false for mock database

export const DATABASE_CONFIG = {
  useSupabase: USE_SUPABASE,
  mockFallback: true, // Fall back to mock if Supabase fails
};