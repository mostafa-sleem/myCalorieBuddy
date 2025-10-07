// lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FoodEntry = {
  id: string;
  food: string;
  quantity?: number;
  unit?: string;
  calories?: number;
  ts: string; // ISO date string
};

const KEY = 'foodLog:v1';

export async function loadFoodLog(): Promise<FoodEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('❌ loadFoodLog error:', err);
    return [];
  }
}

export async function appendFood(entry: FoodEntry) {
  try {
    const list = await loadFoodLog();
    list.unshift(entry);
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    console.error('❌ appendFood error:', err);
  }
}

export async function clearFoodLog() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.error('❌ clearFoodLog error:', err);
  }
}
