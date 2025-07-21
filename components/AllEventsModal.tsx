import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Event } from '../types';
import { eventTracker } from '../services';
import { formatDuration } from '../utils/time';
import { getEventDisplayName } from '../utils/events';

interface AllEventsModalProps {
  visible: boolean;
  onClose: () => void;
  babyId: string;
}

export default function AllEventsModal({ visible, onClose, babyId }: AllEventsModalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Date filter states
  const [fromDate, setFromDate] = useState(new Date());
  const [untilDate, setUntilDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  useEffect(() => {
    if (visible && babyId) {
      loadAllEvents();
    }
  }, [visible, babyId]);

  useEffect(() => {
    // Set today as default dates when modal opens
    if (visible) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setFromDate(today);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      setUntilDate(endOfDay);
    }
  }, [visible]);

  useEffect(() => {
    filterEvents();
  }, [events, fromDate, untilDate]);

  const loadAllEvents = async () => {
    if (!babyId || !eventTracker.canLogEvents(babyId)) {
      setEvents([]);
      setFilteredEvents([]);
      return;
    }

    setLoading(true);
    try {
      const allEvents = await eventTracker.getRecentEvents(babyId, 1000); // Get many events
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }

    const filtered = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= fromDate && eventDate <= untilDate;
    });

    setFilteredEvents(filtered);
  };

  const formatEventTime = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time for comparison
    const eventDateOnly = new Date(date);
    eventDateOnly.setHours(0, 0, 0, 0);
    const todayOnly = new Date(today);
    todayOnly.setHours(0, 0, 0, 0);
    const yesterdayOnly = new Date(yesterday);
    yesterdayOnly.setHours(0, 0, 0, 0);
    
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (eventDateOnly.getTime() === todayOnly.getTime()) {
      return `Today ${timeString}`;
    } else if (eventDateOnly.getTime() === yesterdayOnly.getTime()) {
      return `Yesterday ${timeString}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const formatDateForDisplay = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(0, 0, 0, 0);
      setFromDate(newDate);
    }
  };

  const onUntilDateChange = (event: any, selectedDate?: Date) => {
    setShowUntilPicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(23, 59, 59, 999);
      setUntilDate(newDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#0E0A13]">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
          <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            All Events
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text className="text-blue-400 text-lg" style={{ fontFamily: 'Inter' }}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Filters */}
        <View className="p-4 border-b border-gray-700">
          <Text className="text-white text-lg mb-3" style={{ fontFamily: 'Inter' }}>
            Filter by Date
          </Text>
          
          <View className="flex-row justify-between gap-4">
            {/* From Date */}
            <View className="flex-1">
              <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                From
              </Text>
              <TouchableOpacity
                className="bg-[#171021] p-3 rounded-xl"
                onPress={() => setShowFromPicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-white" style={{ fontFamily: 'Inter' }}>
                  {formatDateForDisplay(fromDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Until Date */}
            <View className="flex-1">
              <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                Until
              </Text>
              <TouchableOpacity
                className="bg-[#171021] p-3 rounded-xl"
                onPress={() => setShowUntilPicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-white" style={{ fontFamily: 'Inter' }}>
                  {formatDateForDisplay(untilDate)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Events List */}
        <ScrollView className="flex-1 p-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#22543D" />
              <Text className="text-gray-400 mt-4" style={{ fontFamily: 'Inter' }}>
                Loading events...
              </Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
                No events found for the selected date range
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {filteredEvents.map((event, index) => (
                <View 
                  key={event.id} 
                  className="bg-[#171021] rounded-xl p-4"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                        {getEventDisplayName(event.type)}
                        {event.duration && ` (${formatDuration(event.duration)})`}
                        {'side' in event && event.side && ` - ${event.side}`}
                      </Text>
                      {event.notes && (
                        <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                          {event.notes}
                        </Text>
                      )}
                    </View>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Inter' }}>
                      {formatEventTime(event.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Date Pickers */}
        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onFromDateChange}
          />
        )}

        {showUntilPicker && (
          <DateTimePicker
            value={untilDate}
            mode="date"
            display="default"
            onChange={onUntilDateChange}
          />
        )}
      </View>
    </Modal>
  );
}