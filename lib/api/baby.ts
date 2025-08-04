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

    console.log('🔄 Fetching babies using RPC function...');
    
    // Use RPC function to get babies (bypasses RLS issues)
    const { data: babies, error } = await supabase.rpc('get_user_babies', {
      user_id: user.id
    })

    if (error) {
      console.error('❌ RPC get_user_babies error:', error);
      throw new Error(`Failed to fetch babies: ${error.message}`)
    }

    console.log('✅ Successfully fetched babies:', babies?.length || 0, babies);
    
    // Transform to match expected interface
    return (babies || []).map(baby => ({
      id: baby.id,
      name: baby.name,
      birthdate: baby.birthdate,
      created_by: baby.created_by,
      created_at: baby.created_at,
      updated_at: baby.updated_at,
      role: baby.role as 'admin' | 'guest'
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
    console.log('🔄 Creating baby profile with RPC function:', { baby_name: name.trim(), baby_birthdate: birthdate });
    const { data: babyId, error } = await supabase.rpc('create_baby_profile', {
      baby_name: name.trim(),
      baby_birthdate: birthdate
    })

    if (error) {
      console.error('❌ RPC create_baby_profile error:', error);
      throw new Error(`Failed to create baby profile: ${error.message}`)
    }

    if (!babyId) {
      console.error('❌ No baby ID returned from RPC function');
      throw new Error('Failed to create baby profile: No baby ID returned')
    }

    console.log('✅ Baby profile created successfully with ID:', babyId);
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

    console.log('🔄 Fetching baby by ID using RPC function...');
    
    // Use RPC function to get baby by ID (bypasses RLS issues)
    const { data: babies, error } = await supabase.rpc('get_user_baby_by_id', {
      user_id: user.id,
      baby_id: babyId
    })

    if (error) {
      console.error('❌ RPC get_user_baby_by_id error:', error);
      throw new Error(`Failed to fetch baby: ${error.message}`)
    }

    if (!babies || babies.length === 0) {
      console.log('❌ Baby not found or no access');
      return null;
    }

    const baby = babies[0];
    console.log('✅ Successfully fetched baby by ID:', baby);
    
    // Transform to match expected interface
    return {
      id: baby.id,
      name: baby.name,
      birthdate: baby.birthdate,
      created_by: baby.created_by,
      created_at: baby.created_at,
      updated_at: baby.updated_at,
      role: baby.role as 'admin' | 'guest'
    } as BabyWithRole

  } catch (error) {
    console.error('Error fetching baby by ID:', error)
    return null
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