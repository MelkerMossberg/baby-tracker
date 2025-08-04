import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { createInviteCode, getActiveInviteCodesForBaby } from '../lib/api/invites';
import type { InviteCode } from '../lib/supabase';

interface ShareBabyScreenProps {
  baby: {
    id: string;
    name: string;
  };
  onBack: () => void;
}

export default function ShareBabyScreen({ baby, onBack }: ShareBabyScreenProps) {
  const [activeInvite, setActiveInvite] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveInvites();
  }, []);

  const loadActiveInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const invites = await getActiveInviteCodesForBaby(baby.id);
      
      // Find the most recent active invite
      const recentInvite = invites.length > 0 ? invites[0] : null;
      setActiveInvite(recentInvite);
    } catch (err) {
      console.error('Error loading active invites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      // Create new invite code (24 hour expiry, guest role)
      const newCode = await createInviteCode(baby.id, 'guest', 1);
      
      // Refresh the active invites to show the new code
      await loadActiveInvites();
      
      Toast.show({
        type: 'success',
        text1: 'Invite code created! 🎉',
        text2: 'Share this code with your family member',
        visibilityTime: 3000,
      });
    } catch (err) {
      console.error('Error generating invite code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invite code');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Toast.show({
        type: 'success',
        text1: 'Copied to clipboard! 📋',
        text2: 'Share this code with your family member',
        visibilityTime: 2000,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to copy code to clipboard');
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursLeft <= 1) {
      return 'Expires in less than 1 hour';
    } else if (hoursLeft <= 24) {
      return `Expires in ${hoursLeft} hours`;
    } else {
      return 'Expires in 24 hours';
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pt-12">
        <TouchableOpacity onPress={onBack} disabled={generating}>
          <Text className={`text-lg ${generating ? 'text-gray-500' : 'text-white'}`}>
            ‹ Back
          </Text>
        </TouchableOpacity>
        <Text className="text-xl font-serif text-white" style={{ fontFamily: 'DM Serif Display' }}>
          Share Baby
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Title Section */}
        <View className="mb-8">
          <Text className="text-2xl text-white mb-3 font-medium" style={{ fontFamily: 'Inter' }}>
            Share access to {baby.name} 👶
          </Text>
          <Text className="text-gray-400 text-base leading-6" style={{ fontFamily: 'Inter' }}>
            This code lets someone join as a guest and help track activities. Perfect for partners, grandparents, or caregivers.
          </Text>
        </View>

        {loading ? (
          <View className="bg-gray-900 rounded-2xl p-8 items-center">
            <Text className="text-gray-400" style={{ fontFamily: 'Inter' }}>
              Loading invite codes...
            </Text>
          </View>
        ) : error ? (
          <View className="bg-gray-900 rounded-2xl p-6">
            <Text className="text-red-400 text-center mb-4" style={{ fontFamily: 'Inter' }}>
              {error}
            </Text>
            <TouchableOpacity
              className="bg-gray-800 rounded-xl p-3"
              onPress={loadActiveInvites}
            >
              <Text className="text-white text-center" style={{ fontFamily: 'Inter' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : activeInvite ? (
          <>
            {/* Active Invite Code */}
            <View className="mb-6">
              <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
                Current Invite Code
              </Text>
              
              <View className="bg-gray-900 rounded-2xl p-6">
                {/* Code Display */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4">
                  <Text className="text-center text-gray-400 text-sm mb-2" style={{ fontFamily: 'Inter' }}>
                    Invite Code
                  </Text>
                  <Text className="text-center text-white text-2xl font-mono tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>
                    {activeInvite.code}
                  </Text>
                </View>

                {/* Copy Button */}
                <TouchableOpacity
                  className="bg-primary rounded-xl py-4 mb-4"
                  onPress={() => copyToClipboard(activeInvite.code)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-lg font-medium text-center" style={{ fontFamily: 'Inter' }}>
                    Copy Code
                  </Text>
                </TouchableOpacity>

                {/* Expiry Info */}
                <View className="bg-yellow-900 rounded-xl p-3">
                  <Text className="text-yellow-300 text-sm text-center" style={{ fontFamily: 'Inter' }}>
                    {formatExpiryTime(activeInvite.expires_at)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Generate New Code */}
            <View className="mb-6">
              <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
                Need a New Code?
              </Text>
              
              <TouchableOpacity
                className={`rounded-2xl p-4 ${generating ? 'bg-gray-700' : 'bg-gray-900'}`}
                onPress={generateNewCode}
                disabled={generating}
                activeOpacity={0.7}
              >
                <Text className={`text-center text-lg font-medium ${generating ? 'text-gray-400' : 'text-white'}`} style={{ fontFamily: 'Inter' }}>
                  {generating ? 'Generating...' : '🔄 Generate New Code'}
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1" style={{ fontFamily: 'Inter' }}>
                  This will replace the current code
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* No Active Invite */}
            <View className="mb-6">
              <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
                Create Invite Code
              </Text>
              
              <View className="bg-gray-900 rounded-2xl p-6 mb-6">
                <Text className="text-gray-300 text-center mb-6" style={{ fontFamily: 'Inter' }}>
                  No active invite code found. Generate one to share access with family members.
                </Text>
                
                <TouchableOpacity
                  className={`rounded-xl py-4 ${generating ? 'bg-gray-700' : 'bg-primary'}`}
                  onPress={generateNewCode}
                  disabled={generating}
                  activeOpacity={0.8}
                >
                  <Text className={`text-center text-lg font-medium ${generating ? 'text-gray-400' : 'text-white'}`} style={{ fontFamily: 'Inter' }}>
                    {generating ? 'Generating...' : '✨ Generate Invite Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* How it Works */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-4 font-medium" style={{ fontFamily: 'Inter' }}>
            How it Works
          </Text>
          
          <View className="bg-gray-900 rounded-2xl p-6">
            <Text className="text-gray-300 text-sm leading-6" style={{ fontFamily: 'Inter' }}>
              1. Share the invite code with your family member{'\n'}
              2. They enter it in the app's "Join with invite code" option{'\n'}
              3. They'll join as a guest and can help track {baby.name}'s activities{'\n'}
              4. Code expires in 24 hours or after first use
            </Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View className="mb-8">
          <View className="bg-green-900 rounded-2xl p-4">
            <Text className="text-green-300 text-sm font-medium mb-2" style={{ fontFamily: 'Inter' }}>
              🔒 Privacy & Security
            </Text>
            <Text className="text-green-200 text-sm leading-5" style={{ fontFamily: 'Inter' }}>
              • Guest users can only view and add activities{'\n'}
              • They cannot edit baby information or manage sharing{'\n'}
              • All data remains secure and encrypted
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}