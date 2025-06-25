import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Volume2, Moon, Info, Heart, ChevronRight } from 'lucide-react-native';
import AnimatedBackground from '@/components/AnimatedBackground';
import Button from '@/components/Button';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

function SettingItem({ icon, title, description, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Manage your alarm and reminder preferences.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAudioSettings = () => {
    Alert.alert(
      'Audio Settings',
      'Adjust volume and voice preferences.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSleepSettings = () => {
    Alert.alert(
      'Sleep Settings',
      'Configure your bedtime and wake-up preferences.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About WakeUp Buddy',
      'Version 1.0.0\n\nWakeUp Buddy helps you start each day with intention and calm through gentle, AI-guided morning routines.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support & Feedback',
      'We\'d love to hear from you! Send us your thoughts and suggestions.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium 🌟',
      'Unlock additional routines, custom wake-up times, and advanced personalization features.\n\n• 15+ guided routines\n• Custom alarm tones\n• Progress tracking\n• Offline access\n\n$4.99/month or $29/year',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade Now', style: 'default' }
      ]
    );
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
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your mindful morning experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon={<Bell size={20} color="#7C3AED" />}
            title="Notifications"
            description="Manage alarms and reminders"
            onPress={handleNotificationSettings}
          />
          
          <SettingItem
            icon={<Volume2 size={20} color="#7C3AED" />}
            title="Audio"
            description="Voice and volume settings"
            onPress={handleAudioSettings}
          />
          
          <SettingItem
            icon={<Moon size={20} color="#7C3AED" />}
            title="Sleep Schedule"
            description="Bedtime and wake-up preferences"
            onPress={handleSleepSettings}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={<Info size={20} color="#7C3AED" />}
            title="About"
            description="App version and information"
            onPress={handleAbout}
          />
          
          <SettingItem
            icon={<Heart size={20} color="#7C3AED" />}
            title="Support & Feedback"
            description="Help us improve your experience"
            onPress={handleSupport}
          />
        </View>

        <View style={styles.upgradeSection}>
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>Unlock Premium Features</Text>
            <Text style={styles.upgradeDescription}>
              Get access to our full library of routines, custom scheduling, and advanced personalization.
            </Text>
            <Button
              title="Upgrade to Premium"
              onPress={handleUpgrade}
              variant="primary"
              size="large"
              style={styles.upgradeButton}
            />
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  upgradeSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  upgradeCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#581C87',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  upgradeButton: {
    width: '100%',
  },
});