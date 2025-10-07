import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import useThemeColors from './contexts/ThemeColors';

export default function RootLayout() {
  const colors = useThemeColors();

  return (
    <GestureHandlerRootView
      className={`bg-background ${Platform.OS === 'ios' ? 'pb-0' : ''}`}
      style={{ flex: 1 }}
    >
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          {/* 👇 This line ensures your drawer (and tabs) load first */}
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
