import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { eventTracker, initializeDummyData, DUMMY_BABY_ID, databaseService } from '../services';
import { Event, EventType, NursingSide, BabyProfile } from '../types';
import { formatDuration } from '../utils/time';
import { getEventDisplayName } from '../utils/events';
import NursingModal from '../features/nursing/NursingModal';
import EventModal from '../features/general/EventModal';
import SleepModal from '../features/sleep/SleepModal';
import BreastSelectionModal from '../components/BreastSelectionModal';
import ActiveNursingCard from '../features/nursing/ActiveNursingCard';
import BabySwitcherModal from '../components/BabySwitcherModal';
import AllEventsModal from '../components/AllEventsModal';

export default function HomeScreen() {
  // Suppress React Native touch warnings in development
  React.useEffect(() => {
    if (__DEV__) {
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (args[0]?.includes?.('Cannot find single active touch')) {
          return; // Suppress this specific warning
        }
        originalWarn(...args);
      };
      return () => {
        console.warn = originalWarn;
      };
    }
  }, []);

  const [isNursingInProgress, setIsNursingInProgress] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0m');
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [todaysSummary, setTodaysSummary] = useState({
    feedings: 0,
    sleepTime: '0h 0m',
    diapers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showNursingModal, setShowNursingModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showBreastSelectionModal, setShowBreastSelectionModal] = useState(false);
  const [showBabySwitcherModal, setShowBabySwitcherModal] = useState(false);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [currentEventType, setCurrentEventType] = useState<EventType>('diaper');
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const [currentNursingSide, setCurrentNursingSide] = useState<NursingSide>('left');
  const [lastNursingSide, setLastNursingSide] = useState<NursingSide | undefined>(undefined);
  const [currentBaby, setCurrentBaby] = useState<BabyProfile | null>(null);
  const [availableBabies, setAvailableBabies] = useState<BabyProfile[]>([]);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [stoppedNursingDuration, setStoppedNursingDuration] = useState<number>(0);

  useEffect(() => {
    initializeApp();
    
    const interval = setInterval(() => {
      if (eventTracker.isNursingInProgress()) {
        setElapsedTime(eventTracker.getElapsedTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeApp = async () => {
    try {
      // Try to initialize dummy data, but don't fail if it doesn't work
      try {
        await initializeDummyData();
        setIsDatabaseReady(true);
      } catch (initError) {
        console.warn('Database initialization failed, will use fallback data:', initError);
        setIsDatabaseReady(false);
      }
      
      await loadBabies();
      setIsNursingInProgress(eventTracker.isNursingInProgress());
      if (eventTracker.isNursingInProgress()) {
        setElapsedTime(eventTracker.getElapsedTime());
        const activeSession = eventTracker.getActiveNursingSession();
        if (activeSession) {
          setCurrentNursingSide(activeSession.side);
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsDatabaseReady(false);
      // Don't show alert, just ensure we have fallback data
      await loadBabies(); // This will create test data if needed
    } finally {
      setIsLoading(false);
    }
  };

  const loadBabies = async () => {
    try {
      // Database should now be properly initialized with mock data
      const babies = await databaseService.getAllBabyProfiles();
      
      if (babies.length > 0) {
        setAvailableBabies(babies);
        
        // Set default to the latest created baby (Luna)
        const sortedBabies = babies.sort((a, b) => b.birthdate.getTime() - a.birthdate.getTime());
        const defaultBaby = sortedBabies[0]; // Latest baby (Luna)
        setCurrentBaby(defaultBaby);
        await loadData(defaultBaby.id);
      } else {
        // If still no babies, something went wrong, use basic fallback
        const testBabies: BabyProfile[] = [
          {
            id: 'test-otis',
            name: 'Otis',
            birthdate: new Date('2024-01-15'),
            shareCode: 'OTIS2024'
          },
          {
            id: 'test-luna', 
            name: 'Luna',
            birthdate: new Date('2024-06-20'),
            shareCode: 'LUNA2024'
          }
        ];
        setAvailableBabies(testBabies);
        setCurrentBaby(testBabies[1]);
      }
    } catch (error) {
      console.error('Error loading babies:', error);
      // Fallback to test data
      const testBabies: BabyProfile[] = [
        {
          id: 'test-otis',
          name: 'Otis',
          birthdate: new Date('2024-01-15'),
          shareCode: 'OTIS2024'
        },
        {
          id: 'test-luna', 
          name: 'Luna',
          birthdate: new Date('2024-06-20'),
          shareCode: 'LUNA2024'
        }
      ];
      setAvailableBabies(testBabies);
      setCurrentBaby(testBabies[1]);
    }
  };

  const loadData = async (babyId?: string) => {
    try {
      const targetBabyId = babyId || currentBaby?.id || DUMMY_BABY_ID;
      
      // Check if we're using fallback test data
      const isUsingTestData = !eventTracker.canLogEvents(targetBabyId);
      
      if (isUsingTestData) {
        // Set default empty state for test data
        setRecentEvents([]);
        setAllEvents([]);
        setLastNursingSide(undefined);
        setTodaysSummary({
          feedings: 0,
          sleepTime: '0h 0m',
          diapers: 0
        });
        return;
      }

      // Now database should be working with mock data
      const allEventsData = await eventTracker.getRecentEvents(targetBabyId, 1000);
      setAllEvents(allEventsData);
      
      // Show only the first 5 for recent events preview
      const recentEventsPreview = allEventsData.slice(0, 5);
      setRecentEvents(recentEventsPreview);

      // Get last nursing side
      const lastNursingEvents = await eventTracker.getEventsByType(targetBabyId, 'nursing', 1);
      if (lastNursingEvents.length > 0 && 'side' in lastNursingEvents[0]) {
        setLastNursingSide(lastNursingEvents[0].side as NursingSide);
      }

      const todayEvents = await eventTracker.getTodaysEvents(targetBabyId);
      
      const feedings = todayEvents.filter(e => e.type === 'nursing').length;
      const sleepEvents = todayEvents.filter(e => e.type === 'sleep');
      const totalSleepMinutes = sleepEvents.reduce((total, event) => {
        return total + (event.duration || 0);
      }, 0) / 60;
      const sleepHours = Math.floor(totalSleepMinutes / 60);
      const sleepMins = Math.floor(totalSleepMinutes % 60);
      const diapers = todayEvents.filter(e => e.type === 'diaper').length;

      setTodaysSummary({
        feedings,
        sleepTime: `${sleepHours}h ${sleepMins}m`,
        diapers
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default empty state on error
      setRecentEvents([]);
      setAllEvents([]);
      setLastNursingSide(undefined);
      setTodaysSummary({
        feedings: 0,
        sleepTime: '0h 0m',
        diapers: 0
      });
    }
  };

  const handleNursingPress = async () => {
    try {
      if (isNursingInProgress) {
        const activeSession = eventTracker.getActiveNursingSession();
        if (activeSession) {
          setCurrentNursingSide(activeSession.side);
        }
        setShowNursingModal(true);
      } else {
        setShowBreastSelectionModal(true);
      }
    } catch (error) {
      console.error('Error handling nursing session:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to manage nursing session');
    }
  };

  const handleBreastSelection = async (side: NursingSide) => {
    try {
      if (!currentBaby) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(currentBaby.id)) {
        Alert.alert('Info', 'Nursing session tracking is not available with test data.');
        return;
      }
      
      await eventTracker.startNursingSession(currentBaby.id, side);
      setIsNursingInProgress(true);
      setCurrentNursingSide(side);
      setElapsedTime('0m');
      Toast.show({
        type: 'success',
        text1: 'Nursing Started',
        text2: `Timer is now running (${side})`
      });
    } catch (error) {
      console.error('Error starting nursing session:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start nursing session');
    }
  };

  const handleNursingSave = async (side: NursingSide, notes: string, durationSeconds: number) => {
    try {
      // Get the last created event (nursing session was already stopped when "Stop" was pressed)
      const event = eventTracker.getLastCreatedEvent();
      
      if (event) {
        // Update the event with custom duration and notes if different
        if (Math.abs((event.duration || 0) - durationSeconds) > 1 || notes !== event.notes) {
          const updatedEvent = { ...event, duration: durationSeconds, notes, side };
          await eventTracker.updateEvent(updatedEvent);
        }
      } else {
        // Fallback: create a manual event if somehow no event exists
        if (!currentBaby) throw new Error('No baby selected');
        await eventTracker.addManualEvent(
          currentBaby.id, 
          'nursing', 
          new Date(Date.now() - durationSeconds * 1000), 
          durationSeconds, 
          notes, 
          side
        );
      }
      
      setElapsedTime('0m');
      setStoppedNursingDuration(0);
      await loadData();
      Toast.show({
        type: 'success',
        text1: 'Nursing Complete',
        text2: `${formatDuration(durationSeconds)} session logged`
      });
    } catch (error) {
      console.error('Error saving nursing session:', error);
      Alert.alert('Error', 'Failed to save nursing session');
    }
  };

  const handleQuickEvent = async (type: EventType, title: string) => {
    setCurrentEventType(type);
    setCurrentEventTitle(title);
    if (type === 'sleep') {
      setShowSleepModal(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleEventSave = async (notes: string, duration?: number) => {
    try {
      if (!currentBaby) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(currentBaby.id)) {
        Alert.alert('Info', 'Event logging is not available with test data.');
        return;
      }
      
      await eventTracker.addManualEvent(currentBaby.id, currentEventType, undefined, duration, notes);
      await loadData();
      Toast.show({
        type: 'success',
        text1: `${currentEventTitle} Logged`,
        text2: notes ? 'Event saved with notes' : 'Event saved successfully'
      });
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const handleSleepSave = async (startTime: Date, endTime: Date, notes: string) => {
    try {
      if (!currentBaby) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(currentBaby.id)) {
        Alert.alert('Info', 'Sleep logging is not available with test data.');
        return;
      }
      
      await eventTracker.addSleepEvent(currentBaby.id, startTime, endTime, notes);
      await loadData();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      Toast.show({
        type: 'success',
        text1: 'Sleep Logged',
        text2: `${formatDuration(duration)} session saved`
      });
    } catch (error) {
      console.error('Error saving sleep event:', error);
      Alert.alert('Error', 'Failed to save sleep event');
    }
  };

  const handleSwitchNursingSide = (newSide: NursingSide) => {
    try {
      eventTracker.switchNursingSide(newSide);
      setCurrentNursingSide(newSide);
      Toast.show({
        type: 'success',
        text1: 'Side Switched',
        text2: `Now nursing: ${newSide}`
      });
    } catch (error) {
      console.error('Error switching nursing side:', error);
      Alert.alert('Error', 'Failed to switch nursing side');
    }
  };

  const handleStopNursingFromCard = async () => {
    const activeSession = eventTracker.getActiveNursingSession();
    if (activeSession) {
      setCurrentNursingSide(activeSession.side);
      // Calculate duration at the moment "Stop" is pressed
      const now = new Date();
      const duration = Math.floor((now.getTime() - activeSession.startTime.getTime()) / 1000);
      setStoppedNursingDuration(duration);
      // Freeze the displayed time
      setElapsedTime(formatDuration(duration));
      // Actually stop the nursing session to prevent background counting
      try {
        await eventTracker.stopNursingSession();
        setIsNursingInProgress(false);
      } catch (error) {
        console.error('Error stopping nursing session:', error);
      }
    }
    setShowNursingModal(true);
  };

  const handleBabySwitch = async (baby: BabyProfile) => {
    setCurrentBaby(baby);
    await loadData(baby.id);
    Toast.show({
      type: 'success',
      text1: 'Baby Switched',
      text2: `Now viewing ${baby.name}`
    });
  };

  const formatEventTime = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours >= 1) {
      // Show time format HH:MM for events older than 1 hour
      const eventDate = new Date(timestamp);
      return eventDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    if (diffMins < 1) {
      return 'Just now';
    }
    
    return `${diffMins}m ago`;
  };


  if (isLoading) {
    return (
      <View className="flex-1 bg-bg-main justify-center items-center">
        <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#0f0d16ff' }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
      <View className="px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xl font-serif text-text-main" style={{ fontFamily: 'DM Serif Display' }}>
            Baby Tracker
          </Text>
          <TouchableOpacity 
            className="flex-row items-center mt-1"
            onPress={() => setShowBabySwitcherModal(true)}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-text-muted" style={{ fontFamily: 'Inter' }}>
              ▼ Focused on {currentBaby?.name || (availableBabies.length === 0 ? 'No babies found' : 'Loading...')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 bg-card-main rounded-full items-center justify-center"
          onPress={() => {
            // TODO: Implement account menu
          }}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../assets/img/icons/account.png')} 
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>

      {/* Active Nursing Card */}
      {isNursingInProgress && (
        <ActiveNursingCard
          elapsedTime={elapsedTime}
          currentSide={currentNursingSide}
          onSwitchSide={handleSwitchNursingSide}
          onStop={handleStopNursingFromCard}
        />
      )}


      {/* Hero Message */}
      <Text className="text-3xl font-serif text-text-main mb-8 leading-tight" style={{ fontFamily: 'DM Serif Display' }}>
        {currentBaby ? `Soon time for ${currentBaby.name}'s second meal. Yum.` : 'Welcome to Baby Tracker'}
      </Text>

      {/* Recent Activity */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg text-text-muted" style={{ fontFamily: 'Inter' }}>
          Recent activity
        </Text>
        <TouchableOpacity onPress={() => setShowAllEventsModal(true)} activeOpacity={0.7}>
          <Text className="text-blue-400 text-sm" style={{ fontFamily: 'Inter' }}>
            All events
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="rounded-2xl p-4 shadow-lg mb-8 bg-card-main" 
        onPress={() => allEvents.length > 5 ? setShowAllEventsModal(true) : undefined}
        activeOpacity={allEvents.length > 5 ? 0.7 : 1}
      >
        {recentEvents.length === 0 ? (
          <Text className="text-text-muted text-center" style={{ fontFamily: 'Inter' }}>
            No recent activity
          </Text>
        ) : (
          <>
            {recentEvents.map((event, index) => (
              <View 
                key={event.id} 
                className={`flex-row justify-between items-center ${index < recentEvents.length - 1 ? 'mb-4' : ''}`}
              >
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  {getEventDisplayName(event.type)}
                  {'side' in event && event.side && ` ${event.side}`}
                  {event.duration && ` (${formatDuration(event.duration)})`}
                </Text>
                <Text className="text-text-muted text-sm" style={{ fontFamily: 'Inter' }}>
                  {formatEventTime(event.timestamp)}
                </Text>
              </View>
            ))}
            
            {allEvents.length > 5 && (
              <View className="mt-3 pt-3 border-t border-text-muted">
                <Text className="text-blue-400 text-sm text-center" style={{ fontFamily: 'Inter' }}>
                  Show more ({allEvents.length - 5} more events)
                </Text>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Track */}
      <Text className="text-lg text-text-muted mb-4" style={{ fontFamily: 'Inter' }}>
        Track
      </Text>
      <View className="mb-8 space-y-4">
  <View className="flex-row justify-between">
    <TouchableOpacity 
      className={`w-[48%] rounded-2xl p-6 shadow-lg items-center ${isNursingInProgress ? 'bg-green-700' : 'bg-card-main'}`}
      onPress={handleNursingPress}
    >
      <Image source={require('../assets/img/icons/nursing.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
        {isNursingInProgress ? 'Stop Nursing' : 'Nursing'}
      </Text>
      {isNursingInProgress && (
        <Text className="text-green-300 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
          {elapsedTime}
        </Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center bg-card-main" 
      onPress={() => handleQuickEvent('sleep', 'Sleep')}
    >
      <Image source={require('../assets/img/icons/sleep.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>Sleep</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center bg-card-main" 
      onPress={() => handleQuickEvent('diaper', 'Diaper Change')}
    >
      <Image source={require('../assets/img/icons/diaper.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>Diaper change</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center bg-card-main" 
      onPress={() => handleQuickEvent('pumping', 'Pumping')}
    >
      <Image source={require('../assets/img/icons/pumping.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>Pumping</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center bg-card-main" 
      onPress={() => handleQuickEvent('bottle', 'Bottle Feed')}
    >
      <Image source={require('../assets/img/icons/bottle.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>Bottle feed</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center bg-card-main" 
      onPress={() => handleQuickEvent('solids', 'Solid Food')}
    >
      <Image source={require('../assets/img/icons/solids.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>Solid food</Text>
    </TouchableOpacity>
  </View>
</View>

      {/* Today's Summary */}
      <Text className="text-lg text-text-muted mb-4" style={{ fontFamily: 'Inter' }}>
        Today's summary
      </Text>
      <View className="rounded-2xl p-4 shadow-lg mb-8 bg-card-main">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            Feedings
          </Text>
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.feedings} times
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            Sleep
          </Text>
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.sleepTime}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            Diapers
          </Text>
          <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.diapers} changes
          </Text>
        </View>
      </View>
      </View>
      
      <NursingModal
        visible={showNursingModal}
        onClose={() => setShowNursingModal(false)}
        onSave={handleNursingSave}
        currentSide={currentNursingSide}
        elapsedTime={elapsedTime}
        initialDurationSeconds={stoppedNursingDuration}
      />
      
      <EventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleEventSave}
        eventType={currentEventType}
        title={currentEventTitle}
        showDuration={currentEventType === 'pumping'}
      />
      
      <SleepModal
        visible={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={handleSleepSave}
      />
      
      <BreastSelectionModal
        visible={showBreastSelectionModal}
        onClose={() => setShowBreastSelectionModal(false)}
        onSelectSide={handleBreastSelection}
        lastNursingSide={lastNursingSide}
      />
      
      <BabySwitcherModal
        visible={showBabySwitcherModal}
        onClose={() => setShowBabySwitcherModal(false)}
        onSelectBaby={handleBabySwitch}
        babies={availableBabies}
        currentBabyId={currentBaby?.id || ''}
      />

      <AllEventsModal
        visible={showAllEventsModal}
        onClose={() => setShowAllEventsModal(false)}
        babyId={currentBaby?.id || ''}
      />
      </ScrollView>
      
      <Toast />
    </View>
    
  );
}