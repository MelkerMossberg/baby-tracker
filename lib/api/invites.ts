import { supabase } from '../supabase'
import type { InviteCode, UserRole } from '../supabase'

/**
 * Create an invite code for a baby
 */
export async function createInviteCode(
  babyId: string,
  role: UserRole = 'guest',
  expiresInDays: number = 7
): Promise<string> {
  const { data, error } = await supabase.rpc('create_invite_code', {
    baby_id: babyId,
    role,
    expires_in_days: expiresInDays
  })

  if (error) {
    throw new Error(`Failed to create invite code: ${error.message}`)
  }

  return data as string
}

/**
 * Redeem an invite code
 */
export async function redeemInviteCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('redeem_invite_code', {
    invite_code: code
  })

  if (error) {
    throw new Error(`Failed to redeem invite code: ${error.message}`)
  }

  return data as string // Returns baby_id
}

/**
 * Get invite codes for a baby (admin only)
 */
export async function getInviteCodesForBaby(babyId: string): Promise<InviteCode[]> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select(`
      *,
      users!invite_codes_created_by_fkey(name, email),
      users!invite_codes_used_by_fkey(name, email)
    `)
    .eq('baby_id', babyId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch invite codes: ${error.message}`)
  }

  return data as InviteCode[]
}

/**
 * Get active (unused, non-expired) invite codes for a baby
 */
export async function getActiveInviteCodesForBaby(babyId: string): Promise<InviteCode[]> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('baby_id', babyId)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch active invite codes: ${error.message}`)
  }

  return data
}

/**
 * Validate an invite code (without redeeming it)
 */
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  baby?: {
    id: string
    name: string
  }
  role?: UserRole
  expiresAt?: string
  error?: string
}> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select(`
      id,
      role,
      expires_at,
      used_at,
      baby_profiles(id, name)
    `)
    .eq('code', code)
    .single()

  if (error) {
    return {
      valid: false,
      error: 'Invalid invite code'
    }
  }

  // Check if already used
  if (data.used_at) {
    return {
      valid: false,
      error: 'Invite code has already been used'
    }
  }

  // Check if expired
  if (new Date(data.expires_at) <= new Date()) {
    return {
      valid: false,
      error: 'Invite code has expired'
    }
  }

  return {
    valid: true,
    baby: data.baby_profiles,
    role: data.role,
    expiresAt: data.expires_at
  }
}

/**
 * Delete/revoke an invite code (admin only)
 */
export async function deleteInviteCode(codeId: string): Promise<void> {
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', codeId)

  if (error) {
    throw new Error(`Failed to delete invite code: ${error.message}`)
  }
}

/**
 * Generate a shareable invite link
 */
export function generateInviteLink(code: string): string {
  const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${code}`
}