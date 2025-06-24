import { useState, useEffect } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { AudioRoutine } from '@/services/AudioService';

export interface AlarmSettings {
  time: Date;
  isEnabled: boolean;
  routine: AudioRoutine;
}

export function useAlarm() {
  const [alarmSettings, setAlarmSettings] = useState<AlarmSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scheduleAlarm = async (time: Date, routine: AudioRoutine): Promise<boolean> => {
    setIsLoading(true);
    try {
      const identifier = await NotificationService.scheduleAlarm(time, routine.title);
      if (identifier) {
        setAlarmSettings({
          time,
          isEnabled: true,
          routine,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAlarm = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await NotificationService.cancelAllAlarms();
      setAlarmSettings(prev => prev ? { ...prev, isEnabled: false } : null);
    } catch (error) {
      console.error('Error canceling alarm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlarmTime = async (newTime: Date): Promise<boolean> => {
    if (!alarmSettings) return false;
    
    return await scheduleAlarm(newTime, alarmSettings.routine);
  };

  const updateAlarmRoutine = async (newRoutine: AudioRoutine): Promise<boolean> => {
    if (!alarmSettings) return false;
    
    return await scheduleAlarm(alarmSettings.time, newRoutine);
  };

  return {
    alarmSettings,
    isLoading,
    scheduleAlarm,
    cancelAlarm,
    updateAlarmTime,
    updateAlarmRoutine,
  };
}