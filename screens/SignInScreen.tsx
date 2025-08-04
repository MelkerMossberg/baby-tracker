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
      className="flex-1 bg-black"
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-16">
          <Text 
            className="text-4xl text-white text-center font-serif" 
            style={{ fontFamily: 'DM Serif Display' }}
          >
            Baby Tracker
          </Text>
        </View>

        <View className="space-y-6">
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
              placeholder="Enter your password"
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
            className={`bg-purple-600 rounded-xl py-4 items-center mt-8 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text 
              className="text-white text-lg font-semibold" 
              style={{ fontFamily: 'Inter' }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-8">
            <Text 
              className="text-gray-400 text-base" 
              style={{ fontFamily: 'Inter' }}
            >
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onSwitchToSignUp} disabled={isLoading}>
              <Text 
                className="text-purple-400 text-base font-semibold" 
                style={{ fontFamily: 'Inter' }}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}