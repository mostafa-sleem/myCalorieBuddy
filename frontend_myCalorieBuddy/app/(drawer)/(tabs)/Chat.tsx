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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appendFood, getFoods, FoodEntry } from '../../../lib/storage';
import Svg, { Circle } from 'react-native-svg';

// for greeting and date
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 18) return 'Good afternoon!';
  return 'Good evening!';
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hello! 👋 I’m Buddy, your calorie tracking assistant. How can I help today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [consumed, setConsumed] = useState(0);
  const [target] = useState(2200);
  const [isTyping, setIsTyping] = useState(false);

  // 🟢 Typing animation setup
  const typingAnim = useRef(new Animated.Value(0)).current;
  const typingAnim2 = useRef(new Animated.Value(0)).current;
  const typingAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };
    createLoop(typingAnim, 0).start();
    createLoop(typingAnim2, 200).start();
    createLoop(typingAnim3, 400).start();
  }, []);

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Circle setup
  const radius = 65;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animate ring when consumed changes
  useEffect(() => {
    const percentage = Math.min((consumed / target) * 100, 100);
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [consumed]);

  const offset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  // Load saved calories once on mount
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
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    Keyboard.dismiss();
    setIsTyping(true); // show typing indicator

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

        // update calories immediately
        setConsumed((prev) => prev + (entry.calories ?? 0));

        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `✅ Logged "${entry.food}" (${entry.calories ?? 'unknown'} kcal)`,
          },
        ]);
      }

      setIsTyping(false); // stop typing before bot reply
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: reply || 'No response from server 😅' },
      ]);
    } catch (error) {
      setIsTyping(false); // stop typing on error too
      console.error('❌ Chat fetch error:', error);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: '❌ Connection error. Please try again later.' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔵 Top Greeting + Calorie Circle Section */}
      <View style={styles.summaryContainer}>
        {/* Greeting + Date */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Calorie Circle */}
        <View style={styles.circleWrapper}>
          <Svg height="150" width="150" style={styles.svg}>
            <Circle
              stroke="#E5E5E5"
              fill="none"
              cx="75"
              cy="75"
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke="none"
              fill="#e5e5e56a"
              cx="75"
              cy="75"
              r={radius - 15}
              strokeWidth={1}
            />
            <AnimatedCircle
              stroke="#4FA3F7"
              fill="none"
              cx="75"
              cy="75"
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 75 75)`}
            />
          </Svg>

          <View style={styles.circleTextContainer}>
            <Text style={styles.caloriesMain}>{consumed}</Text>
            <Text style={styles.caloriesSub}>/ {target} kcal</Text>
          </View>
        </View>

        <Text style={styles.caloriesTodayText}>Calories Today</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* 💬 Chat area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={{
              flex: 1,
              paddingHorizontal: 10,
              backgroundColor: '#c6d1dfb4',
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              marginTop: -20,
              shadowColor: '#ffffffff',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 6,
              elevation: 3,
            }}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 100,
            }}
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

            {isTyping && (
              <View style={[styles.botBubble, { flexDirection: 'row' }]}>
                <Animated.Text style={[styles.typingDot, { opacity: typingAnim }]}>●</Animated.Text>
                <Animated.Text style={[styles.typingDot, { opacity: typingAnim2, marginLeft: 3 }]}>●</Animated.Text>
                <Animated.Text style={[styles.typingDot, { opacity: typingAnim3, marginLeft: 3 }]}>●</Animated.Text>

              </View>
            )}
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
    marginTop: 120,
    marginBottom: 100,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: { position: 'absolute' },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesMain: { fontSize: 26, fontWeight: '700', color: '#222' },
  caloriesSub: { fontSize: 11, color: '#777' },
  chatContainer: { padding: 12, paddingBottom: 100 },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#000' },
  botText: { color: '#333' },
  typingDot: {
    fontSize: 8, // or 8 for extra tiny
    color: '#424242ff',
    lineHeight: 18,
  },
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
  greetingContainer: {
    alignItems: 'flex-start',
    width: '41%',
    alignSelf: 'center',
    marginTop: -120,
    marginBottom: 80,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
  },
  dateText: { fontSize: 15, color: '#777', marginTop: 4 },
  caloriesTodayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 80,
    marginBottom: -50,
  },
  separatorLine: {
    width: '75%',
    height: 1,
    backgroundColor: '#ddd',
    marginTop: 70,
    marginBottom: -70,
    alignSelf: 'center',
  },
});
