import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface SignUpScreenProps {
  onSwitchToSignIn: () => void;
}

export default function SignUpScreen({ onSwitchToSignIn }: SignUpScreenProps) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUp(email.trim(), password, name.trim());
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account before signing in.',
        [{ text: 'OK', onPress: onSwitchToSignIn }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8 py-8">
          <View className="mb-12">
            <Text 
              className="text-4xl text-white text-center font-serif" 
              style={{ fontFamily: 'DM Serif Display' }}
            >
              Baby Tracker
            </Text>
            <Text 
              className="text-gray-400 text-lg text-center mt-2" 
              style={{ fontFamily: 'Inter' }}
            >
              Create your account
            </Text>
          </View>

          <View className="space-y-5">
            <View>
              <Text 
                className="text-white text-base mb-3 font-medium" 
                style={{ fontFamily: 'Inter' }}
              >
                Full Name
              </Text>
              <TextInput
                className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base border-0"
                style={{ fontFamily: 'Inter' }}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View>
              <Text 
                className="text-white text-base mb-3 font-medium" 
                style={{ fontFamily: 'Inter' }}
              >
                Email
              </Text>
              <TextInput
                className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base border-0"
                style={{ fontFamily: 'Inter' }}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text 
                className="text-white text-base mb-3 font-medium" 
                style={{ fontFamily: 'Inter' }}
              >
                Password
              </Text>
              <TextInput
                className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base border-0"
                style={{ fontFamily: 'Inter' }}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View>
              <Text 
                className="text-white text-base mb-3 font-medium" 
                style={{ fontFamily: 'Inter' }}
              >
                Confirm Password
              </Text>
              <TextInput
                className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base border-0"
                style={{ fontFamily: 'Inter' }}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error && (
              <View className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                <Text 
                  className="text-red-400 text-sm" 
                  style={{ fontFamily: 'Inter' }}
                >
                  {error}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-purple-600 rounded-xl py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text 
                className="text-white text-lg font-semibold" 
                style={{ fontFamily: 'Inter' }}
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text 
                className="text-gray-400 text-base" 
                style={{ fontFamily: 'Inter' }}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onSwitchToSignIn} disabled={isLoading}>
                <Text 
                  className="text-purple-400 text-base font-semibold" 
                  style={{ fontFamily: 'Inter' }}
                >
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}