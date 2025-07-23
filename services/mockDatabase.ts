import { BabyProfile, User, Event } from '../types/models';

// In-memory storage for testing when SQLite fails
let mockBabyProfiles: BabyProfile[] = [];
let mockUsers: User[] = [];
let mockEvents: Event[] = [];

export class MockDatabaseService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async createBabyProfile(baby: BabyProfile): Promise<void> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const existingIndex = mockBabyProfiles.findIndex(b => b.id === baby.id);
    if (existingIndex >= 0) {
      mockBabyProfiles[existingIndex] = baby;
    } else {
      mockBabyProfiles.push(baby);
    }
  }

  async getBabyProfile(id: string): Promise<BabyProfile | null> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const baby = mockBabyProfiles.find(b => b.id === id);
    return baby || null;
  }

  async getAllBabyProfiles(): Promise<BabyProfile[]> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    return [...mockBabyProfiles];
  }

  async createUser(user: User): Promise<void> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const existingIndex = mockUsers.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      mockUsers[existingIndex] = user;
    } else {
      mockUsers.push(user);
    }
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const user = mockUsers.find(u => u.id === id);
    return user || null;
  }

  async createEvent(event: Event): Promise<void> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const existingIndex = mockEvents.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      mockEvents[existingIndex] = event;
    } else {
      mockEvents.push(event);
    }
  }

  async getEventsForBaby(babyId: string, limit?: number): Promise<Event[]> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    let events = mockEvents
      .filter(e => e.babyId === babyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      events = events.slice(0, limit);
    }
    
    return events;
  }

  async getEventsByType(babyId: string, type: string, limit?: number): Promise<Event[]> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    let events = mockEvents
      .filter(e => e.babyId === babyId && e.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      events = events.slice(0, limit);
    }
    
    return events;
  }

  async updateEvent(event: Event): Promise<void> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const index = mockEvents.findIndex(e => e.id === event.id);
    if (index >= 0) {
      mockEvents[index] = event;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isInitialized) throw new Error('Mock database not initialized');
    
    const index = mockEvents.findIndex(e => e.id === eventId);
    if (index >= 0) {
      mockEvents.splice(index, 1);
    }
  }

  // Clear all mock data
  clearAllData(): void {
    mockBabyProfiles = [];
    mockUsers = [];
    mockEvents = [];
  }
}