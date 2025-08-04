import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { eventTracker, initializeDummyData } from '../services';
import { notificationService } from '../services/notificationService';
import { liveActivityService } from '../services/liveActivityService';
import { Event, EventType, NursingSide, BabyProfile } from '../types';
import { formatDuration } from '../utils/time';
import { getEventDisplayName } from '../utils/events';
import NursingModal from '../features/nursing/NursingModal';
import EventModal from '../features/general/EventModal';
import SleepModal from '../features/sleep/SleepModal';
import PumpingModal from '../features/pumping/PumpingModal';
import BreastSelectionModal from '../components/BreastSelectionModal';
import ActiveNursingCard from '../features/nursing/ActiveNursingCard';
import ActiveSleepCard from '../features/sleep/ActiveSleepCard';
import SleepAdjustTimeModal from '../features/sleep/SleepAdjustTimeModal';
import SleepDurationModal from '../features/sleep/SleepDurationModal';
import WakeTimerModal from '../features/sleep/WakeTimerModal';
import AllEventsModal from '../components/AllEventsModal';
import CreateBabyModal from '../components/CreateBabyModal';
import BabySwitcher from '../components/BabySwitcher';
import SettingsModal from '../components/SettingsModal';
import SkeletonLoader, { SkeletonText, SkeletonCard, SkeletonEventRow } from '../components/SkeletonLoader';
import { useActiveBaby } from '../hooks/useActiveBaby';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  // Use the active baby hook
  const { 
    activeBabyId, 
    activeBaby, 
    babyList, 
    loading: babyLoading, 
    error: babyError,
    refreshBabies,
    setActiveBabyId
  } = useActiveBaby();

  // Use the auth hook
  const { signOut, user } = useAuth();

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
  const [isSleepInProgress, setIsSleepInProgress] = useState(false);
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
  const [showPumpingModal, setShowPumpingModal] = useState(false);
  const [showSleepAdjustTimeModal, setShowSleepAdjustTimeModal] = useState(false);
  const [showSleepDurationModal, setShowSleepDurationModal] = useState(false);
  const [showWakeTimerModal, setShowWakeTimerModal] = useState(false);
  const [showBreastSelectionModal, setShowBreastSelectionModal] = useState(false);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [showCreateBabyModal, setShowCreateBabyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentEventType, setCurrentEventType] = useState<EventType>('diaper');
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const [currentNursingSide, setCurrentNursingSide] = useState<NursingSide>('left');
  const [lastNursingSide, setLastNursingSide] = useState<NursingSide | undefined>(undefined);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [stoppedNursingDuration, setStoppedNursingDuration] = useState<number>(0);
  const [sleepStartTime, setSleepStartTime] = useState<Date>(new Date());
  const [sleepElapsedTime, setSleepElapsedTime] = useState('0s');
  const [frozenSleepElapsedTime, setFrozenSleepElapsedTime] = useState<string | null>(null);
  const [customSleepDurationSeconds, setCustomSleepDurationSeconds] = useState<number | undefined>(undefined);
  const [originalSleepDurationSeconds, setOriginalSleepDurationSeconds] = useState<number>(0);
  const [wasEndingSession, setWasEndingSession] = useState<boolean>(false);
  const [wakeTimerSetFor, setWakeTimerSetFor] = useState<Date | undefined>(undefined);
  const [wakeTimerTriggered, setWakeTimerTriggered] = useState<boolean>(false);

  // Helper function to parse time strings like "5m 30s" or "1h 23m" to seconds
  const parseTimeStringToSeconds = (timeString: string): number => {
    let totalSeconds = 0;
    
    // Match hours (h), minutes (m), and seconds (s)
    const hourMatch = timeString.match(/(\d+)h/);
    const minuteMatch = timeString.match(/(\d+)m/);
    const secondMatch = timeString.match(/(\d+)s/);
    
    if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
    if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60;
    if (secondMatch) totalSeconds += parseInt(secondMatch[1]);
    
    return totalSeconds || 300; // Default 5 minutes if can't parse
  };

  useEffect(() => {
    initializeApp();
    
    const interval = setInterval(() => {
      if (eventTracker.isNursingInProgress()) {
        setElapsedTime(eventTracker.getElapsedTime());
      }
      if (eventTracker.isSleepInProgress() && frozenSleepElapsedTime === null) {
        setSleepElapsedTime(eventTracker.getSleepElapsedTime());
        
        // Check wake timer status
        const sleepSession = eventTracker.getSleepSession();
        if (sleepSession) {
          setWakeTimerSetFor(sleepSession.wakeTimerSetFor);
          
          // Check if wake timer should trigger
          if (eventTracker.isWakeTimerTriggered() && !wakeTimerTriggered) {
            setWakeTimerTriggered(true);
            // Show notification
            notificationService.showWakeUpNotification(activeBaby?.name);
          } else if (!eventTracker.isWakeTimerTriggered()) {
            setWakeTimerTriggered(false);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [frozenSleepElapsedTime, wakeTimerTriggered, activeBaby]);

  // Load data when activeBabyId changes
  useEffect(() => {
    if (activeBabyId) {
      loadData(activeBabyId);
    }
  }, [activeBabyId]);

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
      
      setIsNursingInProgress(eventTracker.isNursingInProgress());
      setIsSleepInProgress(eventTracker.isSleepInProgress());
      
      if (eventTracker.isNursingInProgress()) {
        setElapsedTime(eventTracker.getElapsedTime());
        const activeSession = eventTracker.getActiveNursingSession();
        if (activeSession) {
          setCurrentNursingSide(activeSession.side);
        }
      }
      
      if (eventTracker.isSleepInProgress()) {
        setSleepElapsedTime(eventTracker.getSleepElapsedTime());
        const activeSleepSession = eventTracker.getSleepSession();
        if (activeSleepSession) {
          setSleepStartTime(activeSleepSession.startTime);
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsDatabaseReady(false);
      // Don't show alert, ActiveBabyProvider will handle baby management
    } finally {
      setIsLoading(false);
    }
  };


  const loadData = async (babyId?: string) => {
    try {
      const targetBabyId = babyId || activeBabyId;
      
      if (!targetBabyId) {
        console.warn('No baby ID available for loading data');
        return;
      }
      
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
      if (!activeBaby || !activeBabyId) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(activeBabyId)) {
        Alert.alert('Info', 'Nursing session tracking is not available with test data.');
        return;
      }
      
      await eventTracker.startNursingSession(activeBabyId, side);
      setIsNursingInProgress(true);
      setCurrentNursingSide(side);
      setElapsedTime('0m');
      
      // Start Live Activity
      console.log('🍼 [DEMO] Starting Live Activity for nursing session');
      const liveActivityStarted = await liveActivityService.startNursingActivity(side, activeBaby.name);
      console.log('🍼 [DEMO] Live Activity result:', liveActivityStarted);
      
      Toast.show({
        type: 'success',
        text1: 'Nursing Started',
        text2: `Timer is now running (${side})${liveActivityStarted ? ' • Live Activity active' : ''}`
      });
    } catch (error) {
      console.error('Error starting nursing session:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start nursing session');
    }
  };

  const handleNursingSave = async (side: NursingSide, notes: string, durationSeconds: number) => {
    try {
      // Stop Live Activity first
      await liveActivityService.stopNursingActivity();
      
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
        if (!activeBaby || !activeBabyId) throw new Error('No baby selected');
        await eventTracker.addManualEvent(
          activeBabyId, 
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
      await handleSleepPress();
    } else if (type === 'pumping') {
      setShowPumpingModal(true);
    } else {
      setShowEventModal(true);
    }
  };

  const handleSleepPress = async () => {
    try {
      if (isSleepInProgress) {
        // Stop the sleep session and show completion modal
        const activeSleepSession = eventTracker.getSleepSession();
        if (activeSleepSession) {
          setSleepStartTime(activeSleepSession.startTime);
          // Freeze the timer at current elapsed time
          const currentElapsed = eventTracker.getSleepElapsedTime();
          setFrozenSleepElapsedTime(currentElapsed);
          setSleepElapsedTime(currentElapsed);
        }
        // Stop the session immediately to freeze the timer
        setIsSleepInProgress(false);
        setWasEndingSession(true);
        setShowSleepModal(true);
      } else {
        // Start a new sleep session
        if (!activeBaby) {
          Alert.alert('Error', 'No baby selected');
          return;
        }
        
        if (!eventTracker.canLogEvents(activeBabyId)) {
          Alert.alert('Info', 'Sleep tracking is not available with test data.');
          return;
        }
        
        await eventTracker.startSleepSession(activeBabyId);
        setIsSleepInProgress(true);
        setSleepStartTime(new Date());
        setSleepElapsedTime('0s');
        setFrozenSleepElapsedTime(null); // Reset frozen time for new session
        setWakeTimerSetFor(undefined); // Reset wake timer for new session
        setWakeTimerTriggered(false);
        Toast.show({
          type: 'success',
          text1: 'Sleep Started',
          text2: 'Sleep timer is now running'
        });
      }
    } catch (error) {
      console.error('Error handling sleep session:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to manage sleep session');
    }
  };

  const handleEventSave = async (notes: string, duration?: number) => {
    try {
      if (!activeBaby || !activeBabyId) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(activeBabyId)) {
        Alert.alert('Info', 'Event logging is not available with test data.');
        return;
      }
      
      await eventTracker.addManualEvent(activeBabyId, currentEventType, undefined, duration, notes);
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

  const handlePumpingSave = async (notes: string, duration?: number, side?: 'left' | 'right' | 'both', milliliters?: number) => {
    try {
      if (!activeBaby || !activeBabyId) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      // Only block if using fallback test data (not mock database)
      if (!eventTracker.canLogEvents(activeBabyId)) {
        Alert.alert('Info', 'Pumping logging is not available with test data.');
        return;
      }
      
      await eventTracker.addPumpingSession(activeBabyId, undefined, duration, notes, side, milliliters);
      await loadData();
      
      let successMessage = 'Pumping session saved';
      if (milliliters) {
        successMessage += ` - ${milliliters}ml`;
      }
      if (side && side !== 'both') {
        successMessage += ` (${side} side)`;
      } else if (side === 'both') {
        successMessage += ` (both sides)`;
      }
      
      Toast.show({
        type: 'success',
        text1: 'Pumping Logged',
        text2: successMessage
      });
    } catch (error) {
      console.error('Error saving pumping session:', error);
      Alert.alert('Error', 'Failed to save pumping session');
    }
  };

  const handleSleepSave = async (param1: Date | string, param2?: Date | number, param3?: string) => {
    try {
      if (!activeBaby || !activeBabyId) {
        Alert.alert('Error', 'No baby selected');
        return;
      }
      
      if (!eventTracker.canLogEvents(activeBabyId)) {
        Alert.alert('Info', 'Sleep logging is not available with test data.');
        return;
      }
      
      if (typeof param1 === 'string') {
        // Session completion - param1 is notes, param2 is optional custom duration
        const notes = param1;
        const customDuration = typeof param2 === 'number' ? param2 : undefined;
        
        const event = await eventTracker.stopSleepSession(notes);
        
        // If custom duration is provided, update the event
        if (customDuration && customDuration !== event.duration) {
          const updatedEvent = { ...event, duration: customDuration };
          await eventTracker.updateEvent(updatedEvent);
        }
        
        setIsSleepInProgress(false);
        setSleepElapsedTime('0s');
        setFrozenSleepElapsedTime(null); // Reset frozen time after completion
        setCustomSleepDurationSeconds(undefined); // Reset custom duration
        setWasEndingSession(false); // Reset ending session flag
        setWakeTimerSetFor(undefined); // Reset wake timer after completion
        setWakeTimerTriggered(false);
        await loadData();
        Toast.show({
          type: 'success',
          text1: 'Sleep Complete',
          text2: `${formatDuration(customDuration || event.duration || 0)} session saved`
        });
      } else if (param2 && param1 instanceof Date && param2 instanceof Date) {
        // Manual sleep logging - param1 is startTime, param2 is endTime, param3 is notes
        const startTime = param1;
        const endTime = param2;
        const notes = param3 || '';
        await eventTracker.addSleepEvent(activeBabyId, startTime, endTime, notes);
        await loadData();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        Toast.show({
          type: 'success',
          text1: 'Sleep Logged',
          text2: `${formatDuration(duration)} session saved`
        });
      }
    } catch (error) {
      console.error('Error saving sleep event:', error);
      Alert.alert('Error', 'Failed to save sleep event');
    }
  };

  const handleSwitchNursingSide = async (newSide: NursingSide) => {
    try {
      eventTracker.switchNursingSide(newSide);
      setCurrentNursingSide(newSide);
      
      // Update Live Activity with new side
      await liveActivityService.updateNursingSide(newSide);
      
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
        // Note: Live Activity will be stopped when user saves or cancels in the modal
      } catch (error) {
        console.error('Error stopping nursing session:', error);
      }
    }
    setShowNursingModal(true);
  };

  const handleStopSleepFromCard = async () => {
    const activeSleepSession = eventTracker.getSleepSession();
    if (activeSleepSession) {
      setSleepStartTime(activeSleepSession.startTime);
      // Freeze the timer at current elapsed time
      const currentElapsed = eventTracker.getSleepElapsedTime();
      setFrozenSleepElapsedTime(currentElapsed);
      setSleepElapsedTime(currentElapsed);
      // Stop the session immediately to freeze the timer
      setIsSleepInProgress(false);
      setWasEndingSession(true);
    }
    setShowSleepModal(true);
  };

  const handleAdjustSleepStartTime = () => {
    setShowSleepAdjustTimeModal(true);
  };

  const handleSleepStartTimeAdjust = async (newStartTime: Date) => {
    try {
      await eventTracker.adjustSleepStartTime(newStartTime);
      setSleepStartTime(newStartTime);
      Toast.show({
        type: 'success',
        text1: 'Start Time Adjusted',
        text2: 'Sleep timer updated'
      });
    } catch (error) {
      console.error('Error adjusting sleep start time:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to adjust start time');
    }
  };

  const handleEditSleepDuration = () => {
    // Store the original duration for the picker
    const activeSleepSession = eventTracker.getSleepSession();
    if (activeSleepSession) {
      const now = new Date();
      const originalDuration = Math.floor((now.getTime() - activeSleepSession.startTime.getTime()) / 1000);
      setOriginalSleepDurationSeconds(customSleepDurationSeconds || originalDuration);
    } else {
      // If no active session, use the frozen elapsed time
      const timeString = frozenSleepElapsedTime || sleepElapsedTime;
      const originalDuration = customSleepDurationSeconds || parseTimeStringToSeconds(timeString);
      setOriginalSleepDurationSeconds(originalDuration);
    }
    
    // Close the sleep modal first, then open duration modal
    setShowSleepModal(false);
    setTimeout(() => {
      setShowSleepDurationModal(true);
    }, 100);
  };

  const handleSleepDurationSave = (durationSeconds: number) => {
    setCustomSleepDurationSeconds(durationSeconds);
    
    // Close duration modal and reopen sleep modal
    setShowSleepDurationModal(false);
    setTimeout(() => {
      setShowSleepModal(true);
    }, 100);
    
    Toast.show({
      type: 'success',
      text1: 'Duration Updated',
      text2: 'Sleep duration has been adjusted'
    });
  };

  const handleDiscardSleepSession = async () => {
    try {
      await eventTracker.cancelSleepSession();
      setIsSleepInProgress(false);
      setSleepElapsedTime('0s');
      setFrozenSleepElapsedTime(null);
      setCustomSleepDurationSeconds(undefined);
      setWasEndingSession(false);
      setWakeTimerSetFor(undefined);
      setWakeTimerTriggered(false);
      setShowSleepModal(false);
      
      Toast.show({
        type: 'info',
        text1: 'Sleep Session Discarded',
        text2: 'Timer has been stopped'
      });
    } catch (error) {
      console.error('Error discarding sleep session:', error);
      Alert.alert('Error', 'Failed to discard sleep session');
    }
  };

  const handleSetWakeTimer = () => {
    setShowWakeTimerModal(true);
  };

  const handleWakeTimerSave = async (wakeTime: Date) => {
    try {
      await eventTracker.setWakeTimer(wakeTime);
      setWakeTimerSetFor(wakeTime);
      setWakeTimerTriggered(false);
      
      Toast.show({
        type: 'success',
        text1: 'Wake Timer Set',
        text2: `Will alert at ${wakeTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      });
    } catch (error) {
      console.error('Error setting wake timer:', error);
      Alert.alert('Error', 'Failed to set wake timer');
    }
  };

  const handleCancelWakeTimer = async () => {
    try {
      await eventTracker.cancelWakeTimer();
      setWakeTimerSetFor(undefined);
      setWakeTimerTriggered(false);
      
      Toast.show({
        type: 'info',
        text1: 'Wake Timer Cancelled',
        text2: 'Timer has been removed'
      });
    } catch (error) {
      console.error('Error cancelling wake timer:', error);
      Alert.alert('Error', 'Failed to cancel wake timer');
    }
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
          {/* Show baby switcher or loading skeleton */}
          {babyLoading ? (
            <SkeletonLoader height={16} width="60%" />
          ) : !activeBaby && babyList.length === 0 ? (
            <Text className="text-text-muted text-sm" style={{ fontFamily: 'Inter' }}>
              No baby added yet
            </Text>
          ) : (
            <BabySwitcher 
              showCreateButton={true}
              onCreateBaby={() => setShowCreateBabyModal(true)}
            />
          )}
        </View>
        <TouchableOpacity 
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          onPress={() => setShowSettingsModal(true)}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../assets/img/icons/account.png')} 
            className="w-7 h-7"
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

      {/* Active Sleep Card */}
      {isSleepInProgress && (
        <ActiveSleepCard
          startTime={sleepStartTime}
          elapsedTime={frozenSleepElapsedTime || sleepElapsedTime}
          onStop={handleStopSleepFromCard}
          onAdjustStartTime={handleAdjustSleepStartTime}
          wakeTimerSetFor={wakeTimerSetFor}
          wakeTimerTriggered={wakeTimerTriggered}
          onSetWakeTimer={handleSetWakeTimer}
          onCancelWakeTimer={handleCancelWakeTimer}
          babyName={activeBaby?.name}
        />
      )}


      {/* Hero Message or Onboarding Card */}
      {!isSleepInProgress && !isNursingInProgress && (
        <View className="mb-8">
          {/* Show loading skeleton while babies are loading */}
          {babyLoading ? (
            <View className="mb-4">
              <SkeletonLoader height={120} borderRadius={24} />
            </View>
          ) : !activeBaby && babyList.length === 0 ? (
            /* Show onboarding card if no babies exist */
            <TouchableOpacity
              className="relative rounded-3xl overflow-hidden shadow-lg"
              style={{ height: Dimensions.get('window').height * 0.64 }}
              onPress={() => setShowCreateBabyModal(true)}
              activeOpacity={0.95}
            >
              {/* Background Image - covers entire card */}
              <Image 
                source={require('../assets/img/banners/AddYourbaby.png')} 
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
              />
              
              {/* Subtle overlay for text contrast */}
              <View className="absolute inset-0 bg-black/10 rounded-3xl" />
              
              {/* Top Row - Get Started Header */}
              <View className="absolute top-6 left-6 right-6 flex-row justify-between items-center">
                <Text 
                  className="text-white text-xl font-medium" 
                  style={{ fontFamily: 'DM Serif Display' }}
                >
                  Get started
                </Text>
                <Text className="text-white text-2xl font-light">→</Text>
              </View>
              
              {/* Bottom Section - Title and Subtitle (Center aligned) */}
              <View className="absolute bottom-6 left-6 right-6 items-center">
                <Text 
                  className="text-white text-3xl font-medium mb-2 text-center" 
                  style={{ 
                    fontFamily: 'DM Serif Display',
                    lineHeight: 36
                  }}
                >
                  Add your baby
                </Text>
                <Text 
                  className="text-white/90 text-base font-normal text-center" 
                  style={{ 
                    fontFamily: 'Inter',
                    lineHeight: 20
                  }}
                >
                  Start tracking your baby's activities
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Regular hero message when baby exists or loading */
            babyLoading ? (
              <SkeletonText lines={2} className="mb-4" />
            ) : (
              <Text className="text-3xl font-serif text-text-main mb-4 leading-tight" style={{ fontFamily: 'DM Serif Display' }}>
                {activeBaby ? `Soon time for ${activeBaby.name}'s second meal. Yum.` : 'Welcome to Baby Tracker'}
              </Text>
            )
          )}
        </View>
      )}

      {/* Recent Activity */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg text-text-muted" style={{ fontFamily: 'Inter' }}>
          Recent activity
        </Text>
        <TouchableOpacity onPress={() => setShowAllEventsModal(true)} activeOpacity={0.7}>
          <Text className="text-sm" style={{ fontFamily: 'Inter', color: '#926EFF' }}>
            All events
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="rounded-2xl p-4 shadow-lg mb-8 bg-card-main" 
        onPress={() => allEvents.length > 5 ? setShowAllEventsModal(true) : undefined}
        activeOpacity={allEvents.length > 5 ? 0.7 : 1}
      >
        {babyLoading || isLoading ? (
          /* Show skeleton loading for events */
          <>
            <SkeletonEventRow className="mb-4" />
            <SkeletonEventRow className="mb-4" />
            <SkeletonEventRow />
          </>
        ) : recentEvents.length === 0 ? (
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
                <Text className="text-primary text-sm text-center" style={{ fontFamily: 'Inter' }}>
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
      className={`w-[48%] rounded-2xl p-6 shadow-lg items-center ${isSleepInProgress ? 'bg-primary' : 'bg-card-main'}`}
      onPress={() => handleQuickEvent('sleep', 'Sleep')}
    >
      <Image source={require('../assets/img/icons/sleep.png')} className="w-12 h-12 mb-3" />
      <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
        {isSleepInProgress ? 'Stop Sleep' : 'Sleep'}
      </Text>
      {isSleepInProgress && (
        <Text className="text-white text-sm mt-1" style={{ fontFamily: 'Inter' }}>
          {frozenSleepElapsedTime || sleepElapsedTime}
        </Text>
      )}
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
        {babyLoading || isLoading ? (
          /* Show skeleton loading for summary */
          <>
            <View className="flex-row justify-between items-center mb-4">
              <SkeletonLoader height={16} width="30%" />
              <SkeletonLoader height={16} width="25%" />
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <SkeletonLoader height={16} width="25%" />
              <SkeletonLoader height={16} width="20%" />
            </View>
            <View className="flex-row justify-between items-center">
              <SkeletonLoader height={16} width="30%" />
              <SkeletonLoader height={16} width="30%" />
            </View>
          </>
        ) : (
          <>
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
          </>
        )}
      </View>
      </View>
      
      <NursingModal
        visible={showNursingModal}
        onClose={() => {
          // Stop Live Activity if user cancels
          liveActivityService.stopNursingActivity();
          setShowNursingModal(false);
        }}
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
        showDuration={false}
      />
      
      <PumpingModal
        visible={showPumpingModal}
        onClose={() => setShowPumpingModal(false)}
        onSave={handlePumpingSave}
      />
      
      <SleepModal
        visible={showSleepModal}
        onClose={() => {
          setShowSleepModal(false);
          // If user cancels while a sleep session was in progress, restart the tracking
          if (eventTracker.getSleepSession()) {
            setIsSleepInProgress(true);
            setFrozenSleepElapsedTime(null); // Unfreeze the timer
            setCustomSleepDurationSeconds(undefined); // Reset custom duration
          }
          setWasEndingSession(false); // Reset ending session flag
        }}
        onSave={handleSleepSave}
        sleepDuration={frozenSleepElapsedTime || sleepElapsedTime}
        isEndingSession={wasEndingSession}
        onEditDuration={handleEditSleepDuration}
        customDurationSeconds={customSleepDurationSeconds}
        onDiscard={handleDiscardSleepSession}
      />
      
      <SleepAdjustTimeModal
        visible={showSleepAdjustTimeModal}
        onClose={() => setShowSleepAdjustTimeModal(false)}
        onSave={handleSleepStartTimeAdjust}
        currentStartTime={sleepStartTime}
      />
      
      <SleepDurationModal
        visible={showSleepDurationModal}
        onClose={() => setShowSleepDurationModal(false)}
        onSave={handleSleepDurationSave}
        currentDurationSeconds={originalSleepDurationSeconds}
      />
      
      <WakeTimerModal
        visible={showWakeTimerModal}
        onClose={() => setShowWakeTimerModal(false)}
        onSave={handleWakeTimerSave}
        currentTime={new Date()}
      />
      
      <BreastSelectionModal
        visible={showBreastSelectionModal}
        onClose={() => setShowBreastSelectionModal(false)}
        onSelectSide={handleBreastSelection}
        lastNursingSide={lastNursingSide}
      />
      

      <AllEventsModal
        visible={showAllEventsModal}
        onClose={() => setShowAllEventsModal(false)}
        babyId={activeBabyId || ''}
      />
      
      <CreateBabyModal
        visible={showCreateBabyModal}
        onClose={() => setShowCreateBabyModal(false)}
        onBabyCreated={() => {
          refreshBabies();
          setShowCreateBabyModal(false);
        }}
      />
      </ScrollView>
      
      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBabyUpdated={refreshBabies}
        onCreateBaby={() => setShowCreateBabyModal(true)}
        onBabyJoined={async (babyId) => {
          // Refresh babies and switch to the newly joined baby
          await refreshBabies();
          setActiveBabyId(babyId);
        }}
      />
      
      <Toast />
    </View>
    
  );
}