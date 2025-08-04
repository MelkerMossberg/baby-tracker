import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { initializeDummyData } from '../services';
import { AuthProvider } from '../hooks/useAuth';
import AuthenticatedApp from '../components/AuthenticatedApp';

const StyledSafeAreaView = styled(SafeAreaView);
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
      try {
        // Database initialization
        await initializeDummyData();
        setDbInitialized(true);
      } catch (error) {
        console.warn('Database initialization failed:', error);
        setDbInitialized(true); // Continue even if DB init fails
      }
    };

    if (fontsLoaded) {
      initializeApp();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return (
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-bg-main dark:bg-white">
        <StyledText className="text-text-main dark:text-black text-lg">
          Loading...
        </StyledText>
      </StyledSafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}