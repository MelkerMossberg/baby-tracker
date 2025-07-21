import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { EventType } from '../../types';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (notes: string, duration?: number) => void;
  eventType: EventType;
  title: string;
  showDuration?: boolean;
}

export default function EventModal({ visible, onClose, onSave, eventType, title, showDuration = false }: EventModalProps) {
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');

  const handleSave = () => {
    const durationNumber = showDuration && duration ? parseInt(duration) * 60 : undefined;
    onSave(notes, durationNumber);
    setNotes('');
    setDuration('');
    onClose();
  };

  const handleCancel = () => {
    setNotes('');
    setDuration('');
    onClose();
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
            {title}
          </Text>
          
          {showDuration && (
            <>
              <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
                Duration (minutes)
              </Text>
              <TextInput
                className="bg-[#171021] text-white p-4 rounded-xl mb-4"
                style={{ fontFamily: 'Inter' }}
                placeholder="Enter duration in minutes"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </>
          )}

          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Notes (optional)
          </Text>
          
          <TextInput
            className="bg-[#171021] text-white p-4 rounded-xl mb-6"
            style={{ fontFamily: 'Inter', minHeight: 80 }}
            placeholder="Add any notes..."
            placeholderTextColor="#6B7280"
            multiline
            value={notes}
            onChangeText={setNotes}
          />

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