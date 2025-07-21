import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { initializeDummyData } from '../services';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DM Serif Display': require('../assets/fonts/DMSerifDisplay-Regular.ttf'),
    'Inter': require('../assets/fonts/Inter_18pt-Regular.ttf'),
  });
  
  const [dbInitialized, setDbInitialized] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const results = await Promise.allSettled([
        // Font loading is handled by useFonts hook
        new Promise<void>((resolve) => {
          if (fontsLoaded) {
            resolve();
          } else {
            // Wait for fonts to load
            const checkFonts = () => {
              if (fontsLoaded) {
                resolve();
              } else {
                setTimeout(checkFonts, 50);
              }
            };
            checkFonts();
          }
        }),
        // Database initialization
        initializeDummyData().catch(error => {
          console.warn('Database initialization failed:', error);
        })
      ]);

      setDbInitialized(true);
      setAppReady(fontsLoaded);
    };

    initializeApp();
  }, [fontsLoaded]);

  if (!appReady) {
    return (
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-bg-main">
        <StyledText className="text-text-main text-lg">Loading...</StyledText>
      </StyledSafeAreaView>
    );
  }

  return (
      <StyledSafeAreaView className="flex-1 bg-bg-main dark:bg-white">
      <StatusBar style="auto" />
      <StyledView className="flex-1 p-4 bg-bg-main text-text-main dark:bg-white">
        <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#0C0B10',
        },
      }}
    />
      </StyledView>
    </StyledSafeAreaView>
  );
}