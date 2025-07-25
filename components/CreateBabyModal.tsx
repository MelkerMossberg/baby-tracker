import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { unifiedDatabaseService } from '../services/unifiedDatabaseService';
import { createBabyProfile } from '../lib/api/baby';

interface CreateBabyModalProps {
  visible: boolean;
  onClose: () => void;
  onBabyCreated: () => void;
}

export default function CreateBabyModal({ visible, onClose, onBabyCreated }: CreateBabyModalProps) {
  const [babyName, setBabyName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!babyName.trim()) {
      Alert.alert('Error', 'Please enter a baby name');
      return;
    }

    try {
      setLoading(true);

      // Use the Supabase API directly if available
      if (unifiedDatabaseService.isUsingSupabase()) {
        const birthdateString = birthdate.toISOString().split('T')[0]; // YYYY-MM-DD format
        await createBabyProfile(babyName.trim(), birthdateString);
      } else {
        // Fall back to unified service for mock database
        const baby = {
          id: `baby-${Date.now()}`,
          name: babyName.trim(),
          birthdate: birthdate,
          shareCode: `${babyName.toUpperCase()}${new Date().getFullYear()}`
        };
        await unifiedDatabaseService.createBabyProfile(baby);
      }

      resetForm();
      onClose();
      onBabyCreated();
      Alert.alert('Success', `${babyName} has been added to your baby tracker!`);
    } catch (error) {
      console.error('Error creating baby:', error);
      Alert.alert('Error', `Failed to create baby profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBabyName('');
    setBirthdate(new Date());
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
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
        <View className="bg-bg-main rounded-t-3xl p-6">
          <Text className="text-xl font-serif text-text-main mb-6 text-center" style={{ fontFamily: 'DM Serif Display' }}>
            Add Your Baby
          </Text>

          {/* Baby Name Input */}
          <Text className="text-lg text-text-main mb-2" style={{ fontFamily: 'Inter' }}>
            Baby's Name
          </Text>
          <TextInput
            className="bg-card-main text-text-main p-4 rounded-xl mb-4"
            style={{ fontFamily: 'Inter' }}
            placeholder="Enter baby's name"
            placeholderTextColor="#6B7280"
            value={babyName}
            onChangeText={setBabyName}
            maxLength={50}
          />

          {/* Birthdate Input */}
          <Text className="text-lg text-text-main mb-2" style={{ fontFamily: 'Inter' }}>
            Birthdate
          </Text>
          <TouchableOpacity
            className="bg-card-main p-4 rounded-xl mb-6"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-text-main" style={{ fontFamily: 'Inter' }}>
              {birthdate.toLocaleDateString('en-GB', { 
                day: '2-digit',
                month: 'long', 
                year: 'numeric'
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          )}

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center border border-text-muted"
              onPress={handleCancel}
              disabled={loading}
            >
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-1 py-4 rounded-xl items-center bg-primary"
              onPress={handleSave}
              disabled={loading || !babyName.trim()}
            >
              <Text className="text-text-main text-lg" style={{ fontFamily: 'Inter' }}>
                {loading ? 'Creating...' : 'Create Baby'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}