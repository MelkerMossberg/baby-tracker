import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NursingSide } from '../types';

interface ActiveNursingCardProps {
  elapsedTime: string;
  currentSide: NursingSide;
  onSwitchSide: (side: NursingSide) => void;
  onStop: () => void;
}

export default function ActiveNursingCard({ elapsedTime, currentSide, onSwitchSide, onStop }: ActiveNursingCardProps) {
  const getSideButtonStyle = (side: NursingSide) => ({
    backgroundColor: currentSide === side ? '#22543D' : '#171021'
  });

  const getSideDisplayText = (side: NursingSide): string => {
    return side.charAt(0).toUpperCase() + side.slice(1);
  };

  return (
    <View className="mx-4 mb-4 rounded-2xl p-4 shadow-lg" style={{ backgroundColor: '#1F2937' }}>
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white text-lg font-serif" style={{ fontFamily: 'DM Serif Display' }}>
            Nursing in Progress
          </Text>
          <Text className="text-green-300 text-2xl font-bold mt-1" style={{ fontFamily: 'Inter' }}>
            {elapsedTime}
          </Text>
        </View>
        
        <TouchableOpacity
          className="py-2 px-4 rounded-xl"
          style={{ backgroundColor: '#DC2626' }}
          onPress={onStop}
        >
          <Text className="text-white font-semibold" style={{ fontFamily: 'Inter' }}>Stop</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text className="text-gray-300 mb-2" style={{ fontFamily: 'Inter' }}>
          Current: {getSideDisplayText(currentSide)}
        </Text>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="flex-1 py-2 px-3 rounded-lg items-center"
            style={getSideButtonStyle('left')}
            onPress={() => onSwitchSide('left')}
          >
            <Text className="text-white" style={{ fontFamily: 'Inter' }}>Left</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 py-2 px-3 rounded-lg items-center"
            style={getSideButtonStyle('right')}
            onPress={() => onSwitchSide('right')}
          >
            <Text className="text-white" style={{ fontFamily: 'Inter' }}>Right</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}