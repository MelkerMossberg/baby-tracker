import { BabyProfile, User, Event } from '../types/models';
import { databaseService } from './database';
import { eventTracker } from './EventTracker';
import { testSQLiteBasic } from './debugSQLite';

export const DUMMY_BABY_ID = 'baby-otis-2024';
export const DUMMY_USER_ID = 'user-parent-1';

const dummyBaby: BabyProfile = {
  id: DUMMY_BABY_ID,
  name: 'Otis',
  birthdate: new Date('2024-01-15'),
  shareCode: 'OTIS2024'
};

const dummyUser: User = {
  id: DUMMY_USER_ID,
  name: 'Parent',
  role: 'admin',
  linkedBabies: [DUMMY_BABY_ID]
};

export async function initializeDummyData(): Promise<void> {
  try {
    console.log('🔄 Starting database initialization...');
    
    // Initialize database service (with automatic fallback to mock)
    await databaseService.initialize();
    console.log('✅ Database initialized successfully');

    console.log('🔍 Checking for existing baby profile...');
    const existingBaby = await databaseService.getBabyProfile(DUMMY_BABY_ID);
    if (existingBaby) {
      console.log('✅ Dummy data already exists');
      return;
    }

    console.log('👶 Creating baby profile...');
    await databaseService.createBabyProfile(dummyBaby);
    console.log('✅ Baby profile created');

    console.log('👤 Creating user...');
    await databaseService.createUser(dummyUser);
    console.log('✅ User created');

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const dummyEvents: Omit<Event, 'id'>[] = [
      {
        type: 'nursing',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        duration: 1200,
        side: 'left',
        notes: 'Good latch, baby seemed satisfied',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'diaper',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        notes: 'Wet diaper',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'sleep',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        duration: 7200,
        notes: 'Long nap in crib',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'nursing',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        duration: 900,
        side: 'right',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'diaper',
        timestamp: new Date(now.getTime() - 7 * 60 * 60 * 1000),
        notes: 'Dirty diaper',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'bottle',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        notes: '4oz formula',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'sleep',
        timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        duration: 5400,
        notes: 'Night sleep',
        babyId: DUMMY_BABY_ID
      },
      {
        type: 'pumping',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        duration: 900,
        notes: 'Pumped 3oz',
        babyId: DUMMY_BABY_ID
      }
    ];

    console.log(`📝 Creating ${dummyEvents.length} events...`);
    for (let i = 0; i < dummyEvents.length; i++) {
      const eventData = dummyEvents[i];
      console.log(`📝 Creating event ${i + 1}/${dummyEvents.length}: ${eventData.type}`);
      try {
        await eventTracker.addManualEvent(
          eventData.babyId,
          eventData.type,
          eventData.timestamp,
          eventData.duration,
          eventData.notes,
          eventData.side
        );
        console.log(`✅ Event ${i + 1} created successfully`);
      } catch (error) {
        console.error(`❌ Error creating event ${i + 1}:`, error);
        throw error;
      }
    }

    console.log('🎉 Dummy data initialized successfully');
  } catch (error) {
    console.error('Error initializing dummy data:', error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const events = await databaseService.getEventsForBaby(DUMMY_BABY_ID);
    for (const event of events) {
      await databaseService.deleteEvent(event.id);
    }
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}