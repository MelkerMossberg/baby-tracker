// TypeScript types generated from Supabase schema
// Run: supabase gen types typescript --local > lib/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      baby_profiles: {
        Row: {
          id: string
          name: string
          birthdate: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          birthdate: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          birthdate?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_profiles_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          baby_id: string
          created_by: string
          type: 'nursing' | 'sleep' | 'diaper' | 'pumping' | 'bottle' | 'solids'
          timestamp: string
          duration: number | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          baby_id: string
          created_by: string
          type: 'nursing' | 'sleep' | 'diaper' | 'pumping' | 'bottle' | 'solids'
          timestamp?: string
          duration?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          baby_id?: string
          created_by?: string
          type?: 'nursing' | 'sleep' | 'diaper' | 'pumping' | 'bottle' | 'solids'
          timestamp?: string
          duration?: number | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_baby_id_fkey"
            columns: ["baby_id"]
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invite_codes: {
        Row: {
          id: string
          code: string
          baby_id: string
          created_by: string
          role: 'admin' | 'guest'
          expires_at: string
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          baby_id: string
          created_by: string
          role?: 'admin' | 'guest'
          expires_at?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          baby_id?: string
          created_by?: string
          role?: 'admin' | 'guest'
          expires_at?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_baby_id_fkey"
            columns: ["baby_id"]
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_codes_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_codes_used_by_fkey"
            columns: ["used_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_baby_links: {
        Row: {
          id: string
          user_id: string
          baby_id: string
          role: 'admin' | 'guest'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          baby_id: string
          role: 'admin' | 'guest'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          baby_id?: string
          role?: 'admin' | 'guest'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_baby_links_baby_id_fkey"
            columns: ["baby_id"]
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_baby_links_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_baby_profile: {
        Args: {
          baby_name: string
          baby_birthdate: string
        }
        Returns: string
      }
      create_invite_code: {
        Args: {
          baby_id: string
          role?: 'admin' | 'guest'
          expires_in_days?: number
        }
        Returns: string
      }
      redeem_invite_code: {
        Args: {
          invite_code: string
        }
        Returns: string
      }
      remove_baby_access: {
        Args: {
          target_user_id: string
          baby_id: string
        }
        Returns: boolean
      }
      delete_user_account: {
        Args: {
          user_id_to_delete?: string
        }
        Returns: boolean
      }
      get_user_data_summary: {
        Args: {
          target_user_id?: string
        }
        Returns: Json
      }
      get_user_babies: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          name: string
          birthdate: string
          created_by: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      get_user_baby_by_id: {
        Args: {
          user_id: string
          baby_id: string
        }
        Returns: {
          id: string
          name: string
          birthdate: string
          created_by: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      get_baby_events: {
        Args: {
          p_user_id: string
          p_baby_id: string
        }
        Returns: {
          event_id: string
          baby_id: string
          created_by: string
          event_type: string
          event_timestamp: string
          duration: number
          notes: string
          metadata: Json
          created_at: string
          updated_at: string
        }[]
      }
      get_baby_events_by_type: {
        Args: {
          p_user_id: string
          p_baby_id: string
          p_event_type: string
        }
        Returns: {
          event_id: string
          baby_id: string
          created_by: string
          event_type: string
          event_timestamp: string
          duration: number
          notes: string
          metadata: Json
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type User = Database['public']['Tables']['users']['Row']
export type BabyProfile = Database['public']['Tables']['baby_profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type UserBabyLink = Database['public']['Tables']['user_baby_links']['Row']
export type InviteCode = Database['public']['Tables']['invite_codes']['Row']

export type EventType = Database['public']['Tables']['events']['Row']['type']
export type UserRole = Database['public']['Tables']['user_baby_links']['Row']['role']

// Extended types with relationships
export type BabyWithRole = BabyProfile & {
  role: UserRole
}

export type EventWithBaby = Event & {
  baby_profiles: BabyProfile
}

// Event metadata types for type safety
export interface NursingEventMetadata {
  side: 'left' | 'right'
}

export interface PumpingEventMetadata {
  side?: 'left' | 'right' | 'both'
  milliliters?: number
}

export interface EventMetadata {
  nursing?: NursingEventMetadata
  pumping?: PumpingEventMetadata
  [key: string]: any
}