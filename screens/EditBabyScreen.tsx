import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateBabyProfile } from '../lib/api/baby';
import type { BabyWithRole } from '../lib/supabase';

interface EditBabyScreenProps {
  baby: BabyWithRole;
  onSave: (updatedBaby: { name: string; birthdate: string }) => void;
  onCancel: () => void;
}

export default function EditBabyScreen({ baby, onSave, onCancel }: EditBabyScreenProps) {
  const [name, setName] = useState(baby.name);
  const [birthdate, setBirthdate] = useState(new Date(baby.birthdate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Validate inputs
  const validateInputs = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Baby name is required');
      isValid = false;
    } else if (name.trim().length < 1) {
      setNameError('Baby name must be at least 1 character');
      isValid = false;
    } else if (name.trim().length > 50) {
      setNameError('Baby name must be less than 50 characters');
      isValid = false;
    } else {
      setNameError(null);
    }

    // Validate birthdate
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (birthdate > today) {
      setDateError('Birthdate cannot be in the future');
      isValid = false;
    } else {
      // Check if birthdate is too far in the past (let's say 200 years)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 200);
      
      if (birthdate < minDate) {
        setDateError('Please enter a valid birthdate');
        isValid = false;
      } else {
        setDateError(null);
      }
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setLoading(true);

      // Format birthdate as YYYY-MM-DD
      const formattedBirthdate = birthdate.toISOString().split('T')[0];
      
      // Call the API to update the baby
      await updateBabyProfile(baby.id, {
        name: name.trim(),
        birthdate: formattedBirthdate
      });

      // Call the success callback
      onSave({
        name: name.trim(),
        birthdate: formattedBirthdate
      });

    } catch (error) {
      console.error('Error updating baby:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update baby information. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
      // Clear any existing date error when user selects a new date
      if (dateError) {
        setDateError(null);
      }
    }
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const hasChanges = () => {
    const formattedOriginalDate = new Date(baby.birthdate).toISOString().split('T')[0];
    const formattedCurrentDate = birthdate.toISOString().split('T')[0];
    
    return name.trim() !== baby.name || formattedCurrentDate !== formattedOriginalDate;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pt-12">
        <TouchableOpacity onPress={onCancel} disabled={loading}>
          <Text className={`text-lg ${loading ? 'text-gray-500' : 'text-white'}`}>
            ‹ Back
          </Text>
        </TouchableOpacity>
        <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
          Edit Baby
        </Text>
        <View className="w-12" />
      </View>

      <View className="flex-1 px-6">
        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-lg text-white mb-2 font-medium" style={{ fontFamily: 'Inter' }}>
            Baby's Name
          </Text>
          <TextInput
            className={`bg-gray-900 text-white p-4 rounded-xl text-lg ${
              nameError ? 'border border-red-500' : ''
            }`}
            style={{ fontFamily: 'Inter' }}
            placeholder="Enter baby's name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={(text) => {
              setName(text);
              // Clear error when user starts typing
              if (nameError) {
                setNameError(null);
              }
            }}
            maxLength={50}
            editable={!loading}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {nameError && (
            <Text className="text-red-400 text-sm mt-2" style={{ fontFamily: 'Inter' }}>
              {nameError}
            </Text>
          )}
        </View>

        {/* Birthdate Input */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-2 font-medium" style={{ fontFamily: 'Inter' }}>
            Birthdate
          </Text>
          <TouchableOpacity
            className={`bg-gray-900 p-4 rounded-xl ${
              dateError ? 'border border-red-500' : ''
            }`}
            onPress={() => !loading && setShowDatePicker(true)}
            disabled={loading}
          >
            <Text className={`text-lg ${loading ? 'text-gray-500' : 'text-white'}`} style={{ fontFamily: 'Inter' }}>
              {formatDisplayDate(birthdate)}
            </Text>
          </TouchableOpacity>
          {dateError && (
            <Text className="text-red-400 text-sm mt-2" style={{ fontFamily: 'Inter' }}>
              {dateError}
            </Text>
          )}
        </View>

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

        {/* Save Button */}
        <View className="mt-auto pb-6">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              loading || !hasChanges() 
                ? 'bg-gray-700' 
                : 'bg-primary'
            }`}
            onPress={handleSave}
            disabled={loading || !hasChanges()}
            activeOpacity={0.8}
          >
            <Text 
              className={`text-lg font-medium ${
                loading || !hasChanges() 
                  ? 'text-gray-400' 
                  : 'text-white'
              }`} 
              style={{ fontFamily: 'Inter' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
          
          {!hasChanges() && (
            <Text className="text-gray-400 text-sm text-center mt-2" style={{ fontFamily: 'Inter' }}>
              No changes to save
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}