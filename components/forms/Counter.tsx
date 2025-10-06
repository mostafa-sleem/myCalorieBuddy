import React, { useState } from 'react';
import { View, Pressable, Text, StyleProp, ViewStyle } from 'react-native';
import ThemedText from '../ThemedText';

interface CounterProps {
  label: string;
  value?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Counter({ 
  label, 
  value: controlledValue, 
  onChange, 
  min = 0, 
  max = 99,
  className,
  style
}: CounterProps) {
  const [internalValue, setInternalValue] = useState<number | undefined>(undefined);
  
  // Handle controlled and uncontrolled modes
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: number | undefined) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const increment = () => {
    if (value === undefined) {
      handleChange(1);
    } else if (value < max) {
      handleChange(value + 1);
    }
  };

  const decrement = () => {
    if (value === 1) {
      handleChange(undefined);
    } else if (value !== undefined && value > min) {
      handleChange(value - 1);
    }
  };

  return (
    <View className={`w-full ${className}`} style={style}>
      <View className="w-full flex-row items-center justify-between">
        <ThemedText className="text-base flex-1">{label}</ThemedText>
        <View className="flex-row min-w-[140px] justify-between p-1 items-center bg-secondary rounded-full  overflow-hidden">
          <Pressable 
            onPress={decrement}
            className="w-8 h-8 bg-background  rounded-full items-center justify-center"
          >
            <ThemedText className="text-lg">-</ThemedText>
          </Pressable>
          
          <View className="items-center justify-center px-4">
            <ThemedText className="text-base font-medium">
              {value === undefined ? 'Any' : value}
            </ThemedText>
          </View>

          <Pressable 
            onPress={increment}
            className="w-8 h-8 bg-background rounded-full items-center justify-center"
          >
            <ThemedText className="text-lg">+</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
} 