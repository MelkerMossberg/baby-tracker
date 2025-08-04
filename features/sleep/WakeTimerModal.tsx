import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WakeTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (wakeTime: Date) => void;
  currentTime: Date;
}

export default function WakeTimerModal({ 
  visible, 
  onClose, 
  onSave, 
  currentTime 
}: WakeTimerModalProps) {
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    if (visible) {
      // Set default to 1 minute from now for testing
      const defaultTime = new Date(currentTime.getTime() + 1 * 60 * 1000);
      setSelectedTime(defaultTime);
    }
  }, [visible, currentTime]);

  const handleSave = () => {
    const now = new Date();
    
    // Validate the selected time is in the future
    if (selectedTime <= now) {
      Alert.alert(
        'Invalid Time', 
        'Wake-up time must be in the future.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate the selected time is within 24 hours
    const maxTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (selectedTime > maxTime) {
      Alert.alert(
        'Invalid Time', 
        'Wake-up time cannot be more than 24 hours from now.',
        [{ text: 'OK' }]
      );
      return;
    }

    onSave(selectedTime);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const onChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  const formatTimeDisplay = (date: Date): string => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getTimeDifference = (): string => {
    const diffMs = selectedTime.getTime() - currentTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
            Set Wake-up Timer
          </Text>
          
          <View className="mb-6">
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  Wake up at
                </Text>
                
                <DateTimePicker
                  value={selectedTime}
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
                Timer duration: {getTimeDifference()}
              </Text>
            </View>
            
            <Text className="text-text-muted text-xs text-center" style={{ fontFamily: 'Inter' }}>
              Timer will alert you at the specified time
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
              className="flex-1 py-4 rounded-xl items-center bg-primary"
              onPress={handleSave}
            >
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Set Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}