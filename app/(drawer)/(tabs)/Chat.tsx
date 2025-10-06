import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Chat() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! 👋 I’m Buddy, your calorie coach. How can I help today?' },
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages([...newMessages, { from: 'bot', text: 'Got it! 😊 (demo reply)' }]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContainer}>
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.messageBubble,
                  msg.from === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={msg.from === 'user' ? styles.userText : styles.botText}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </TouchableWithoutFeedback>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1 },
  chatContainer: { padding: 12, paddingBottom: 100 },
  messageBubble: { marginVertical: 6, padding: 12, borderRadius: 16, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#333' },
  userText: { color: '#fff' },
  botText: { color: '#ddd' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#222',
    backgroundColor: '#000',
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
});
