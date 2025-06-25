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
      return;
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
      await this.stopAudio();
      if (Platform.OS === 'web') {
        console.log('Playing routine:', routine.title);
        this.isPlaying = true;
        return true;
      }
      // Play the Tibetan Bowl Sound 1 first
      const bowlSound = await Audio.Sound.createAsync(
        require('../assets/audio/Tibetan Bowl Sound 1.mp3'),
        {
          shouldPlay: true,
          isLooping: false,
          volume: 0.8,
          rate: 1.0,
        }
      );
      this.sound = bowlSound.sound;
      this.isPlaying = true;
      bowlSound.sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Play the ElevenLabs.mp3 audio immediately after
          const elevenLabsSound = await Audio.Sound.createAsync(
            require('../assets/audio/ElevenLabs.mp3'),
            {
              shouldPlay: true,
              isLooping: false,
              volume: 1.0,
              rate: 1.0,
            }
          );
          this.sound = elevenLabsSound.sound;
          elevenLabsSound.sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              this.isPlaying = false;
              this.sound = null;
            }
          });
        }
      });
      return true;
    } catch (error) {
      console.error('Error playing routine:', error);
      if (Platform.OS === 'web') {
        this.isPlaying = true;
        return true;
      }
      return false;
    }
  }

  static async playSingingBowlStart(): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/Tibetan Bowl Sound 1.mp3'),
        {
          shouldPlay: true,
          isLooping: false,
          volume: 0.6,
        }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing singing bowl start:', error);
    }
  }

  static async playSingingBowlEnd(): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/Tibetan Bowl Sound 1.mp3'),
        {
          shouldPlay: true,
          isLooping: false,
          volume: 0.7,
        }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing singing bowl end:', error);
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
    this.isPlaying = false;
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