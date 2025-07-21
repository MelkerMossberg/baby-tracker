import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NursingSide } from '../types';

interface NursingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (side: NursingSide, notes: string, durationSeconds: number) => void;
  currentSide: NursingSide;
  elapsedTime: string;
  initialDurationSeconds: number;
}

export default function NursingModal({ visible, onClose, onSave, currentSide, elapsedTime, initialDurationSeconds }: NursingModalProps) {
  const [selectedSide, setSelectedSide] = useState<NursingSide>(currentSide);
  const [notes, setNotes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number>(initialDurationSeconds);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Reset to current side and duration when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedSide(currentSide);
      setDurationSeconds(initialDurationSeconds);
    }
  }, [visible, currentSide, initialDurationSeconds]);

  // Update picker values when duration changes (but only from external source)
  React.useEffect(() => {
    if (visible) {
      const h = Math.floor(initialDurationSeconds / 3600);
      const m = Math.floor((initialDurationSeconds % 3600) / 60);
      const s = initialDurationSeconds % 60;
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }
  }, [visible, initialDurationSeconds]);

  // Update duration when picker values change
  React.useEffect(() => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds !== durationSeconds) {
      setDurationSeconds(totalSeconds);
    }
  }, [hours, minutes, seconds]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${remainingSeconds}s`;
  };

  const handleSave = () => {
    onSave(selectedSide, notes, durationSeconds);
    setNotes('');
    onClose();
  };

  const handleDurationTap = () => {
    setShowTimePicker(!showTimePicker);
  };

  // Generate arrays for picker options
  const hourOptions = Array.from({ length: 6 }, (_, i) => i); // 0-5 hours
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes
  const secondOptions = Array.from({ length: 60 }, (_, i) => i); // 0-59 seconds

  const closePicker = () => {
    setShowTimePicker(false);
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
          
          <TouchableOpacity 
            className="bg-[#171021] p-4 rounded-xl mb-4"
            onPress={handleDurationTap}
          >
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Duration (tap to edit)
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {formatDuration(durationSeconds)}
            </Text>
          </TouchableOpacity>

          {/* Time Picker */}
          {showTimePicker && (
            <View className="bg-[#171021] rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                  Set Duration
                </Text>
                <TouchableOpacity onPress={closePicker}>
                  <Text className="text-green-400 text-lg" style={{ fontFamily: 'Inter' }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Three-wheel picker: Hours, Minutes, Seconds */}
              <View className="flex-row items-center justify-center">
                {/* Hours Picker */}
                <View className="flex-1 items-center">
                  <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                    Hours
                  </Text>
                  <Picker
                    selectedValue={hours}
                    onValueChange={(value) => setHours(value)}
                    style={{ height: 150, width: '100%' }}
                    itemStyle={{ color: '#FFFFFF', fontSize: 20, height: 150 }}
                  >
                    {hourOptions.map((hour) => (
                      <Picker.Item key={hour} label={hour.toString()} value={hour} />
                    ))}
                  </Picker>
                </View>

                {/* Minutes Picker */}
                <View className="flex-1 items-center">
                  <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                    Minutes
                  </Text>
                  <Picker
                    selectedValue={minutes}
                    onValueChange={(value) => setMinutes(value)}
                    style={{ height: 150, width: '100%' }}
                    itemStyle={{ color: '#FFFFFF', fontSize: 20, height: 150 }}
                  >
                    {minuteOptions.map((minute) => (
                      <Picker.Item key={minute} label={minute.toString()} value={minute} />
                    ))}
                  </Picker>
                </View>

                {/* Seconds Picker */}
                <View className="flex-1 items-center">
                  <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                    Seconds
                  </Text>
                  <Picker
                    selectedValue={seconds}
                    onValueChange={(value) => setSeconds(value)}
                    style={{ height: 150, width: '100%' }}
                    itemStyle={{ color: '#FFFFFF', fontSize: 20, height: 150 }}
                  >
                    {secondOptions.map((second) => (
                      <Picker.Item key={second} label={second.toString()} value={second} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          )}

          <Text className="text-lg text-white mb-4" style={{ fontFamily: 'Inter' }}>
            Which side?
          </Text>
          
          <View className="flex-row space-x-4 mb-6">
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-xl items-center"
              style={getSideButtonStyle('left')}
              onPress={() => setSelectedSide('left')}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>Left</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-3 px-4 rounded-xl items-center"
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