import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { getBabiesForCurrentUser } from '../lib/api/baby';
import { useAuth } from '../hooks/useAuth';
import type { BabyWithRole } from '../lib/supabase';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToAccountSettings: () => void;
  onNavigateToBabySettings: (babyId: string) => void;
}

export default function SettingsScreen({ 
  visible,
  onClose, 
  onNavigateToAccountSettings, 
  onNavigateToBabySettings 
}: SettingsScreenProps) {
  const { user, signOut } = useAuth();
  const [babies, setBabies] = useState<BabyWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBabies();
  }, []);

  const loadBabies = async () => {
    try {
      setLoading(true);
      setError(null);
      const babiesData = await getBabiesForCurrentUser();
      setBabies(babiesData);
    } catch (err) {
      console.error('Error loading babies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load babies');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      `Sign out of ${user?.name || 'your account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              onClose();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const getBabyStatusText = (baby: BabyWithRole) => {
    // Note: We'd need additional API to check if baby is shared with multiple users
    // For now, we just show the role
    return baby.role === 'admin' ? 'Admin' : 'Guest';
  };

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
          <Text className="text-2xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
            Settings
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg text-white">Done</Text>
          </TouchableOpacity>
        </View>

      <ScrollView className="flex-1 px-6">
        {/* Account Settings Section */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Account Settings
          </Text>
          
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl p-4 mb-3"
            onPress={onNavigateToAccountSettings}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                  Your Account
                </Text>
                <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Inter' }}>
                  {user?.email || 'Manage your account settings'}
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl p-4"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text className="text-red-400 text-lg font-medium text-center" style={{ fontFamily: 'Inter' }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Babies Section */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Your Babies
          </Text>

          {loading ? (
            <View className="bg-gray-900 rounded-2xl p-8 items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-gray-400 mt-2" style={{ fontFamily: 'Inter' }}>
                Loading babies...
              </Text>
            </View>
          ) : error ? (
            <View className="bg-gray-900 rounded-2xl p-4">
              <Text className="text-red-400 text-center" style={{ fontFamily: 'Inter' }}>
                {error}
              </Text>
              <TouchableOpacity
                className="mt-3 bg-gray-800 rounded-xl p-3"
                onPress={loadBabies}
              >
                <Text className="text-white text-center" style={{ fontFamily: 'Inter' }}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : babies.length === 0 ? (
            <View className="bg-gray-900 rounded-2xl p-8 items-center">
              <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
                No babies found
              </Text>
            </View>
          ) : (
            babies.map((baby, index) => (
              <TouchableOpacity
                key={baby.id}
                className={`bg-gray-900 rounded-2xl p-4 ${index < babies.length - 1 ? 'mb-3' : ''}`}
                onPress={() => onNavigateToBabySettings(baby.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                      {baby.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className={`px-2 py-1 rounded-full mr-2 ${
                        baby.role === 'admin' ? 'bg-primary/20' : 'bg-gray-700'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          baby.role === 'admin' ? 'text-white' : 'text-gray-300'
                        }`} style={{ fontFamily: 'Inter' }}>
                          {getBabyStatusText(baby)}
                        </Text>
                      </View>
                      {/* For now, we don't have info about shared status, but placeholder for future */}
                      {/* {isShared && (
                        <View className="px-2 py-1 rounded-full bg-purple-900">
                          <Text className="text-xs font-medium text-purple-300" style={{ fontFamily: 'Inter' }}>
                            Shared
                          </Text>
                        </View>
                      )} */}
                    </View>
                  </View>
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      </View>
    </Modal>
  );
}