import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { eventTracker, initializeDummyData, DUMMY_BABY_ID, databaseService } from '../services';
import { Event, EventType, NursingSide, BabyProfile } from '../types';
import NursingModal from '../components/NursingModal';
import EventModal from '../components/EventModal';
import SleepModal from '../components/SleepModal';
import BreastSelectionModal from '../components/BreastSelectionModal';
import ActiveNursingCard from '../components/ActiveNursingCard';
import BabySwitcherModal from '../components/BabySwitcherModal';

export default function HomeScreen() {
  const [isNursingInProgress, setIsNursingInProgress] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0m');
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
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
  const [currentEventType, setCurrentEventType] = useState<EventType>('diaper');
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const [currentNursingSide, setCurrentNursingSide] = useState<NursingSide>('left');
  const [lastNursingSide, setLastNursingSide] = useState<NursingSide | undefined>(undefined);
  const [currentBaby, setCurrentBaby] = useState<BabyProfile | null>(null);
  const [availableBabies, setAvailableBabies] = useState<BabyProfile[]>([]);

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
      await initializeDummyData();
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
      Alert.alert('Error', 'Failed to initialize app');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBabies = async () => {
    try {
      const babies = await databaseService.getAllBabyProfiles();
      
      if (babies.length === 0) {
        // Create temporary fallback data for testing
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
        const defaultBaby = testBabies[1]; // Luna (later birthdate)
        setCurrentBaby(defaultBaby);
        return;
      }
      
      setAvailableBabies(babies);
      
      // Set default to the latest created baby (Luna)
      const sortedBabies = babies.sort((a, b) => b.birthdate.getTime() - a.birthdate.getTime());
      const defaultBaby = sortedBabies[0]; // Latest baby (Luna)
      setCurrentBaby(defaultBaby);
      await loadData(defaultBaby.id);
    } catch (error) {
      console.error('Error loading babies:', error);
      setAvailableBabies([]);
      setCurrentBaby(null);
    }
  };

  const loadData = async (babyId?: string) => {
    try {
      const targetBabyId = babyId || currentBaby?.id || DUMMY_BABY_ID;
      const events = await eventTracker.getRecentEvents(targetBabyId, 5);
      setRecentEvents(events);

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

  const handleNursingSave = async (_side: NursingSide, notes: string) => {
    try {
      const event = await eventTracker.stopNursingSession(notes);
      setIsNursingInProgress(false);
      setElapsedTime('0m');
      await loadData();
      Toast.show({
        type: 'success',
        text1: 'Nursing Complete',
        text2: `${eventTracker.formatDuration(event.duration || 0)} session logged`
      });
    } catch (error) {
      console.error('Error stopping nursing session:', error);
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
      
      await eventTracker.addSleepEvent(currentBaby.id, startTime, endTime, notes);
      await loadData();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      Toast.show({
        type: 'success',
        text1: 'Sleep Logged',
        text2: `${eventTracker.formatDuration(duration)} session saved`
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

  const handleStopNursingFromCard = () => {
    const activeSession = eventTracker.getActiveNursingSession();
    if (activeSession) {
      setCurrentNursingSide(activeSession.side);
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
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    return `${diffMins}m ago`;
  };

  const getEventDisplayName = (type: EventType): string => {
    const names: Record<EventType, string> = {
      nursing: 'Nursing',
      sleep: 'Sleep',
      diaper: 'Diaper change',
      pumping: 'Pumping',
      bottle: 'Bottle feed',
      solids: 'Solid food'
    };
    return names[type];
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0E0A13] justify-center items-center">
        <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#0E0A13' }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
      >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            Baby Tracker
          </Text>
          <TouchableOpacity 
            className="flex-row items-center mt-1"
            onPress={() => setShowBabySwitcherModal(true)}
          >
            <Text className="text-sm text-gray-400" style={{ fontFamily: 'Inter' }}>
              ▼ Focused on {currentBaby?.name || (availableBabies.length === 0 ? 'No babies found' : 'Loading...')}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
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
      <Text className="text-3xl font-serif text-white mb-8 leading-tight" style={{ fontFamily: 'DM Serif Display' }}>
        {currentBaby ? `Soon time for ${currentBaby.name}'s second meal. Yum.` : 'Welcome to Baby Tracker'}
      </Text>

      {/* Recent Activity */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Recent activity
      </Text>
      <View className="rounded-2xl p-4 shadow-lg mb-8" style={{ backgroundColor: '#171021' }}>
        {recentEvents.length === 0 ? (
          <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
            No recent activity
          </Text>
        ) : (
          recentEvents.map((event, index) => (
            <View 
              key={event.id} 
              className={`flex-row justify-between items-center ${index < recentEvents.length - 1 ? 'mb-4' : ''}`}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>
                {getEventDisplayName(event.type)}
                {event.duration && ` (${eventTracker.formatDuration(event.duration)})`}
              </Text>
              <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Inter' }}>
                {formatEventTime(event.timestamp)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Track */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Track
      </Text>
      <View className="mb-8 space-y-4">
  <View className="flex-row justify-between">
    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: isNursingInProgress ? '#22543D' : '#171021' }}
      onPress={handleNursingPress}
    >
      <Image source={require('../assets/img/icons/nursing.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>
        {isNursingInProgress ? 'Stop Nursing' : 'Nursing'}
      </Text>
      {isNursingInProgress && (
        <Text className="text-green-300 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
          {elapsedTime}
        </Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: '#171021' }}
      onPress={() => handleQuickEvent('sleep', 'Sleep')}
    >
      <Image source={require('../assets/img/icons/sleep.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Sleep</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: '#171021' }}
      onPress={() => handleQuickEvent('diaper', 'Diaper Change')}
    >
      <Image source={require('../assets/img/icons/diaper.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Diaper change</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: '#171021' }}
      onPress={() => handleQuickEvent('pumping', 'Pumping')}
    >
      <Image source={require('../assets/img/icons/pumping.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Pumping</Text>
    </TouchableOpacity>
  </View>

  <View className="flex-row justify-between">
    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: '#171021' }}
      onPress={() => handleQuickEvent('bottle', 'Bottle Feed')}
    >
      <Image source={require('../assets/img/icons/bottle.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Bottle feed</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      className="w-[48%] rounded-2xl p-6 shadow-lg items-center" 
      style={{ backgroundColor: '#171021' }}
      onPress={() => handleQuickEvent('solids', 'Solid Food')}
    >
      <Image source={require('../assets/img/icons/solids.png')} className="w-12 h-12 mb-3" />
      <Text className="text-white" style={{ fontFamily: 'Inter' }}>Solid food</Text>
    </TouchableOpacity>
  </View>
</View>

      {/* Today's Summary */}
      <Text className="text-lg text-gray-400 mb-4" style={{ fontFamily: 'Inter' }}>
        Today's summary
      </Text>
      <View className="rounded-2xl p-4 shadow-lg mb-8" style={{ backgroundColor: '#171021' }}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Feedings
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.feedings} times
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Sleep
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.sleepTime}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            Diapers
          </Text>
          <Text className="text-white" style={{ fontFamily: 'Inter' }}>
            {todaysSummary.diapers} changes
          </Text>
        </View>
      </View>
      
      <NursingModal
        visible={showNursingModal}
        onClose={() => setShowNursingModal(false)}
        onSave={handleNursingSave}
        currentSide={currentNursingSide}
        elapsedTime={elapsedTime}
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
      </ScrollView>
      
      <Toast />
    </View>
  );
}