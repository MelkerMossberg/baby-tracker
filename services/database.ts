import { BabyProfile, User, Event } from '../types/models';


class DatabaseService {
  private db: any | null = null;
  private readonly DB_NAME = 'baby_tracker.db';
  private isInitializing = false;
  private isInitialized = false;

  private getSafeDbName(): string {
    try {
      const dbName = this.DB_NAME || 'fallback.db';
      if (typeof dbName !== 'string') {
        return 'fallback.db';
      }
      const safeName = dbName.trim();
      return safeName.length > 0 ? safeName : 'fallback.db';
    } catch (error) {
      console.warn('Error getting safe database name:', error);
      return 'fallback.db';
    }
  }

  private checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    if (!this.db) {
      throw new Error('SQLite database not available');
    }
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      throw new Error('Database initialization already in progress');
    }

    this.isInitializing = true;

    try {
      // Local database not available - app configured to use Supabase only
      throw new Error('Local SQLite database not available - use Supabase instead');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error('Database initialization failed');
    } finally {
      this.isInitializing = false;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise<void>((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql('PRAGMA journal_mode = WAL;');
        
        tx.executeSql(`CREATE TABLE IF NOT EXISTS baby_profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          birthdate TEXT NOT NULL,
          share_code TEXT UNIQUE NOT NULL
        );`);
        
        tx.executeSql(`CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT CHECK(role IN ('admin', 'guest')) NOT NULL,
          linked_babies TEXT NOT NULL DEFAULT '[]'
        );`);
        
        tx.executeSql(`CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          type TEXT CHECK(type IN ('nursing', 'sleep', 'diaper', 'pumping', 'bottle', 'solids')) NOT NULL,
          timestamp TEXT NOT NULL,
          duration INTEGER,
          notes TEXT,
          side TEXT CHECK(side IN ('left', 'right')),
          baby_id TEXT NOT NULL,
          FOREIGN KEY(baby_id) REFERENCES baby_profiles(id)
        );`);
        
        tx.executeSql('CREATE INDEX IF NOT EXISTS idx_events_baby_id ON events(baby_id);');
        tx.executeSql('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);');
      }, 
      (error) => {
        console.error('❌ Error creating tables:', error);
        reject(error);
      },
      () => {
        resolve();
      });
    });
  }

  async createBabyProfile(baby: BabyProfile): Promise<void> {
    this.checkInitialized();

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
    try {
      this.checkInitialized();

      const results = await this.db.getAllAsync('SELECT * FROM baby_profiles') as any[];

      return results.map(row => ({
        id: row.id || '',
        name: row.name || 'Unknown',
        birthdate: new Date(row.birthdate || Date.now()),
        shareCode: row.share_code || ''
      }));
    } catch (error) {
      console.error('Error in getAllBabyProfiles:', error);
      throw error;
    }
  }

  async createUser(user: User): Promise<void> {
    this.checkInitialized();

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
    this.checkInitialized();

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
    this.checkInitialized();

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
    this.checkInitialized();

    await this.db.runAsync('DELETE FROM events WHERE id = ?', [eventId]);
  }
}

export const databaseService = new DatabaseService();