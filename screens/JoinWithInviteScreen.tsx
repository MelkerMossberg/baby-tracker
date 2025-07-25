import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { redeemInviteCode, validateInviteCode } from '../lib/api/invites';

interface JoinWithInviteScreenProps {
  onJoinSuccess: (babyId: string) => void;
  onCancel: () => void;
}

export default function JoinWithInviteScreen({ onJoinSuccess, onCancel }: JoinWithInviteScreenProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<{
    babyName: string;
    role: string;
  } | null>(null);

  // Validate code as user types (debounced)
  const validateCodePreview = async (code: string) => {
    if (code.length < 3) {
      setPreviewInfo(null);
      setCodeError(null);
      return;
    }

    try {
      setValidating(true);
      setCodeError(null);
      
      const validation = await validateInviteCode(code.trim().toUpperCase());
      
      if (validation.valid && validation.baby) {
        setPreviewInfo({
          babyName: validation.baby.name,
          role: validation.role === 'admin' ? 'Admin' : 'Guest'
        });
        setCodeError(null);
      } else {
        setPreviewInfo(null);
        setCodeError(validation.error || 'Invalid invite code');
      }
    } catch (error) {
      setPreviewInfo(null);
      setCodeError('Unable to validate code');
    } finally {
      setValidating(false);
    }
  };

  // Debounce validation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteCode.trim()) {
        validateCodePreview(inviteCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inviteCode]);

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      setCodeError('Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      setCodeError(null);

      // Redeem the invite code
      const babyId = await redeemInviteCode(code);
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Welcome to the family! 👶',
        text2: previewInfo ? `You've joined ${previewInfo.babyName}'s tracking` : 'Successfully joined baby tracking',
        visibilityTime: 4000,
      });

      // Call success callback with baby ID
      onJoinSuccess(babyId);

    } catch (error) {
      console.error('Error redeeming invite code:', error);
      
      let errorMessage = 'Failed to join with invite code';
      if (error instanceof Error) {
        if (error.message.includes('already been used')) {
          errorMessage = 'This invite code has already been used';
        } else if (error.message.includes('expired')) {
          errorMessage = 'This invite code has expired';
        } else if (error.message.includes('Invalid')) {
          errorMessage = 'Invalid invite code';
        } else {
          errorMessage = error.message;
        }
      }
      
      setCodeError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatInviteCode = (text: string) => {
    // Convert to uppercase and limit to reasonable length
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleaned.slice(0, 12); // Reasonable limit for invite codes
  };

  const handleCodeChange = (text: string) => {
    const formatted = formatInviteCode(text);
    setInviteCode(formatted);
    
    // Clear preview and errors when user starts typing
    if (text !== inviteCode) {
      setPreviewInfo(null);
      setCodeError(null);
    }
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
          Join with Invite
        </Text>
        <View className="w-12" />
      </View>

      <View className="flex-1 px-6">
        {/* Description */}
        <View className="mb-8">
          <Text className="text-lg text-white mb-3 font-medium" style={{ fontFamily: 'Inter' }}>
            Co-parenting made simple 👨‍👩‍👧‍👦
          </Text>
          <Text className="text-gray-400 text-base leading-6" style={{ fontFamily: 'Inter' }}>
            Enter the invite code shared by your partner or family member to start tracking your baby together. 
            Your data stays private and secure.
          </Text>
        </View>

        {/* Invite Code Input */}
        <View className="mb-6">
          <Text className="text-lg text-white mb-3 font-medium" style={{ fontFamily: 'Inter' }}>
            Invite Code
          </Text>
          <TextInput
            className={`bg-gray-900 text-white p-4 rounded-xl text-lg font-mono text-center tracking-wider ${
              codeError ? 'border border-red-500' : previewInfo ? 'border border-green-500' : ''
            }`}
            placeholder="Enter invite code"
            placeholderTextColor="#6B7280"
            value={inviteCode}
            onChangeText={handleCodeChange}
            editable={!loading}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleJoin}
          />
          
          {/* Validation states */}
          {validating && (
            <Text className="text-primary text-sm mt-2 text-center" style={{ fontFamily: 'Inter' }}>
              Checking code...
            </Text>
          )}
          
          {previewInfo && !validating && (
            <View className="mt-3 bg-green-900 rounded-xl p-4">
              <Text className="text-green-300 text-sm font-medium mb-1" style={{ fontFamily: 'Inter' }}>
                ✓ Valid invite code
              </Text>
              <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>
                You'll join <Text className="font-semibold">{previewInfo.babyName}'s</Text> tracking as a{' '}
                <Text className="font-semibold">{previewInfo.role}</Text>
              </Text>
            </View>
          )}
          
          {codeError && !validating && (
            <Text className="text-red-400 text-sm mt-2 text-center" style={{ fontFamily: 'Inter' }}>
              {codeError}
            </Text>
          )}
        </View>

        {/* Privacy Note */}
        <View className="mb-8">
          <View className="bg-gray-900 rounded-xl p-4">
            <Text className="text-gray-300 text-sm font-medium mb-2" style={{ fontFamily: 'Inter' }}>
              🔒 Privacy & Security
            </Text>
            <Text className="text-gray-400 text-sm leading-5" style={{ fontFamily: 'Inter' }}>
              • Your baby's data is only shared with invited family members{'\n'}
              • You can leave at any time{'\n'}
              • All data is encrypted and secure
            </Text>
          </View>
        </View>

        {/* Join Button */}
        <View className="mt-auto pb-6">
          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${
              loading || !inviteCode.trim() || codeError
                ? 'bg-gray-700' 
                : 'bg-primary'
            }`}
            onPress={handleJoin}
            disabled={loading || !inviteCode.trim() || !!codeError}
            activeOpacity={0.8}
          >
            <Text 
              className={`text-lg font-medium ${
                loading || !inviteCode.trim() || codeError
                  ? 'text-gray-400' 
                  : 'text-white'
              }`} 
              style={{ fontFamily: 'Inter' }}
            >
              {loading ? 'Joining...' : '🔑 Join Baby Tracking'}
            </Text>
          </TouchableOpacity>
          
          {(!inviteCode.trim() && !loading) && (
            <Text className="text-gray-400 text-sm text-center mt-2" style={{ fontFamily: 'Inter' }}>
              Enter an invite code to continue
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}