import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { NursingSide } from '../types';

interface BreastSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSide: (side: NursingSide) => void;
  lastNursingSide?: NursingSide;
}

export default function BreastSelectionModal({ visible, onClose, onSelectSide, lastNursingSide }: BreastSelectionModalProps) {
  const handleSideSelection = (side: NursingSide) => {
    onSelectSide(side);
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
            Start Nursing
          </Text>
          
          <Text className="text-lg text-white mb-6 text-center" style={{ fontFamily: 'Inter' }}>
            Which side would you like to start with?
          </Text>

          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              className="flex-1 py-4 px-6 rounded-xl items-center"
              style={{ backgroundColor: '#22543D' }}
              onPress={() => handleSideSelection('left')}
            >
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Left</Text>
              {lastNursingSide === 'left' && (
                <Text 
                  className="text-white mt-1" 
                  style={{ fontFamily: 'Inter', fontSize: 12, opacity: 0.6 }}
                >
                  Last time
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-4 px-6 rounded-xl items-center"
              style={{ backgroundColor: '#22543D' }}
              onPress={() => handleSideSelection('right')}
            >
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Right</Text>
              {lastNursingSide === 'right' && (
                <Text 
                  className="text-white mt-1" 
                  style={{ fontFamily: 'Inter', fontSize: 12, opacity: 0.6 }}
                >
                  Last time
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="py-4 rounded-xl items-center border border-gray-600"
            onPress={onClose}
          >
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}