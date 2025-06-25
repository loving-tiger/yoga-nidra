import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Skip permissions on web
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleAlarm(time: Date, routineTitle: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Alarm scheduled for:', time);
      return 'web-mock-id';
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Cancel any existing alarms
      await this.cancelAllAlarms();

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good Morning ☀️',
          body: `Time for your ${routineTitle} routine`,
          sound: Platform.OS === 'ios' ? 'tibetan-singing-bowl.wav' : 'tibetan_singing_bowl',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'alarm',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      return null;
    }
  }

  static async cancelAllAlarms(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling alarms:', error);
    }
  }

  static async getScheduledAlarms() {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled alarms:', error);
      return [];
    }
  }
}