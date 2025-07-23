import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SleepDurationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (durationSeconds: number) => void;
  currentDurationSeconds: number;
}

export default function SleepDurationModal({ 
  visible, 
  onClose, 
  onSave, 
  currentDurationSeconds 
}: SleepDurationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(new Date());

  useEffect(() => {
    if (visible) {
      // Convert seconds to a Date object for the picker
      // Use a base date and add the duration
      const baseDate = new Date(2000, 0, 1, 0, 0, 0); // Jan 1, 2000 at 00:00:00
      const durationDate = new Date(baseDate.getTime() + currentDurationSeconds * 1000);
      setSelectedDuration(durationDate);
    }
  }, [visible, currentDurationSeconds]);

  const handleSave = () => {
    // Convert the time picker value back to total seconds
    const baseDate = new Date(2000, 0, 1, 0, 0, 0);
    const durationInSeconds = Math.floor((selectedDuration.getTime() - baseDate.getTime()) / 1000);
    
    if (durationInSeconds <= 0) {
      Alert.alert('Invalid Duration', 'Duration must be greater than 0 seconds.');
      return;
    }
    
    // Maximum 24 hours (86400 seconds)
    if (durationInSeconds > 86400) {
      Alert.alert('Invalid Duration', 'Duration cannot be more than 24 hours.');
      return;
    }
    
    onSave(durationInSeconds);
    onClose();
  };

  const handleCancel = () => {
    // Reset to original duration
    const baseDate = new Date(2000, 0, 1, 0, 0, 0);
    const durationDate = new Date(baseDate.getTime() + currentDurationSeconds * 1000);
    setSelectedDuration(durationDate);
    onClose();
  };

  const onChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedDuration(date);
    }
  };

  const formatDurationDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDurationSeconds = (): number => {
    const baseDate = new Date(2000, 0, 1, 0, 0, 0);
    return Math.floor((selectedDuration.getTime() - baseDate.getTime()) / 1000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-bg-main rounded-t-3xl p-6">
          <Text className="text-xl font-serif text-text-main mb-6 text-center" style={{ fontFamily: 'DM Serif Display' }}>
            Edit Sleep Duration
          </Text>
          
          <View className="mb-6">
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  Current duration
                </Text>
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  {formatDurationDisplay(currentDurationSeconds)}
                </Text>
              </View>
            </View>
            
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  Change to
                </Text>
                
                <DateTimePicker
                  value={selectedDuration}
                  mode="time"
                  display="compact"
                  onChange={onChange}
                  themeVariant="dark"
                  locale="en_GB"
                />
              </View>
            </View>
            
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <Text className="text-text-main text-center" style={{ fontFamily: 'Inter' }}>
                New duration: {formatDurationDisplay(getCurrentDurationSeconds())}
              </Text>
            </View>
            
            <Text className="text-text-muted text-xs text-center" style={{ fontFamily: 'Inter' }}>
              Format: HH:MM:SS (Maximum 24 hours)
            </Text>
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center border border-text-muted"
              onPress={handleCancel}
            >
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center bg-blue-600"
              onPress={handleSave}
            >
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}