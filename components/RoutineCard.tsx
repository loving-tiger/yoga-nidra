import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Clock } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

interface RoutineCardProps {
  title: string;
  duration: string;
  description: string;
  onPress: () => void;
  isActive?: boolean;
}

export default function RoutineCard({ 
  title, 
  duration, 
  description, 
  onPress, 
  isActive = false 
}: RoutineCardProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, isActive && { borderColor: colors.button, backgroundColor: colors.button + '22' }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.durationContainer}>
            <Clock size={14} color={colors.button} />
            <Text style={[styles.duration, { color: colors.button }]}>{duration}</Text>
          </View>
        </View>
        <View style={[styles.playButton, { backgroundColor: colors.button + '18' }, isActive && { backgroundColor: colors.button }] }>
          <Play size={16} color={isActive ? colors.buttonText : colors.button} />
        </View>
      </View>
      <Text style={[styles.description, { color: colors.text + 'BB' }]}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});