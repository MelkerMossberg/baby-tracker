import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { ActiveBabyProvider } from '../contexts/ActiveBabyProvider';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function AuthenticatedApp() {
  const { authStatus } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  // Show loading spinner while checking auth status
  if (authStatus === 'loading') {
    return (
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-bg-main dark:bg-white">
        <StyledText className="text-text-main dark:text-black text-lg">
          Loading...
        </StyledText>
      </StyledSafeAreaView>
    );
  }

  // Show auth screens if not authenticated
  if (authStatus === 'unauthenticated') {
    return (
      <StyledSafeAreaView className="flex-1 bg-bg-main dark:bg-white">
        <StatusBar style="auto" />
        {showSignUp ? (
          <SignUpScreen onSwitchToSignIn={() => setShowSignUp(false)} />
        ) : (
          <SignInScreen onSwitchToSignUp={() => setShowSignUp(true)} />
        )}
      </StyledSafeAreaView>
    );
  }

  // Show main app if authenticated
  return (
    <ActiveBabyProvider>
      <StyledSafeAreaView className="flex-1 bg-bg-main dark:bg-white">
        <StatusBar style="auto" />
        <StyledView className="flex-1 p-4 bg-bg-main text-text-main dark:bg-white">
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </StyledView>
      </StyledSafeAreaView>
    </ActiveBabyProvider>
  );
}