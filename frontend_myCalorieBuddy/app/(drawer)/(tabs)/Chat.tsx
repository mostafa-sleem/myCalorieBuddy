import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appendFood, getFoods, FoodEntry } from '../../../lib/storage'; // ✅ updated
import Svg, { Circle } from 'react-native-svg';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hello! 👋 I’m Buddy, your calorie tracking assistant. How can I help today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [consumed, setConsumed] = useState(0);
  const [target] = useState(2200); // 🔹 daily target
  const scrollViewRef = useRef<ScrollView>(null);

  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / target, 1);
  const offset = circumference - progress * circumference;

  // Load calories from saved entries whenever app renders or food is logged
  useEffect(() => {
    const loadCalories = async () => {
      try {
        const foods = await getFoods();
        const total = foods.reduce(
          (sum: number, f: FoodEntry) => sum + (f.calories ?? 0),
          0
        );
        setConsumed(total);
      } catch (e) {
        console.log('⚠️ Could not load foods', e);
      }
    };

    loadCalories();
  }, []); // 👈 only runs once on mount


  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch(
        'https://ionogenic-micheal-debonairly.ngrok-free.dev/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input }),
        }
      );

      const { reply, data } = await response.json();

      if (data?.food) {
        const entry: FoodEntry = {
          id: `${Date.now()}`,
          food: String(data.food),
          quantity:
            typeof data.quantity === 'number' ? data.quantity : undefined,
          unit: data.unit || undefined,
          calories:
            typeof data.calories === 'number' ? data.calories : undefined,
          ts: new Date().toISOString(),
        };
        await appendFood(entry);
        console.log('✅ Saved food entry:', entry);

        setConsumed(prev => prev + (entry.calories ?? 0));

        const progress = Math.min(consumed / target, 1);



        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `✅ Logged "${entry.food}" (${entry.calories ?? 'unknown'} kcal)`,
          },
        ]);
      }

      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: reply || 'No response from server 😅' },
      ]);
    } catch (error) {
      console.error('❌ Chat fetch error:', error);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '❌ Connection error. Please try again later.' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔵 Circular progress summary */}
      <View style={styles.summaryContainer}>
        <Svg height="110" width="110" style={styles.svg}>
          <Circle
            stroke="#eee"
            fill="none"
            cx="55"
            cy="55"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#4FA3F7"
            fill="none"
            cx="55"
            cy="55"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.circleTextContainer}>
          <Text style={styles.caloriesMain}>{consumed}</Text>
          <Text style={styles.caloriesSub}>/ {target} kcal</Text>
          <Text style={styles.remaining}>
            {Math.max(target - consumed, 0)} remaining
          </Text>
        </View>
      </View>

      {/* 💬 Chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.from === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.from === 'user' ? styles.userText : styles.botText,
                  ]}
                >
                  {msg.from === 'user'
                    ? `You: ${msg.text}`
                    : `Buddy: ${msg.text}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </TouchableWithoutFeedback>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  summaryContainer: {
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  svg: { position: 'absolute' },
  circleTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesMain: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  caloriesSub: {
    fontSize: 14,
    color: '#777',
  },
  remaining: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  chatContainer: { padding: 12, paddingBottom: 100 },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#F1F1F1' },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#000' },
  botText: { color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
  },
});
