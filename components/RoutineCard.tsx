import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Clock } from 'lucide-react-native';

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
  return (
    <TouchableOpacity 
      style={[styles.container, isActive && styles.activeContainer]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.durationContainer}>
            <Clock size={14} color="#7C3AED" />
            <Text style={styles.duration}>{duration}</Text>
          </View>
        </View>
        <View style={[styles.playButton, isActive && styles.activePlayButton]}>
          <Play size={16} color={isActive ? '#FFFFFF' : '#7C3AED'} />
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
  },
  activeContainer: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
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
    color: '#581C87',
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePlayButton: {
    backgroundColor: '#7C3AED',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});