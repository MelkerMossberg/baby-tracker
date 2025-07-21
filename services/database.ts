import * as SQLite from 'expo-sqlite';
import { BabyProfile, User, Event } from '../types/models';
import { MockDatabaseService } from './mockDatabase';

// Debug: Log SQLite object to see what's available
console.log('SQLite object:', SQLite);
console.log('SQLite keys:', Object.keys(SQLite));
console.log('openDatabaseAsync type:', typeof SQLite.openDatabaseAsync);
console.log('openDatabaseAsync function:', SQLite.openDatabaseAsync?.toString?.());

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_NAME = 'baby_tracker.db';
  private isInitializing = false;
  private isInitialized = false;
  private mockDb: MockDatabaseService | null = null;
  private useMockDb = false;

  private getSafeDbName(): string {
    const dbName = this.DB_NAME || 'fallback.db';
    const safeName = (typeof dbName === 'string') ? dbName.trim() : 'fallback.db';
    return safeName.length > 0 ? safeName : 'fallback.db';
  }

  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    if (this.useMockDb && !this.mockDb) {
      throw new Error('Mock database not available');
    }
    if (!this.useMockDb && !this.db) {
      throw new Error('SQLite database not available');
    }
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Database already initialized');
      return;
    }

    if (this.isInitializing) {
      throw new Error('Database initialization already in progress');
    }

    this.isInitializing = true;

    try {
      console.log('🔧 Opening SQLite database...');
      
      // Get a guaranteed safe database name
      const safeName = this.getSafeDbName();
      console.log('🔧 Safe database name:', safeName);
      console.log('🔧 Safe database name type:', typeof safeName);
      console.log('🔧 Safe database name length:', safeName.length);
      
      // Try the new expo-sqlite API first
      if (SQLite.openDatabaseAsync) {
        console.log('🔧 Using openDatabaseAsync with name:', safeName);
        this.db = await SQLite.openDatabaseAsync(safeName);
      } else if (SQLite.openDatabaseSync) {
        // Fallback to sync API if needed
        console.log('🔧 Using openDatabaseSync with name:', safeName);
        this.db = SQLite.openDatabaseSync(safeName);
      } else {
        throw new Error('No compatible SQLite open method available');
      }
      
      console.log('✅ Database opened successfully');
      console.log('🔧 Database object type:', typeof this.db);
      
      console.log('🔧 Creating tables...');
      await this.createTables();
      console.log('✅ Tables created successfully');
      
      this.isInitialized = true;
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ SQLite initialization failed:', error);
      console.error('Error stack:', error?.stack);
      
      console.log('🔄 Falling back to mock database...');
      try {
        this.mockDb = new MockDatabaseService();
        await this.mockDb.initialize();
        this.useMockDb = true;
        this.isInitialized = true;
        console.log('✅ Mock database initialization complete');
      } catch (mockError) {
        console.error('❌ Mock database initialization failed:', mockError);
        throw new Error('Both SQLite and mock database initialization failed');
      }
    } finally {
      this.isInitializing = false;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('🔧 Setting up database pragmas...');
      await this.db.execAsync('PRAGMA journal_mode = WAL;');
      
      console.log('🔧 Creating baby_profiles table...');
      await this.db.execAsync(`CREATE TABLE IF NOT EXISTS baby_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        share_code TEXT UNIQUE NOT NULL
      );`);
      
      console.log('🔧 Creating users table...');
      await this.db.execAsync(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'guest')) NOT NULL,
        linked_babies TEXT NOT NULL DEFAULT '[]'
      );`);
      
      console.log('🔧 Creating events table...');
      await this.db.execAsync(`CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('nursing', 'sleep', 'diaper', 'pumping', 'bottle', 'solids')) NOT NULL,
        timestamp TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        side TEXT CHECK(side IN ('left', 'right', 'both')),
        baby_id TEXT NOT NULL,
        FOREIGN KEY(baby_id) REFERENCES baby_profiles(id)
      );`);
      
      console.log('🔧 Creating indexes...');
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_events_baby_id ON events(baby_id);');
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);');
      
      console.log('✅ All tables and indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      console.error('Error details:', error?.message);
      throw error;
    }
  }

  async createBabyProfile(baby: BabyProfile): Promise<void> {
    this.checkInitialized();
    
    if (this.useMockDb && this.mockDb) {
      return this.mockDb.createBabyProfile(baby);
    }

    if (!baby.birthdate || !(baby.birthdate instanceof Date) || isNaN(baby.birthdate.getTime())) {
      throw new Error('Invalid birthdate provided');
    }

    if (!baby.id || !baby.name || !baby.shareCode) {
      throw new Error('Missing required baby profile fields');
    }

    try {
      await this.db.runAsync(
        'INSERT INTO baby_profiles (id, name, birthdate, share_code) VALUES (?, ?, ?, ?)',
        [baby.id, baby.name, baby.birthdate.toISOString(), baby.shareCode]
      );
    } catch (error) {
      console.error('Database error creating baby profile:', error);
      throw new Error(`Failed to create baby profile: ${error}`);
    }
  }

  async getBabyProfile(id: string): Promise<BabyProfile | null> {
    this.checkInitialized();
    
    if (this.useMockDb && this.mockDb) {
      return this.mockDb.getBabyProfile(id);
    }

    const result = await this.db.getFirstAsync(
      'SELECT * FROM baby_profiles WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      birthdate: new Date(result.birthdate),
      shareCode: result.share_code
    };
  }

  async getAllBabyProfiles(): Promise<BabyProfile[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync('SELECT * FROM baby_profiles') as any[];

    return results.map(row => ({
      id: row.id,
      name: row.name,
      birthdate: new Date(row.birthdate),
      shareCode: row.share_code
    }));
  }

  async createUser(user: User): Promise<void> {
    this.checkInitialized();
    
    if (this.useMockDb && this.mockDb) {
      return this.mockDb.createUser(user);
    }

    if (!user.id || !user.name || !user.role) {
      throw new Error('Missing required user fields');
    }

    try {
      await this.db.runAsync(
        'INSERT INTO users (id, name, role, linked_babies) VALUES (?, ?, ?, ?)',
        [user.id, user.name, user.role, JSON.stringify(user.linkedBabies || [])]
      );
    } catch (error) {
      console.error('Database error creating user:', error);
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      [id]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      role: result.role,
      linkedBabies: result.linked_babies ? JSON.parse(result.linked_babies) : []
    };
  }

  async createEvent(event: Event): Promise<void> {
    this.checkInitialized();
    
    if (this.useMockDb && this.mockDb) {
      return this.mockDb.createEvent(event);
    }

    if (!event.timestamp || !(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
      throw new Error('Invalid timestamp provided for event');
    }

    if (!event.id || !event.type || !event.babyId) {
      throw new Error('Missing required event fields');
    }

    try {
      await this.db.runAsync(
        'INSERT INTO events (id, type, timestamp, duration, notes, side, baby_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          event.id,
          event.type,
          event.timestamp.toISOString(),
          event.duration || null,
          event.notes || null,
          event.side || null,
          event.babyId
        ]
      );
    } catch (error) {
      console.error('Database error creating event:', error);
      throw new Error(`Failed to create event: ${error}`);
    }
  }

  async getEventsForBaby(babyId: string, limit?: number): Promise<Event[]> {
    this.checkInitialized();
    
    if (this.useMockDb && this.mockDb) {
      return this.mockDb.getEventsForBaby(babyId, limit);
    }

    const query = limit 
      ? 'SELECT * FROM events WHERE baby_id = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM events WHERE baby_id = ? ORDER BY timestamp DESC';
    
    const params = limit ? [babyId, limit] : [babyId];
    const results = await this.db.getAllAsync(query, params) as any[];

    return results.map(row => ({
      id: row.id,
      type: row.type,
      timestamp: new Date(row.timestamp),
      duration: row.duration,
      notes: row.notes,
      side: row.side,
      babyId: row.baby_id
    }));
  }

  async getEventsByType(babyId: string, type: string, limit?: number): Promise<Event[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = limit
      ? 'SELECT * FROM events WHERE baby_id = ? AND type = ? ORDER BY timestamp DESC LIMIT ?'
      : 'SELECT * FROM events WHERE baby_id = ? AND type = ? ORDER BY timestamp DESC';
    
    const params = limit ? [babyId, type, limit] : [babyId, type];
    const results = await this.db.getAllAsync(query, params) as any[];

    return results.map(row => ({
      id: row.id,
      type: row.type,
      timestamp: new Date(row.timestamp),
      duration: row.duration,
      notes: row.notes,
      side: row.side,
      babyId: row.baby_id
    }));
  }

  async updateEvent(event: Event): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (!event.timestamp || !(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
      throw new Error('Invalid timestamp provided for event update');
    }

    await this.db.runAsync(
      'UPDATE events SET type = ?, timestamp = ?, duration = ?, notes = ?, side = ? WHERE id = ?',
      [
        event.type,
        event.timestamp.toISOString(),
        event.duration || null,
        event.notes || null,
        event.side || null,
        event.id
      ]
    );
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM events WHERE id = ?', [eventId]);
  }
}

export const databaseService = new DatabaseService();