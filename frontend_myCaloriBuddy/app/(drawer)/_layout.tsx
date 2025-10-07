import React from 'react';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 👇 Load the (tabs) layout inside the drawer */}
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Home' }} />
    </Drawer>
  );
}
