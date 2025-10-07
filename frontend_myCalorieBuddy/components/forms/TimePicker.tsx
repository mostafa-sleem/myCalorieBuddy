import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Platform, Animated, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import useThemeColors from '@/app/contexts/ThemeColors';
import ThemedText from '@/components/ThemedText';
import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { InputVariant } from './Input';

interface TimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  is24Hour?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  variant?: InputVariant;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  is24Hour = false,
  disabled = false,
  containerClassName = '',
  variant = 'inline',
}) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: (isFocused || value) ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animatedLabelValue, variant]);

  const labelStyle = {
    top: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.placeholder, colors.text],
    }),
    left: 12,
    paddingHorizontal: 8,
    position: 'absolute' as 'absolute',
    zIndex: 50,
    backgroundColor: colors.bg,
  };

  const showTimePicker = () => {
    if (disabled) return;
    setIsFocused(true);
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setIsFocused(false);
    setTimePickerVisible(false);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      hideTimePicker();
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    hideTimePicker();
  };

  const formattedTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour
    });
  };

  // Helper function to render time picker
  const renderTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={isTimePickerVisible}
          onBackdropPress={hideTimePicker}
          style={{ margin: 0, justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: colors.bg }} className="rounded-t-xl items-center justify-center w-full">
            <View style={{ borderBottomColor: colors.border }} className="flex-row justify-between items-center p-4 border-b w-full">
              <Button
                title="Cancel"
                variant="ghost"
                onPress={hideTimePicker}
                textClassName="text-base font-normal"
              />
              <ThemedText className="text-lg font-medium">
                {label || 'Select Time'}
              </ThemedText>
              <Button
                title="Done"
                variant="ghost"
                onPress={handleConfirm}
                textClassName="text-base font-semibold"
              />
            </View>
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={is24Hour}
              display="spinner"
              onChange={handleTimeChange}
              themeVariant={colors.isDark ? 'dark' : 'light'}
              style={{ backgroundColor: colors.bg }}
            />
          </View>
        </Modal>
      );
    } else {
      return isTimePickerVisible && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={is24Hour}
          display="default"
          onChange={handleTimeChange}
        />
      );
    }
  };

  if (variant === 'inline') {
    return (
      <View className={`mb-global relative ${containerClassName}`}>
        {label && (
          <ThemedText className="mb-2 font-medium absolute top-2 left-3 text-xs text-text opacity-60">{label}</ThemedText>
        )}
        <TouchableOpacity
          onPress={showTimePicker}
          disabled={disabled}
          className={`border border-border bg-border rounded-lg px-3 h-16 pt-7 pr-10
            ${isFocused ? 'border-border' : 'border-border/60'}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50' : ''}`}
        >
          <ThemedText className={value ? 'text-text' : 'text-text opacity-60'}>
            {value ? formattedTime(value) : placeholder}
          </ThemedText>
        </TouchableOpacity>
        <Pressable className="absolute right-3 top-[18px] z-10">
          <Icon name="Clock" size={20} color={colors.text} />
        </Pressable>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    );
  }

  if (variant === 'classic') {
    return (
      <View className={`mb-global relative ${containerClassName}`} style={{ position: 'relative' }}>
        {label && (
          <ThemedText className="mb-2 font-medium">{label}</ThemedText>
        )}
        <View className="relative">
          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            className={`border bg-secondary rounded-lg px-3 h-14 pr-10 text-text 
              ${isFocused ? 'border-border' : 'border-border/60'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
          >
            <View className="flex-1 justify-center">
              <ThemedText className={value ? 'text-text' : 'text-text opacity-60'}>
                {value ? formattedTime(value) : placeholder}
              </ThemedText>
            </View>
          </TouchableOpacity>
          <Pressable className="absolute right-3 top-[18px] z-10">
            <Icon name="Clock" size={20} color={colors.text} />
          </Pressable>
        </View>
        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    );
  }

  if (variant === 'underlined') {
    return (
      <View className={`mb-global relative ${containerClassName}`} style={{ position: 'relative' }}>
        <View className="relative">
          <Pressable className='px-0 bg-secondary z-40' onPress={showTimePicker}>
            <Animated.Text
              style={[{
                top: animatedLabelValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, -8],
                }),
                fontSize: animatedLabelValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 12],
                }),
                color: animatedLabelValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.placeholder, colors.text],
                }),
                left: 0,
                paddingHorizontal: 0,
                position: 'absolute',
                zIndex: 50,
                backgroundColor: colors.bg,
              }]}
              className="text-black dark:text-white"
            >
              {label}
            </Animated.Text>
          </Pressable>

          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            className={`border-b-2 py-3 px-0 h-14 pr-10 text-text bg-transparent border-t-0 border-l-0 border-r-0
              ${isFocused ? 'border-border' : 'border-border'}
              ${error ? 'border-red-500' : ''}
              ${disabled ? 'opacity-50' : ''}`}
          >
            <View className="flex-1 justify-center">
              <ThemedText className={value ? 'text-text' : 'transparent'}>
                {value ? formattedTime(value) : ''}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <Pressable className="absolute right-0 top-[18px] z-10">
            <Icon name="Clock" size={20} color={colors.text} />
          </Pressable>
        </View>

        {error && (
          <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
        )}
        {renderTimePicker()}
      </View>
    );
  }

  return (
    <View className={`mb-8 relative ${containerClassName}`}>
      <Pressable
        className='z-40 px-1 bg-background'
        style={{ position: 'absolute', left: -6, top: 0 }}
        onPress={showTimePicker}
      >
        <Animated.Text
          style={[labelStyle]}
          className="bg-background text-text"
        >
          {label}
        </Animated.Text>
      </Pressable>

      <TouchableOpacity
        onPress={showTimePicker}
        disabled={disabled}
        className={`border rounded-lg py-3 px-3 h-14 pr-10 text-text bg-transparent
          ${isFocused ? 'border-border' : 'border-border'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50' : ''}`}
      >
        <View className="flex-1 justify-center">
          <ThemedText className={value ? 'text-text' : 'transparent'}>
            {value ? formattedTime(value) : ''}
          </ThemedText>
        </View>
      </TouchableOpacity>

      <Pressable className="absolute right-3 top-[18px] z-10">
        <Icon name="Clock" size={20} color={colors.text} />
      </Pressable>

      {error && (
        <ThemedText className="text-red-500 text-xs mt-1">{error}</ThemedText>
      )}
      {renderTimePicker()}
    </View>
  );
}; 