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

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! 👋 I’m Buddy, your calorie tracking assistant. How can I help today?' },
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Automatically scroll to bottom when new message arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      // 👇 Replace this with your NGROK URL (not localhost!)
      const response = await fetch('https://ionogenic-micheal-debonairly.ngrok-free.dev/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        { from: 'bot', text: data.reply || 'No response from server 😅' },
      ]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        { from: 'bot', text: '❌ Connection error. Please try again later.' },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
                  {msg.from === 'user' ? `You: ${msg.text}` : `Buddy: ${msg.text}`}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // WhatsApp green
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F1F1',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  botText: {
    color: '#333',
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
});
