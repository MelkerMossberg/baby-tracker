import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { getEventsForBaby, getTodaysEventsForBaby } from '../lib/api/events';
import type { Event as LocalEvent, EventType } from '../types/models';

/**
 * Example component demonstrating how to use the enhanced events API
 */
export default function EventsAPIUsage({ babyId }: { babyId: string }) {
  const [allEvents, setAllEvents] = useState<LocalEvent[]>([]);
  const [todaysEvents, setTodaysEvents] = useState<LocalEvent[]>([]);
  const [nursingEvents, setNursingEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (babyId) {
      loadAllExamples();
    }
  }, [babyId]);

  const loadAllExamples = async () => {
    try {
      setLoading(true);

      // Example 1: Get all events for the baby
      const all = await getEventsForBaby(babyId);
      setAllEvents(all);

      // Example 2: Get today's events only
      const today = await getTodaysEventsForBaby(babyId);
      setTodaysEvents(today);

      // Example 3: Get events filtered by type
      const nursing = await getEventsForBaby(babyId, 'nursing');
      setNursingEvents(nursing);

    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByType = async (eventType: EventType) => {
    try {
      setLoading(true);
      const filteredEvents = await getEventsForBaby(babyId, eventType);
      setAllEvents(filteredEvents);
      Alert.alert('Success', `Loaded ${filteredEvents.length} ${eventType} events`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to filter events');
    } finally {
      setLoading(false);
    }
  };

  const renderEvent = ({ item }: { item: LocalEvent }) => (
    <View className="bg-card-main p-3 mb-2 rounded-lg">
      <Text className="text-text-main font-semibold text-lg">{item.type.toUpperCase()}</Text>
      <Text className="text-text-muted">
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      {item.duration && (
        <Text className="text-text-muted">
          Duration: {Math.floor(item.duration / 60)}m {item.duration % 60}s
        </Text>
      )}
      {item.side && (
        <Text className="text-text-muted">Side: {item.side}</Text>
      )}
      {item.pumpingSide && (
        <Text className="text-text-muted">Pumping side: {item.pumpingSide}</Text>
      )}
      {item.milliliters && (
        <Text className="text-text-muted">Volume: {item.milliliters}ml</Text>
      )}
      {item.notes && (
        <Text className="text-text-muted">Notes: {item.notes}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-text-main">Loading events...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-text-main text-xl font-bold mb-4">Events API Examples</Text>
      
      {/* Filter Buttons */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        <TouchableOpacity
          className="bg-primary px-3 py-2 rounded-lg"
          onPress={() => loadAllExamples()}
        >
          <Text className="text-white text-sm">All Events</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-green-600 px-3 py-2 rounded-lg"
          onPress={() => handleFilterByType('nursing')}
        >
          <Text className="text-white text-sm">Nursing</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-purple-600 px-3 py-2 rounded-lg"
          onPress={() => handleFilterByType('sleep')}
        >
          <Text className="text-white text-sm">Sleep</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-orange-600 px-3 py-2 rounded-lg"
          onPress={() => handleFilterByType('pumping')}
        >
          <Text className="text-white text-sm">Pumping</Text>
        </TouchableOpacity>
      </View>

      {/* Event Counts */}
      <View className="bg-card-main p-4 rounded-lg mb-4">
        <Text className="text-text-main font-semibold mb-2">Event Summary:</Text>
        <Text className="text-text-muted">All events: {allEvents.length}</Text>
        <Text className="text-text-muted">Today's events: {todaysEvents.length}</Text>
        <Text className="text-text-muted">Nursing events: {nursingEvents.length}</Text>
      </View>

      {/* Events List */}
      <FlatList
        data={allEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-text-muted text-center">
              No events found for the current filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

/**
 * Example usage in other components:
 * 
 * ```typescript
 * import { getEventsForBaby, getTodaysEventsForBaby } from '@/lib/api/events';
 * 
 * // In your component
 * const loadEvents = async () => {
 *   try {
 *     // Get all events
 *     const allEvents = await getEventsForBaby(babyId);
 *     
 *     // Get only sleep events
 *     const sleepEvents = await getEventsForBaby(babyId, 'sleep');
 *     
 *     // Get today's events
 *     const todaysEvents = await getTodaysEventsForBaby(babyId);
 *     
 *     // Get today's nursing events only
 *     const todaysNursing = await getTodaysEventsForBaby(babyId, 'nursing');
 *     
 *   } catch (error) {
 *     if (error.message.includes('Access denied')) {
 *       // Handle permission error
 *       console.log('User does not have access to this baby');
 *     } else if (error.message.includes('Invalid event type')) {
 *       // Handle invalid event type
 *       console.log('Invalid event type provided');
 *     } else {
 *       // Handle other errors
 *       console.error('Unexpected error:', error);
 *     }
 *   }
 * };
 * ```
 */