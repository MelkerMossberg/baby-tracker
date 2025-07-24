import { supabase } from '../supabase'
import type { BabyProfile, BabyWithRole } from '../supabase'

/**
 * Get all babies the current user has access to
 */
export async function getBabiesForCurrentUser(): Promise<BabyWithRole[]> {
  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User must be authenticated to fetch babies')
    }

    // Fetch babies with user's role through the user_baby_links table
    const { data, error } = await supabase
      .from('baby_profiles')
      .select(`
        *,
        user_baby_links!inner(role)
      `)
      .eq('user_baby_links.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch babies: ${error.message}`)
    }

    // Transform the data to include role at the top level
    return data.map(baby => ({
      ...baby,
      role: baby.user_baby_links[0].role
    })) as BabyWithRole[]

  } catch (error) {
    console.error('Error fetching babies for current user:', error)
    throw error
  }
}

/**
 * Create a new baby profile and make the current user an admin
 */
export async function createBabyProfile(
  name: string, 
  birthdate: string
): Promise<string> {
  try {
    // Validate inputs
    if (!name.trim()) {
      throw new Error('Baby name is required')
    }
    
    if (!birthdate) {
      throw new Error('Birthdate is required')
    }

    // Validate birthdate format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthdate)) {
      throw new Error('Birthdate must be in YYYY-MM-DD format')
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User must be authenticated to create a baby profile')
    }

    // Use the database function to create baby profile and admin link
    const { data: babyId, error } = await supabase.rpc('create_baby_profile', {
      baby_name: name.trim(),
      baby_birthdate: birthdate
    })

    if (error) {
      throw new Error(`Failed to create baby profile: ${error.message}`)
    }

    if (!babyId) {
      throw new Error('Failed to create baby profile: No baby ID returned')
    }

    return babyId as string

  } catch (error) {
    console.error('Error creating baby profile:', error)
    throw error
  }
}

/**
 * Get a specific baby profile by ID (only if user has access)
 */
export async function getBabyById(babyId: string): Promise<BabyWithRole | null> {
  try {
    if (!babyId) {
      throw new Error('Baby ID is required')
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`)
    }
    
    if (!user) {
      throw new Error('User must be authenticated')
    }

    const { data, error } = await supabase
      .from('baby_profiles')
      .select(`
        *,
        user_baby_links!inner(role)
      `)
      .eq('id', babyId)
      .eq('user_baby_links.user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No access or baby doesn't exist
      }
      throw new Error(`Failed to fetch baby: ${error.message}`)
    }

    return {
      ...data,
      role: data.user_baby_links[0].role
    } as BabyWithRole

  } catch (error) {
    console.error('Error fetching baby by ID:', error)
    throw error
  }
}

/**
 * Update a baby profile (admin only)
 */
export async function updateBabyProfile(
  babyId: string,
  updates: Partial<Pick<BabyProfile, 'name' | 'birthdate'>>
): Promise<void> {
  try {
    if (!babyId) {
      throw new Error('Baby ID is required')
    }

    if (!updates.name?.trim() && !updates.birthdate) {
      throw new Error('At least one field must be updated')
    }

    // Validate birthdate format if provided
    if (updates.birthdate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(updates.birthdate)) {
        throw new Error('Birthdate must be in YYYY-MM-DD format')
      }
    }

    // Clean up the updates object
    const cleanUpdates: Partial<Pick<BabyProfile, 'name' | 'birthdate'>> = {}
    if (updates.name?.trim()) {
      cleanUpdates.name = updates.name.trim()
    }
    if (updates.birthdate) {
      cleanUpdates.birthdate = updates.birthdate
    }

    const { error } = await supabase
      .from('baby_profiles')
      .update(cleanUpdates)
      .eq('id', babyId)

    if (error) {
      throw new Error(`Failed to update baby profile: ${error.message}`)
    }

  } catch (error) {
    console.error('Error updating baby profile:', error)
    throw error
  }
}