import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

interface TimeDisplayProps {
  time: Date;
  size?: 'small' | 'large';
}

export default function TimeDisplay({ time, size = 'large' }: TimeDisplayProps) {
  const { colors } = useTheme();
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.time, size === 'small' && styles.timeSmall, { color: colors.button }]}>
        {formatTime(time)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
  },
  timeSmall: {
    fontSize: 24,
  },
});