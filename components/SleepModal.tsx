import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';

interface SleepModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (startTime: Date, endTime: Date, notes: string) => void;
}

export default function SleepModal({ visible, onClose, onSave }: SleepModalProps) {
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [durationHours, setDurationHours] = useState('2');
  const [durationMinutes, setDurationMinutes] = useState('0');

  const handleSave = () => {
    const hours = parseInt(durationHours) || 0;
    const minutes = parseInt(durationMinutes) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    const end = new Date();
    const start = new Date(end.getTime() - totalMinutes * 60 * 1000);
    
    onSave(start, end, notes);
    setNotes('');
    setDurationHours('2');
    setDurationMinutes('0');
    onClose();
  };

  const handleCancel = () => {
    setNotes('');
    setDurationHours('2');
    setDurationMinutes('0');
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
            Log Sleep Session
          </Text>
          
          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            How long did the baby sleep?
          </Text>
          
          <View className="flex-row items-center mb-4">
            <TextInput
              className="bg-[#171021] text-white p-4 rounded-xl flex-1 mr-2"
              style={{ fontFamily: 'Inter' }}
              placeholder="Hours"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={durationHours}
              onChangeText={setDurationHours}
            />
            <Text className="text-white mx-2" style={{ fontFamily: 'Inter' }}>hours</Text>
            <TextInput
              className="bg-[#171021] text-white p-4 rounded-xl flex-1 ml-2"
              style={{ fontFamily: 'Inter' }}
              placeholder="Minutes"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
            />
            <Text className="text-white ml-2" style={{ fontFamily: 'Inter' }}>min</Text>
          </View>

          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Notes (optional)
          </Text>
          
          <TextInput
            className="bg-[#171021] text-white p-4 rounded-xl mb-6"
            style={{ fontFamily: 'Inter', minHeight: 80 }}
            placeholder="Sleep quality, location, etc..."
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