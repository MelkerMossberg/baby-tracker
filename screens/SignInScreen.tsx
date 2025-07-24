import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface SignInScreenProps {
  onSwitchToSignUp: () => void;
}

export default function SignInScreen({ onSwitchToSignUp }: SignInScreenProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-main dark:bg-white"
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-12">
          <Text 
            className="text-4xl font-serif text-text-main dark:text-black text-center mb-2" 
            style={{ fontFamily: 'DM Serif Display' }}
          >
            Baby Tracker
          </Text>
          <Text 
            className="text-lg text-text-muted dark:text-gray-600 text-center" 
            style={{ fontFamily: 'Inter' }}
          >
            Welcome back
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text 
              className="text-text-main dark:text-black text-base mb-2 font-medium" 
              style={{ fontFamily: 'Inter' }}
            >
              Email
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-400 rounded-xl px-4 py-3 text-text-main dark:text-black text-base"
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
              className="text-text-main dark:text-black text-base mb-2 font-medium" 
              style={{ fontFamily: 'Inter' }}
            >
              Password
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-100 border border-gray-300 dark:border-gray-400 rounded-xl px-4 py-3 text-text-main dark:text-black text-base"
              style={{ fontFamily: 'Inter' }}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {error && (
            <View className="bg-red-50 dark:bg-red-100 border border-red-200 dark:border-red-300 rounded-xl p-3">
              <Text 
                className="text-red-700 dark:text-red-800 text-sm" 
                style={{ fontFamily: 'Inter' }}
              >
                {error}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`bg-blue-600 dark:bg-blue-700 rounded-xl py-4 items-center ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text 
              className="text-white text-lg font-semibold" 
              style={{ fontFamily: 'Inter' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-6">
            <Text 
              className="text-text-muted dark:text-gray-600 text-base" 
              style={{ fontFamily: 'Inter' }}
            >
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onSwitchToSignUp} disabled={isLoading}>
              <Text 
                className="text-blue-600 dark:text-blue-700 text-base font-semibold" 
                style={{ fontFamily: 'Inter' }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}