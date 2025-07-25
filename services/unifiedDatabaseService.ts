import { BabyProfile, User, Event } from '../types/models';
import { databaseService } from './database';
import { supabaseDatabaseService } from './supabaseDatabaseService';
import { DATABASE_CONFIG } from './databaseConfig';

/**
 * Unified database service that can switch between mock and Supabase implementations
 */
class UnifiedDatabaseService {
  private currentService: any;

  constructor() {
    this.currentService = DATABASE_CONFIG.useSupabase 
      ? supabaseDatabaseService 
      : databaseService;
  }

  async initialize(): Promise<void> {
    try {
      await this.currentService.initialize();
    } catch (error) {
      console.error('Primary database initialization failed:', error);
      
      if (DATABASE_CONFIG.useSupabase && DATABASE_CONFIG.mockFallback) {
        console.warn('Falling back to mock database');
        this.currentService = databaseService;
        await this.currentService.initialize();
      } else {
        throw error;
      }
    }
  }

  async createBabyProfile(baby: BabyProfile): Promise<void> {
    return this.currentService.createBabyProfile(baby);
  }

  async getBabyProfile(id: string): Promise<BabyProfile | null> {
    return this.currentService.getBabyProfile(id);
  }

  async getAllBabyProfiles(): Promise<BabyProfile[]> {
    return this.currentService.getAllBabyProfiles();
  }

  async createUser(user: User): Promise<void> {
    return this.currentService.createUser(user);
  }

  async getUser(id: string): Promise<User | null> {
    return this.currentService.getUser(id);
  }

  async createEvent(event: Event): Promise<Event> {
    return this.currentService.createEvent(event);
  }

  async getEventsForBaby(babyId: string, limit?: number): Promise<Event[]> {
    return this.currentService.getEventsForBaby(babyId, limit);
  }

  async getEventsByType(babyId: string, type: string, limit?: number): Promise<Event[]> {
    return this.currentService.getEventsByType(babyId, type, limit);
  }

  async updateEvent(event: Event): Promise<void> {
    return this.currentService.updateEvent(event);
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.currentService.deleteEvent(eventId);
  }

  // Utility method to check which service is being used
  isUsingSupabase(): boolean {
    return this.currentService === supabaseDatabaseService;
  }
}

export const unifiedDatabaseService = new UnifiedDatabaseService();