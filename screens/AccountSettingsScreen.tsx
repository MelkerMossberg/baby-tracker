import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface AccountSettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function AccountSettingsScreen({ visible, onClose }: AccountSettingsScreenProps) {
  const { user } = useAuth();

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
            Account Settings
          </Text>
          <View className="w-12" />
        </View>

      <ScrollView className="flex-1 px-6">
        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Profile Information
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-4 mb-3">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Name
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {user?.name || 'Not set'}
            </Text>
          </View>

          <View className="bg-gray-900 rounded-2xl p-4">
            <Text className="text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter' }}>
              Email
            </Text>
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter' }}>
              {user?.email || 'Not available'}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            Coming Soon
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-6 items-center">
            <Text className="text-gray-400 text-center" style={{ fontFamily: 'Inter' }}>
              Account management features will be available in a future update.
            </Text>
          </View>
        </View>
      </ScrollView>
      </View>
    </Modal>
  );
}