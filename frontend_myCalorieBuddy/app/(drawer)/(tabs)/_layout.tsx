import { useThemeColors } from 'app/contexts/ThemeColors';
import { TabButton } from 'components/TabButton';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionTab from '@/components/ActionTab';

export default function Layout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      {/* This is where all routes will render */}
      <TabSlot />

      <TabList
        style={{
          alignItems: 'center',
          backgroundColor: colors.secondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
        }}
      >
        {/* 🏠 Home Tab */}
        <TabTrigger name="index" href="/" asChild>
          <TabButton labelAnimated={true} icon="Home">
            Home
          </TabButton>
        </TabTrigger>



        {/* 🤖 AI Coach Tab */}
        <TabTrigger name="Chat" href="Chat" asChild>
          <TabButton labelAnimated={true} icon="MessageSquare">
            AI Coach
          </TabButton>
        </TabTrigger>

        
        <View className="w-1/5 items-center justify-center">
          <ActionTab />
        </View>

         {/* 🧾 Dashboard Tab (NEW) */}
        <TabTrigger name="dashboard" href="/dashboard" asChild>
          <TabButton labelAnimated={true} icon="Notebook">
            Dashboard
          </TabButton>
        </TabTrigger>

        {/* 🍽️ Meals Tab */}
        <TabTrigger name="meals" href="/meals" asChild>
          <TabButton labelAnimated={true} icon="Utensils">
            Meals
          </TabButton>
        </TabTrigger>

        {/* 📊 Progress Tab */}
        <TabTrigger name="progress" href="/progress" asChild>
          <TabButton labelAnimated={true} icon="ChartNoAxesColumn">
            Progress
          </TabButton>
        </TabTrigger>

        

        {/* 💪 Workouts Tab */}
        <TabTrigger name="workouts" href="/workouts" asChild>
          <TabButton labelAnimated={true} icon="BicepsFlexed">
            Workouts
          </TabButton>
        </TabTrigger>




        



      </TabList>
    </Tabs>
  );
}