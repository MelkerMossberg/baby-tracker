import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { getBabyById } from '../lib/api/baby';
import type { BabyWithRole } from '../lib/supabase';

interface BabySettingsScreenProps {
  visible: boolean;
  babyId: string;
  onClose: () => void;
}

export default function BabySettingsScreen({ visible, babyId, onClose }: BabySettingsScreenProps) {
  const [baby, setBaby] = useState<BabyWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBaby();
  }, [babyId]);

  const loadBaby = async () => {
    try {
      setLoading(true);
      setError(null);
      const babyData = await getBabyById(babyId);
      setBaby(babyData);
    } catch (err) {
      console.error('Error loading baby:', err);
      setError(err instanceof Error ? err.message : 'Failed to load baby');
    } finally {
      setLoading(false);
    }
  };

  const formatBirthdate = (birthdate: string) => {
    try {
      const date = new Date(birthdate);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return birthdate;
    }
  };

  if (loading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-6 pt-12">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-lg text-white">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
              Baby Settings
            </Text>
            <View className="w-12" />
          </View>
          
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-gray-400 mt-4" style={{ fontFamily: 'Inter' }}>
              Loading baby information...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (error || !baby) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-6 pt-12">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-lg text-white">‹ Back</Text>
            </TouchableOpacity>
            <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
              Baby Settings
            </Text>
            <View className="w-12" />
          </View>
          
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-red-400 text-center mb-4" style={{ fontFamily: 'Inter' }}>
              {error || 'Baby not found'}
            </Text>
            <TouchableOpacity
              className="bg-gray-800 rounded-xl px-6 py-3"
              onPress={loadBaby}
            >
              <Text className="text-white" style={{ fontFamily: 'Inter' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pt-12">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg text-white">‹ Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            {baby.name}
          </Text>
          <View className="w-12" />
        </View>

      <ScrollView className="flex-1 px-6">
        {/* Baby Information */}
        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Baby Information
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Name
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {baby.name}
            </Text>
          </View>

          <View className="bg-gray-900 rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Birthdate
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {formatBirthdate(baby.birthdate)}
            </Text>
          </View>

          <View className="bg-gray-900 rounded-2xl p-4">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Your Role
            </Text>
            <View className={`self-start px-3 py-1 rounded-full ${
              baby.role === 'admin' ? 'bg-primary/20' : 'bg-gray-700'
            }`}>
              <Text className={`text-sm font-medium ${
                baby.role === 'admin' ? 'text-white' : 'text-gray-300'
              }`} style={{ fontFamily: 'Inter' }}>
                {baby.role === 'admin' ? 'Admin' : 'Guest'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions - only show for admins */}
        {baby.role === 'admin' && (
          <View className="mb-6">
            <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
              Manage Baby
            </Text>
            
            <TouchableOpacity
              className="bg-gray-900 rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                  Edit Baby Information
                </Text>
                <Text className="text-gray-400 text-lg">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-900 rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
                  Share Baby
                </Text>
                <Text className="text-gray-400 text-lg">›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-900 rounded-2xl p-4"
              activeOpacity={0.7}
            >
              <Text className="text-red-400 text-lg text-center" style={{ fontFamily: 'Inter' }}>
                Remove Baby
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Coming Soon */}
        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Coming Soon
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-6 items-center">
            <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
              Baby management features will be available in a future update.
            </Text>
          </View>
        </View>
      </ScrollView>
      </View>
    </Modal>
  );
}