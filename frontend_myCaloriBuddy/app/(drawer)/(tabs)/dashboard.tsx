import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { loadFoodLog, clearFoodLog, FoodEntry } from '../../../lib/storage';


export default function Dashboard() {
  const [items, setItems] = useState<FoodEntry[]>([]);

  // 🔄 Load saved entries every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await loadFoodLog();
        setItems(data);
      })();
    }, [])
  );

  // 🧮 Calculate total calories for today
  const today = new Date().toDateString();
  const totalToday = items
    .filter((i) => new Date(i.ts).toDateString() === today)
    .reduce((sum, i) => sum + (i.calories ?? 0), 0);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
        Total today: {Math.round(totalToday)} kcal
      </Text>

      <Button
        title="🧹 Clear All Entries"
        color="red"
        onPress={async () => {
          await clearFoodLog();
          setItems([]);
        }}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              backgroundColor: '#f7f7f7',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              {item.food}
              {item.quantity
                ? ` x ${item.quantity}${item.unit ? ` ${item.unit}` : ''}`
                : ''}
            </Text>
            <Text style={{ color: '#555' }}>
              {new Date(item.ts).toLocaleString()} •{' '}
              {item.calories ? `${item.calories} kcal` : '— kcal'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
