import { Event, EventType, NursingSide, NursingEvent } from '../types/models';
import { unifiedDatabaseService } from './unifiedDatabaseService';
import { formatDuration } from '../utils/time';

export interface ActiveNursingSession {
  eventId: string;
  babyId: string;
  side: NursingSide;
  startTime: Date;
}

export interface ActiveSleepSession {
  eventId: string;
  babyId: string;
  startTime: Date;
  wakeTimerSetFor?: Date;
  wakeTimerTriggered?: boolean;
}

class EventTracker {
  private activeNursingSession: ActiveNursingSession | null = null;
  private activeSleepSession: ActiveSleepSession | null = null;

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

    const createdEvent = await unifiedDatabaseService.createEvent(event);

    // Store as last created event for potential duration updates - use the actual Supabase ID
    this.lastCreatedEvent = createdEvent;

    this.activeNursingSession = null;

    return createdEvent;
  }

  getActiveNursingSession(): ActiveNursingSession | null {
    return this.activeNursingSession;
  }

  isNursingInProgress(): boolean {
    return this.activeNursingSession !== null;
  }

  switchNursingSide(newSide: NursingSide): void {
    if (!this.activeNursingSession) {
      throw new Error('No active nursing session to switch sides');
    }
    
    this.activeNursingSession.side = newSide;
  }

  async cancelNursingSession(): Promise<void> {
    if (!this.activeNursingSession) {
      throw new Error('No active nursing session to cancel.');
    }

    this.activeNursingSession = null;
  }

  // MARK: - Sleep Session Methods

  async startSleepSession(babyId: string, startTime?: Date): Promise<string> {
    if (this.activeSleepSession) {
      throw new Error('Sleep session already in progress. Please stop the current session first.');
    }

    const eventId = this.generateId();
    const sessionStartTime = startTime || new Date();

    this.activeSleepSession = {
      eventId,
      babyId,
      startTime: sessionStartTime
    };

    return eventId;
  }

  async stopSleepSession(notes?: string): Promise<Event> {
    if (!this.activeSleepSession) {
      throw new Error('No active sleep session to stop.');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - this.activeSleepSession.startTime.getTime()) / 1000);

    const event: Event = {
      id: this.activeSleepSession.eventId,
      type: 'sleep',
      timestamp: this.activeSleepSession.startTime,
      duration: Math.max(0, duration),
      notes,
      babyId: this.activeSleepSession.babyId
    };

    const createdEvent = await unifiedDatabaseService.createEvent(event);

    // Store as last created event for potential updates - use the actual Supabase ID
    this.lastCreatedEvent = createdEvent;

    this.activeSleepSession = null;

    return createdEvent;
  }

  getSleepSession(): ActiveSleepSession | null {
    return this.activeSleepSession;
  }

  isSleepInProgress(): boolean {
    return this.activeSleepSession !== null;
  }

  async adjustSleepStartTime(newStartTime: Date): Promise<void> {
    if (!this.activeSleepSession) {
      throw new Error('No active sleep session to adjust.');
    }

    // Validate the new start time
    const now = new Date();
    const maxHoursBack = 12;
    const earliestAllowed = new Date(now.getTime() - (maxHoursBack * 60 * 60 * 1000));

    if (newStartTime < earliestAllowed) {
      throw new Error(`Start time cannot be more than ${maxHoursBack} hours ago.`);
    }

    if (newStartTime > now) {
      throw new Error('Start time cannot be in the future.');
    }

    this.activeSleepSession.startTime = newStartTime;
  }

  async cancelSleepSession(): Promise<void> {
    if (!this.activeSleepSession) {
      throw new Error('No active sleep session to cancel.');
    }

    this.activeSleepSession = null;
  }

  async setWakeTimer(wakeTime: Date): Promise<void> {
    if (!this.activeSleepSession) {
      throw new Error('No active sleep session to set wake timer for.');
    }

    this.activeSleepSession.wakeTimerSetFor = wakeTime;
    this.activeSleepSession.wakeTimerTriggered = false;
  }

  async cancelWakeTimer(): Promise<void> {
    if (!this.activeSleepSession) {
      throw new Error('No active sleep session to cancel wake timer for.');
    }

    this.activeSleepSession.wakeTimerSetFor = undefined;
    this.activeSleepSession.wakeTimerTriggered = undefined;
  }

  isWakeTimerTriggered(): boolean {
    if (!this.activeSleepSession?.wakeTimerSetFor) {
      return false;
    }

    const now = new Date();
    const isTriggered = now.getTime() >= this.activeSleepSession.wakeTimerSetFor.getTime();
    
    // Mark as triggered if it hasn't been marked yet
    if (isTriggered && !this.activeSleepSession.wakeTimerTriggered) {
      this.activeSleepSession.wakeTimerTriggered = true;
    }

    return isTriggered;
  }

  getSleepElapsedTime(): string {
    if (!this.activeSleepSession) {
      return '0s';
    }

    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.activeSleepSession.startTime.getTime()) / 1000);
    return this.formatDuration(Math.max(0, elapsed));
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

    const createdEvent = await unifiedDatabaseService.createEvent(event);

    return createdEvent;
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

  async addPumpingSession(
    babyId: string, 
    timestamp?: Date, 
    duration?: number, 
    notes?: string, 
    pumpingSide?: 'left' | 'right' | 'both', 
    milliliters?: number
  ): Promise<Event> {
    const eventId = this.generateId();
    const eventTimestamp = timestamp || new Date();

    // Validate timestamp
    if (!eventTimestamp || !(eventTimestamp instanceof Date) || isNaN(eventTimestamp.getTime())) {
      throw new Error('Invalid timestamp provided for pumping event');
    }

    const event: Event = {
      id: eventId,
      type: 'pumping',
      timestamp: eventTimestamp,
      duration,
      notes,
      pumpingSide,
      milliliters,
      babyId
    };

    const createdEvent = await unifiedDatabaseService.createEvent(event);

    return createdEvent;
  }

  async addBottleFeeding(babyId: string, timestamp?: Date, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'bottle', timestamp, undefined, notes);
  }

  async addSolidFood(babyId: string, timestamp?: Date, notes?: string): Promise<Event> {
    return this.addManualEvent(babyId, 'solids', timestamp, undefined, notes);
  }

  async getRecentEvents(babyId: string, limit: number = 10): Promise<Event[]> {
    try {
      return await unifiedDatabaseService.getEventsForBaby(babyId, limit);
    } catch (error) {
      console.warn('Unable to get recent events, database not ready:', error);
      return [];
    }
  }

  async getEventsByType(babyId: string, type: EventType, limit?: number): Promise<Event[]> {
    try {
      return await unifiedDatabaseService.getEventsByType(babyId, type, limit);
    } catch (error) {
      console.warn('Unable to get events by type, database not ready:', error);
      return [];
    }
  }

  async getTodaysEvents(babyId: string): Promise<Event[]> {
    try {
      const events = await unifiedDatabaseService.getEventsForBaby(babyId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return events.filter(event => {
        const eventDate = new Date(event.timestamp);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
    } catch (error) {
      console.warn('Unable to get today\'s events, database not ready:', error);
      return [];
    }
  }

  async updateEvent(event: Event): Promise<void> {
    await unifiedDatabaseService.updateEvent(event);
    // Update lastCreatedEvent if it's the same event being updated
    if (this.lastCreatedEvent && this.lastCreatedEvent.id === event.id) {
      this.lastCreatedEvent = event;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    await unifiedDatabaseService.deleteEvent(eventId);
  }

  private lastCreatedEvent: Event | null = null;

  getLastCreatedEvent(): Event | null {
    return this.lastCreatedEvent;
  }

  async updateEventDuration(eventId: string, durationSeconds: number): Promise<void> {
    try {
      // Get the event from database
      const events = await unifiedDatabaseService.getEventsForBaby('', 1000); // Get many to find the right one
      const event = events.find(e => e.id === eventId);
      
      if (event) {
        const updatedEvent = { ...event, duration: durationSeconds };
        await unifiedDatabaseService.updateEvent(updatedEvent);
        this.lastCreatedEvent = updatedEvent;
      }
    } catch (error) {
      console.error('Error updating event duration:', error);
    }
  }

  formatDuration(seconds: number): string {
    return formatDuration(seconds);
  }

  getElapsedTime(): string {
    if (!this.activeNursingSession) {
      return '0m';
    }

    const now = new Date();
    const elapsed = Math.floor((now.getTime() - this.activeNursingSession.startTime.getTime()) / 1000);
    return this.formatDuration(elapsed);
  }

  canLogEvents(babyId: string): boolean {
    return !babyId.includes('test-');
  }
}

export const eventTracker = new EventTracker();