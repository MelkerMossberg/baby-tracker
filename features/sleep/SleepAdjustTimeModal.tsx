import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SleepAdjustTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newStartTime: Date) => void;
  currentStartTime: Date;
}

export default function SleepAdjustTimeModal({ 
  visible, 
  onClose, 
  onSave, 
  currentStartTime 
}: SleepAdjustTimeModalProps) {
  const [selectedTime, setSelectedTime] = useState(currentStartTime);

  useEffect(() => {
    if (visible) {
      setSelectedTime(currentStartTime);
    }
  }, [visible, currentStartTime]);

  const handleSave = () => {
    const now = new Date();
    const maxHoursBack = 12;
    const earliestAllowed = new Date(now.getTime() - (maxHoursBack * 60 * 60 * 1000));
    
    if (selectedTime < earliestAllowed) {
      Alert.alert(
        'Invalid Time', 
        `Start time cannot be more than ${maxHoursBack} hours ago.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedTime > now) {
      Alert.alert(
        'Invalid Time', 
        'Start time cannot be in the future.',
        [{ text: 'OK' }]
      );
      return;
    }

    onSave(selectedTime);
    onClose();
  };

  const handleCancel = () => {
    setSelectedTime(currentStartTime);
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
            Adjust Sleep Start Time
          </Text>
          
          <View className="mb-6">
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  Current start time
                </Text>
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  {formatTimeDisplay(currentStartTime)}
                </Text>
              </View>
            </View>
            
            <View className="bg-card-main rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
                  Change to
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
            
            <Text className="text-text-muted text-xs text-center" style={{ fontFamily: 'Inter' }}>
              Maximum 12 hours back from now
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
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}