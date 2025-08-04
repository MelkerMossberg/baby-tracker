import { supabase } from '../supabase'
import type { User } from '../supabase'

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string) {
  try {
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(`Sign in failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(`Failed to get user: ${error.message}`)
    }

    if (!user) {
      return null
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // If no profile exists, return basic user info
      console.warn('User profile not found, user may need to complete setup')
      return null
    }

    return profile
  } catch (error) {
    console.error('Error getting current user:', error)
    throw error
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const user = await getCurrentUser()
        callback(user)
      } catch (error) {
        console.error('Error getting user profile:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}