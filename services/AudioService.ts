import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface AudioRoutine {
  id: string;
  title: string;
  duration: string;
  description: string;
  audioUrl?: string;
  transcript: string;
}

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static isPlaying = false;

  static async initializeAudio(): Promise<void> {
    if (Platform.OS === 'web') {
      return; // Audio setup handled differently on web
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  static async playRoutine(routine: AudioRoutine): Promise<boolean> {
    try {
      // Stop any currently playing audio
      await this.stopAudio();

      if (Platform.OS === 'web') {
        // For web demo, we'll simulate audio playback
        console.log('Playing routine:', routine.title);
        this.isPlaying = true;
        return true;
      }

      // For now, we'll use a placeholder audio file
      // In production, this would be the generated TTS audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: routine.audioUrl || 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, isLooping: false }
      );

      this.sound = sound;
      this.isPlaying = true;

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
          this.sound = null;
        }
      });

      return true;
    } catch (error) {
      console.error('Error playing routine:', error);
      return false;
    }
  }

  static async stopAudio(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  }

  static async pauseAudio(): Promise<void> {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }

  static async resumeAudio(): Promise<void> {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
      } catch (error) {
        console.error('Error resuming audio:', error);
      }
    }
  }

  static getIsPlaying(): boolean {
    return this.isPlaying;
  }
}