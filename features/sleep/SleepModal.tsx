import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { formatDuration } from '../../utils/time';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (notes: string, customDurationSeconds?: number) => void;
  sleepDuration?: string;
  sleepDurationSeconds?: number;
  isEndingSession?: boolean;
  onEditDuration?: () => void;
  customDurationSeconds?: number;
  onDiscard?: () => void;
}

export default function SleepModal({ visible, onClose, onSave, sleepDuration, sleepDurationSeconds, isEndingSession = false, onEditDuration, customDurationSeconds: propCustomDurationSeconds, onDiscard }: SleepModalProps) {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (notes.length > 140) {
      return; // Notes validation handled by TextInput maxLength
    }
    
    onSave(notes, propCustomDurationSeconds);
    setNotes('');
    onClose();
  };

  const handleCancel = () => {
    if (isEndingSession && onDiscard) {
      // Show confirmation dialog for active sleep sessions
      Alert.alert(
        'Cancel Sleep Session',
        'What would you like to do?',
        [
          {
            text: 'Keep counting',
            style: 'cancel',
            onPress: () => {
              // Just close the modal and return to timer
              setNotes('');
              onClose();
            }
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setNotes('');
              onDiscard();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      // Normal cancel behavior for manual sleep logging
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-[#0E0A13] rounded-t-3xl p-6">
          <Text className="text-xl font-serif text-white mb-6 text-center" style={{ fontFamily: 'DM Serif Display' }}>
            {isEndingSession ? 'End Sleep Session' : 'Log Sleep Session'}
          </Text>
          
          {isEndingSession && sleepDuration && (
            <View className="mb-4 p-4 bg-[#171021] rounded-xl">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                  Sleep Duration: {propCustomDurationSeconds ? formatDuration(propCustomDurationSeconds) : sleepDuration}
                </Text>
                {onEditDuration && (
                  <TouchableOpacity 
                    onPress={onEditDuration}
                    activeOpacity={0.7}
                  >
                    <Text className="text-blue-400 text-sm" style={{ fontFamily: 'Inter' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Notes (optional)
          </Text>
          
          <TextInput
            className="bg-[#171021] text-white p-4 rounded-xl mb-2"
            style={{ fontFamily: 'Inter', minHeight: 80 }}
            placeholder="Sleep quality, location, etc..."
            placeholderTextColor="#6B7280"
            multiline
            maxLength={140}
            value={notes}
            onChangeText={setNotes}
          />
          
          <Text className="text-gray-400 text-xs mb-6 text-right" style={{ fontFamily: 'Inter' }}>
            {notes.length}/140
          </Text>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center border border-gray-600"
              onPress={handleCancel}
            >
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: '#22543D' }}
              onPress={handleSave}
            >
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}