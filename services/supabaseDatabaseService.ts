import { BabyProfile, User, Event } from '../types/models';
import {
  getBabiesForCurrentUser,
  getBabyById,
  createBabyProfile as createBabyProfileAPI,
  updateBabyProfile
} from '../lib/api/baby';
import {
  getEventsForBabyLocal,
  getEventsByTypeLocal,
  createEventLocal,
  updateEventLocal,
  deleteEventLocal
} from '../lib/api/events';
import {
  getCurrentUser,
  signIn,
  signUp
} from '../lib/api/auth';

/**
 * Supabase-based database service that maintains compatibility with the existing DatabaseService interface
 */
class SupabaseDatabaseService {
  private isInitializing = false;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      throw new Error('Database initialization already in progress');
    }

    this.isInitializing = true;

    try {
      // Supabase doesn't need explicit initialization like SQLite
      // Just verify we can connect (optional)
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Supabase database initialization failed:', error);
      throw new Error('Supabase database initialization failed');
    } finally {
      this.isInitializing = false;
    }
  }

  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
  }

  /**
   * Create a new baby profile
   */
  async createBabyProfile(baby: BabyProfile): Promise<void> {
    this.checkInitialized();

    try {
      if (!baby.name || !baby.birthdate) {
        throw new Error('Baby name and birthdate are required');
      }

      // Convert birthdate to string format for Supabase
      const birthdateString = baby.birthdate instanceof Date 
        ? baby.birthdate.toISOString().split('T')[0] // YYYY-MM-DD format
        : baby.birthdate;

      await createBabyProfileAPI(baby.name, birthdateString);
    } catch (error) {
      console.error('Error creating baby profile:', error);
      throw error;
    }
  }

  /**
   * Get a baby profile by ID
   */
  async getBabyProfile(id: string): Promise<BabyProfile | null> {
    this.checkInitialized();

    try {
      const baby = await getBabyById(id);
      
      if (!baby) {
        return null;
      }

      // Convert Supabase baby to local BabyProfile format
      return {
        id: baby.id,
        name: baby.name,
        birthdate: new Date(baby.birthdate),
        shareCode: '' // Supabase doesn't use share codes in the same way
      };
    } catch (error) {
      console.error('Error getting baby profile:', error);
      throw error;
    }
  }

  /**
   * Get all baby profiles for the current user
   */
  async getAllBabyProfiles(): Promise<BabyProfile[]> {
    this.checkInitialized();

    try {
      const babies = await getBabiesForCurrentUser();
      
      return babies.map(baby => ({
        id: baby.id,
        name: baby.name,
        birthdate: new Date(baby.birthdate),
        shareCode: '' // Supabase doesn't use share codes in the same way
      }));
    } catch (error) {
      console.error('Error getting all baby profiles:', error);
      throw error;
    }
  }

  /**
   * Create a user (Note: In Supabase, users are created through auth)
   */
  async createUser(user: User): Promise<void> {
    this.checkInitialized();
    
    // In Supabase, users are created through the auth system
    // This method is kept for compatibility but may not be needed
    console.warn('createUser called - users should be created through Supabase auth');
    throw new Error('Users should be created through Supabase authentication system');
  }

  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<User | null> {
    this.checkInitialized();

    try {
      const user = await getCurrentUser();
      
      if (!user || user.id !== id) {
        return null;
      }

      // Convert Supabase user to local User format
      return {
        id: user.id,
        name: user.name,
        role: 'admin', // Default role - could be enhanced
        linkedBabies: [] // Would need to be calculated from user_baby_links
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Create an event
   */
  async createEvent(event: Event): Promise<Event> {
    this.checkInitialized();

    try {
      if (!event.babyId) {
        throw new Error('Baby ID is required for event');
      }

      const createdEvent = await createEventLocal(event.babyId, event);
      return createdEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get events for a baby
   */
  async getEventsForBaby(babyId: string, limit?: number): Promise<Event[]> {
    this.checkInitialized();

    try {
      return await getEventsForBabyLocal(babyId, limit || 50);
    } catch (error) {
      console.error('Error getting events for baby:', error);
      throw error;
    }
  }

  /**
   * Get events by type for a baby
   */
  async getEventsByType(babyId: string, type: string, limit?: number): Promise<Event[]> {
    this.checkInitialized();

    try {
      return await getEventsByTypeLocal(babyId, type as any, limit || 50);
    } catch (error) {
      console.error('Error getting events by type:', error);
      throw error;
    }
  }

  /**
   * Update an event
   */
  async updateEvent(event: Event): Promise<void> {
    this.checkInitialized();

    try {
      await updateEventLocal(event.id, event);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    this.checkInitialized();

    try {
      await deleteEventLocal(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();