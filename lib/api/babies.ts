import { supabase } from '../supabase'
import type { BabyProfile, BabyWithRole } from '../supabase'

/**
 * Get all babies the current user has access to
 */
export async function getBabiesForUser(): Promise<BabyWithRole[]> {
  const { data, error } = await supabase
    .from('baby_profiles')
    .select(`
      *,
      user_baby_links!inner(role)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch babies: ${error.message}`)
  }

  // Transform the data to include role at the top level
  return data.map(baby => ({
    ...baby,
    role: baby.user_baby_links[0].role
  })) as BabyWithRole[]
}

/**
 * Get a specific baby profile by ID (only if user has access)
 */
export async function getBabyById(babyId: string): Promise<BabyWithRole | null> {
  const { data, error } = await supabase
    .from('baby_profiles')
    .select(`
      *,
      user_baby_links!inner(role)
    `)
    .eq('id', babyId)
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
}

/**
 * Create a new baby profile
 */
export async function createBaby(
  name: string,
  birthdate: string
): Promise<string> {
  const { data, error } = await supabase.rpc('create_baby_profile', {
    baby_name: name,
    baby_birthdate: birthdate
  })

  if (error) {
    throw new Error(`Failed to create baby: ${error.message}`)
  }

  return data as string
}

/**
 * Update a baby profile (admin only)
 */
export async function updateBaby(
  babyId: string,
  updates: Partial<Pick<BabyProfile, 'name' | 'birthdate'>>
): Promise<void> {
  const { error } = await supabase
    .from('baby_profiles')
    .update(updates)
    .eq('id', babyId)

  if (error) {
    throw new Error(`Failed to update baby: ${error.message}`)
  }
}

/**
 * Delete a baby profile (admin only)
 */
export async function deleteBaby(babyId: string): Promise<void> {
  const { error } = await supabase
    .from('baby_profiles')
    .delete()
    .eq('id', babyId)

  if (error) {
    throw new Error(`Failed to delete baby: ${error.message}`)
  }
}

/**
 * Get users who have access to a baby
 */
export async function getBabyUsers(babyId: string) {
  const { data, error } = await supabase
    .from('user_baby_links')
    .select(`
      role,
      created_at,
      users (
        id,
        name,
        email
      )
    `)
    .eq('baby_id', babyId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch baby users: ${error.message}`)
  }

  return data.map(link => ({
    ...link.users,
    role: link.role,
    linked_at: link.created_at
  }))
}

/**
 * Remove a user's access to a baby (admin only)
 */
export async function removeBabyAccess(
  userId: string,
  babyId: string
): Promise<void> {
  const { error } = await supabase.rpc('remove_baby_access', {
    target_user_id: userId,
    baby_id: babyId
  })

  if (error) {
    throw new Error(`Failed to remove access: ${error.message}`)
  }
}