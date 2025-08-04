import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { NursingSide } from '../../types';

interface PumpingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (notes: string, duration?: number, side?: 'left' | 'right' | 'both', milliliters?: number) => void;
}

export default function PumpingModal({ visible, onClose, onSave }: PumpingModalProps) {
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [milliliters, setMilliliters] = useState('');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | 'both'>('both');

  const handleSave = () => {
    const durationNumber = duration ? parseInt(duration) * 60 : undefined;
    const millilitersNumber = milliliters ? parseInt(milliliters) : undefined;
    onSave(notes, durationNumber, selectedSide, millilitersNumber);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNotes('');
    setDuration('');
    setMilliliters('');
    setSelectedSide('both');
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
            Pumping Session
          </Text>
          
          {/* Side Selection */}
          <Text className="text-lg text-text-main mb-3" style={{ fontFamily: 'Inter' }}>
            Side
          </Text>
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedSide === 'left' ? 'bg-primary' : 'bg-card-main border border-text-muted'
              }`}
              onPress={() => setSelectedSide('left')}
            >
              <Text className="text-text-main font-medium" style={{ fontFamily: 'Inter' }}>
                Left
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedSide === 'both' ? 'bg-primary' : 'bg-card-main border border-text-muted'
              }`}
              onPress={() => setSelectedSide('both')}
            >
              <Text className="text-text-main font-medium" style={{ fontFamily: 'Inter' }}>
                Both
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                selectedSide === 'right' ? 'bg-primary' : 'bg-card-main border border-text-muted'
              }`}
              onPress={() => setSelectedSide('right')}
            >
              <Text className="text-text-main font-medium" style={{ fontFamily: 'Inter' }}>
                Right
              </Text>
            </TouchableOpacity>
          </View>

          {/* Milliliters Input */}
          <Text className="text-lg text-text-main mb-2" style={{ fontFamily: 'Inter' }}>
            Volume (ml)
          </Text>
          <TextInput
            className="bg-card-main text-text-main p-4 rounded-xl mb-4"
            style={{ fontFamily: 'Inter' }}
            placeholder="Enter volume in milliliters"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={milliliters}
            onChangeText={setMilliliters}
          />

          {/* Duration Input (Optional) */}
          <Text className="text-lg text-text-main mb-2" style={{ fontFamily: 'Inter' }}>
            Duration (minutes) - Optional
          </Text>
          <TextInput
            className="bg-card-main text-text-main p-4 rounded-xl mb-4"
            style={{ fontFamily: 'Inter' }}
            placeholder="Enter duration in minutes (optional)"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          {/* Notes Input */}
          <Text className="text-lg text-text-main mb-2" style={{ fontFamily: 'Inter' }}>
            Notes (optional)
          </Text>
          <TextInput
            className="bg-card-main text-text-main p-4 rounded-xl mb-6"
            style={{ fontFamily: 'Inter', minHeight: 80 }}
            placeholder="Add any notes..."
            placeholderTextColor="#6B7280"
            multiline
            value={notes}
            onChangeText={setNotes}
          />

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