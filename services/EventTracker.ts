import { Event, EventType, NursingSide, NursingEvent } from '../types/models';
import { databaseService } from './database';

export interface ActiveNursingSession {
  eventId: string;
  babyId: string;
  side: NursingSide;
  startTime: Date;
}

class EventTracker {
  private activeNursingSession: ActiveNursingSession | null = null;

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  }

  async startNursingSession(babyId: string, side: NursingSide): Promise<string> {
    if (this.activeNursingSession) {
      throw new Error('Nursing session already in progress. Please stop the current session first.');
    }

    const eventId = this.generateId();
    const startTime = new Date();

    this.activeNursingSession = {
      eventId,
      babyId,
      side,
      startTime
    };

    return eventId;
  }

  async stopNursingSession(notes?: string): Promise<Event> {
    if (!this.activeNursingSession) {
      throw new Error('No active nursing session to stop.');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.activeNursingSession.startTime.getTime()) / 1000);

    const event: NursingEvent = {
      id: this.activeNursingSession.eventId,
      type: 'nursing',
      timestamp: this.activeNursingSession.startTime,
      duration,
      notes,
      side: this.activeNursingSession.side,
      babyId: this.activeNursingSession.babyId
    };

    await databaseService.createEvent(event);

    this.activeNursingSession = null;

    return event;
  }

  getActiveNursingSession(): ActiveNursingSession | null {
    return this.activeNursingSession;
  }

  isNursingInProgress(): boolean {
    return this.activeNursingSession !== null;
  }

  async cancelNursingSession(): Promise<void> {
    if (!this.activeNursingSession) {
      throw new Error('No active nursing session to cancel.');
    }

    this.activeNursingSession = null;
  }

  async addManualEvent(
    babyId: string,
    type: EventType,
    timestamp?: Date,
    duration?: number,
    notes?: string,
    side?: NursingSide
  ): Promise<Event> {
    const eventId = this.generateId();
    const eventTimestamp = timestamp || new Date();

    // Validate timestamp
    if (!eventTimestamp || !(eventTimestamp instanceof Date) || isNaN(eventTimestamp.getTime())) {
      throw new Error('Invalid timestamp provided for manual event');
    }

    const event: Event = {
      id: eventId,
      type,
      timestamp: eventTimestamp,
      duration,
      notes,
      side,
      babyId
    };

    await databaseService.createEvent(event);

    return event;
  }

  async addSleepEvent(babyId: string, startTime: Date, endTime: Date, notes?: string): Promise<Event> {
    // Validate dates
    if (!startTime || !(startTime instanceof Date) || isNaN(startTime.getTime())) {
      throw new Error('Invalid start time provided for sleep event');
    }
    if (!endTime || !(endTime instanceof Date) || isNaN(endTime.getTime())) {
      throw new Error('Invalid end time provided for sleep event');
    }
    if (endTime.getTime() <= startTime.getTime()) {
      throw new Error('End time must be after start time');
    }

    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    return this.addManualEvent(babyId, 'sleep', startTime, duration, notes);
  }

  async addDiaperChange(babyId: string, timestamp?: Date, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'diaper', timestamp, undefined, notes);
  }

  async addPumpingSession(babyId: string, timestamp?: Date, duration?: number, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'pumping', timestamp, duration, notes);
  }

  async addBottleFeeding(babyId: string, timestamp?: Date, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'bottle', timestamp, undefined, notes);
  }

  async addSolidFood(babyId: string, timestamp?: Date, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'solids', timestamp, undefined, notes);
  }

  async getRecentEvents(babyId: string, limit: number = 10): Promise<Event[]> {
    return databaseService.getEventsForBaby(babyId, limit);
  }

  async getEventsByType(babyId: string, type: EventType, limit?: number): Promise<Event[]> {
    return databaseService.getEventsByType(babyId, type, limit);
  }

  async getTodaysEvents(babyId: string): Promise<Event[]> {
    const events = await databaseService.getEventsForBaby(babyId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }

  async updateEvent(event: Event): Promise<void> {
    await databaseService.updateEvent(event);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await databaseService.deleteEvent(eventId);
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getElapsedTime(): string {
    if (!this.activeNursingSession) {
      return '0m';
    }

    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.activeNursingSession.startTime.getTime()) / 1000);
    return this.formatDuration(elapsed);
  }
}

export const eventTracker = new EventTracker();