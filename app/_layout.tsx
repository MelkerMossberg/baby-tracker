import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useFonts } from 'expo-font';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DM Serif Display': require('../assets/fonts/DMSerifDisplay-Regular.ttf'),
    'Inter': require('../assets/fonts/Inter_18pt-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <StyledSafeAreaView className="flex-1 items-center justify-center bg-bg-main">
        <StyledText className="text-text-main text-lg">Loading fonts...</StyledText>
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