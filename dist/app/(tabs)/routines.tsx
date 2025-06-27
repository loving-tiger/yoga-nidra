import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/AnimatedBackground';
import RoutineCard from '@/components/RoutineCard';
import { DEFAULT_ROUTINES } from '@/data/routines';
import { AudioService, AudioRoutine } from '@/services/AudioService';

export default function RoutinesScreen() {
  const [selectedRoutine, setSelectedRoutine] = useState<string>(DEFAULT_ROUTINES[0].id);

  const handlePlayRoutine = async (routine: AudioRoutine) => {
    const success = await AudioService.playRoutine(routine);
    if (success) {
      setSelectedRoutine(routine.id);
      Alert.alert(
        `Starting ${routine.title} 🧘‍♀️`,
        'Find a comfortable position and let the gentle guidance begin.',
        [{ text: 'Begin', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Playback Error',
        'We couldn\'t start the routine. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Morning Routines</Text>
          <Text style={styles.subtitle}>
            Choose from our collection of gentle, AI-guided practices
          </Text>
        </View>

        <View style={styles.routinesList}>
          {DEFAULT_ROUTINES.map((routine) => (
            <RoutineCard
              key={routine.id}
              title={routine.title}
              duration={routine.duration}
              description={routine.description}
              onPress={() => handlePlayRoutine(routine)}
              isActive={selectedRoutine === routine.id}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            More routines coming soon! Each practice is designed to help you start your day with intention and calm.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  routinesList: {
    flex: 1,
  },
  footer: {
    paddingTop: 32,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});