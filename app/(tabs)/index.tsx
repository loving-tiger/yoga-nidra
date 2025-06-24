import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Moon, Sun } from 'lucide-react-native';
import AnimatedBackground from '@/components/AnimatedBackground';
import TimeDisplay from '@/components/TimeDisplay';
import Button from '@/components/Button';
import { useAlarm } from '@/hooks/useAlarm';
import { DEFAULT_ROUTINES } from '@/data/routines';
import { AudioService } from '@/services/AudioService';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { alarmSettings, scheduleAlarm, cancelAlarm, isLoading } = useAlarm();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    AudioService.initializeAudio();
  }, []);

  const handleSetAlarm = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0); // Default to 7:00 AM

    const success = await scheduleAlarm(tomorrow, DEFAULT_ROUTINES[0]);
    if (success) {
      Alert.alert(
        'Alarm Set! 🌅',
        'Your gentle morning routine is scheduled. Sweet dreams!',
        [{ text: 'Perfect', style: 'default' }]
      );
    } else {
      Alert.alert(
        'Oops!',
        'We couldn\'t set your alarm. Please check your notification permissions.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCancelAlarm = async () => {
    await cancelAlarm();
    Alert.alert(
      'Alarm Cancelled',
      'Your morning routine has been cancelled.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handlePlayNow = async () => {
    const success = await AudioService.playRoutine(DEFAULT_ROUTINES[0]);
    if (success) {
      Alert.alert(
        'Starting Your Routine 🧘‍♀️',
        'Find a comfortable position and let the gentle guidance begin.',
        [{ text: 'Begin', style: 'default' }]
      );
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <Sun size={24} color="#F59E0B" />;
    if (hour < 17) return <Sun size={24} color="#F59E0B" />;
    return <Moon size={24} color="#7C3AED" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            {getGreetingIcon()}
            <Text style={styles.greetingText}>{getGreeting()}</Text>
          </View>
          <TimeDisplay time={currentTime} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {alarmSettings?.isEnabled ? (
            <View style={styles.alarmActive}>
              <View style={styles.alarmInfo}>
                <Clock size={20} color="#7C3AED" />
                <Text style={styles.alarmText}>
                  Wake-up routine set for{' '}
                  <Text style={styles.alarmTime}>
                    {alarmSettings.time.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </Text>
              </View>
              <Text style={styles.routineTitle}>{alarmSettings.routine.title}</Text>
              <Text style={styles.routineDescription}>
                {alarmSettings.routine.description}
              </Text>
              
              <View style={styles.buttonGroup}>
                <Button
                  title="Play Now"
                  onPress={handlePlayNow}
                  variant="primary"
                  size="large"
                  style={styles.primaryButton}
                />
                <Button
                  title="Cancel Alarm"
                  onPress={handleCancelAlarm}
                  variant="ghost"
                  size="medium"
                />
              </View>
            </View>
          ) : (
            <View style={styles.alarmInactive}>
              <Text style={styles.welcomeTitle}>Welcome to WakeUp Buddy</Text>
              <Text style={styles.welcomeDescription}>
                Replace jarring alarms with gentle, AI-guided morning routines that help you start each day feeling calm and centered.
              </Text>
              
              <View style={styles.defaultRoutine}>
                <Text style={styles.defaultRoutineTitle}>Your First Routine</Text>
                <Text style={styles.defaultRoutineName}>{DEFAULT_ROUTINES[0].title}</Text>
                <Text style={styles.defaultRoutineDescription}>
                  {DEFAULT_ROUTINES[0].description}
                </Text>
              </View>

              <View style={styles.buttonGroup}>
                <Button
                  title="Set My Wake-Up Time"
                  onPress={handleSetAlarm}
                  variant="primary"
                  size="large"
                  style={styles.primaryButton}
                  disabled={isLoading}
                />
                <Button
                  title="Try It Now"
                  onPress={handlePlayNow}
                  variant="secondary"
                  size="medium"
                />
              </View>
            </View>
          )}
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
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#581C87',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  alarmActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
  },
  alarmInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
  },
  alarmInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  alarmText: {
    fontSize: 16,
    color: '#6B7280',
  },
  alarmTime: {
    fontWeight: '600',
    color: '#7C3AED',
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 8,
    textAlign: 'center',
  },
  routineDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  defaultRoutine: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  defaultRoutineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
    marginBottom: 4,
    textAlign: 'center',
  },
  defaultRoutineName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 8,
    textAlign: 'center',
  },
  defaultRoutineDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    width: '100%',
  },
});