import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NursingSide } from '../types';

interface NursingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (side: NursingSide, notes: string) => void;
  currentSide: NursingSide;
  elapsedTime: string;
}

export default function NursingModal({ visible, onClose, onSave, currentSide, elapsedTime }: NursingModalProps) {
  const [selectedSide, setSelectedSide] = useState<NursingSide>(currentSide);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(selectedSide, notes);
    setNotes('');
    onClose();
  };

  const handleCancel = () => {
    setNotes('');
    onClose();
  };

  const getSideButtonStyle = (side: NursingSide) => ({
    backgroundColor: selectedSide === side ? '#22543D' : '#171021'
  });

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
            Nursing Session Complete
          </Text>
          
          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Duration: {elapsedTime}
          </Text>

          <Text className="text-lg text-white mb-4" style={{ fontFamily: 'Inter' }}>
            Which side?
          </Text>
          
          <View className="flex-row justify-between mb-6">
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-xl mr-2 items-center"
              style={getSideButtonStyle('left')}
              onPress={() => setSelectedSide('left')}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>Left</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-xl mx-1 items-center"
              style={getSideButtonStyle('both')}
              onPress={() => setSelectedSide('both')}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>Both</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-xl ml-2 items-center"
              style={getSideButtonStyle('right')}
              onPress={() => setSelectedSide('right')}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>Right</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-lg text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Notes (optional)
          </Text>
          
          <TextInput
            className="bg-[#171021] text-white p-4 rounded-xl mb-6"
            style={{ fontFamily: 'Inter', minHeight: 80 }}
            placeholder="Add any notes about this session..."
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