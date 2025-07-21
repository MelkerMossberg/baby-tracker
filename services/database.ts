import * as SQLite from 'expo-sqlite';
import { BabyProfile, User, Event } from '../types/models';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    this.db = await SQLite.openDatabaseAsync('baby_tracker.db');
    await this.createTables();
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS baby_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        share_code TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'guest')) NOT NULL,
        linked_babies TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('nursing', 'sleep', 'diaper', 'pumping', 'bottle', 'solids')) NOT NULL,
        timestamp TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        side TEXT CHECK(side IN ('left', 'right', 'both')),
        baby_id TEXT NOT NULL,
        FOREIGN KEY(baby_id) REFERENCES baby_profiles(id)
      );

      CREATE INDEX IF NOT EXISTS idx_events_baby_id ON events(baby_id);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    `);
  }

  async createBabyProfile(baby: BabyProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'INSERT INTO baby_profiles (id, name, birthdate, share_code) VALUES (?, ?, ?, ?)',
      [baby.id, baby.name, baby.birthdate.toISOString(), baby.shareCode]
    );
  }

  async getBabyProfile(id: string): Promise<BabyProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

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
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'INSERT INTO users (id, name, role, linked_babies) VALUES (?, ?, ?, ?)',
      [user.id, user.name, user.role, JSON.stringify(user.linkedBabies)]
    );
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
      linkedBabies: JSON.parse(result.linked_babies)
    };
  }

  async createEvent(event: Event): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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
  }

  async getEventsForBaby(babyId: string, limit?: number): Promise<Event[]> {
    if (!this.db) throw new Error('Database not initialized');

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