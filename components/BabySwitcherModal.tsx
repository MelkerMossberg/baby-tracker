import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BabyProfile } from '../types';

interface BabySwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBaby: (baby: BabyProfile) => void;
  babies: BabyProfile[];
  currentBabyId: string;
}

export default function BabySwitcherModal({ 
  visible, 
  onClose, 
  onSelectBaby, 
  babies, 
  currentBabyId 
}: BabySwitcherModalProps) {
  const handleBabySelection = (baby: BabyProfile) => {
    onSelectBaby(baby);
    onClose();
  };

  const getAge = (birthdate: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - birthdate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffYears > 0) {
      return `${diffYears}y ${diffMonths % 12}m`;
    } else if (diffMonths > 0) {
      return `${diffMonths}m`;
    } else {
      return `${diffDays}d`;
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
        <View className="bg-[#0E0A13] rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
              Select Baby
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-lg" style={{ fontFamily: 'Inter' }}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ minHeight: 200 }}>
            {babies.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
                  No babies found
                </Text>
                <Text className="text-gray-500 text-sm text-center mt-2" style={{ fontFamily: 'Inter' }}>
                  Baby profiles may not have loaded yet
                </Text>
              </View>
            ) : (
              babies.map((baby) => (
                <TouchableOpacity
                  key={baby.id}
                  className="py-4 px-4 rounded-xl mb-3 border-2"
                  style={{ 
                    backgroundColor: currentBabyId === baby.id ? '#22543D' : '#171021',
                    borderColor: currentBabyId === baby.id ? '#22543D' : '#2D3748'
                  }}
                  onPress={() => handleBabySelection(baby)}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Inter' }}>
                        {baby.name}
                      </Text>
                      <Text className="text-gray-300 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                        {getAge(baby.birthdate)} old
                      </Text>
                    </View>
                    {currentBabyId === baby.id && (
                      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            className="py-4 rounded-xl items-center border border-gray-600 mt-4"
            onPress={onClose}
          >
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}