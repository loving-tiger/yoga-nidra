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
  // Web audio elements
  private static webBowlAudio: HTMLAudioElement | null = null;
  private static webMainAudio: HTMLAudioElement | null = null;
  static webDebugInterval: ReturnType<typeof setInterval> | null = null;
  private static bowlDuration: number | null = null;
  private static mainDuration: number | null = null;
  private static currentlyPlaying: 'bowl' | 'main' | 'endBowl' | null = null;

  static async initializeAudio(): Promise<void> {
    if (Platform.OS === 'web') {
      // No-op for now
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
      if (Platform.OS === 'web') {
        // Stop any existing audio synchronously (avoid async before play)
        if (this.webDebugInterval) clearInterval(this.webDebugInterval);
        this.webDebugInterval = null;
        if (this.webBowlAudio) {
          this.webBowlAudio.pause();
          this.webBowlAudio.currentTime = 0;
          this.webBowlAudio = null;
        }
        if (this.webMainAudio) {
          this.webMainAudio.pause();
          this.webMainAudio.currentTime = 0;
          this.webMainAudio = null;
        }
        // Use correct file names and paths
        this.webBowlAudio = new window.Audio('/assets/audio/TibetanBowlSound1.mp3');
        this.webMainAudio = new window.Audio('/assets/audio/ElevenLabsMatt.mp3');
        this.isPlaying = true;
        this.currentlyPlaying = 'bowl';
        this.webBowlAudio.volume = 0.8;
        this.webMainAudio.volume = 1.0;
        this.webBowlAudio.onloadedmetadata = () => {
          AudioService.bowlDuration = this.webBowlAudio?.duration || null;
        };
        this.webMainAudio.onloadedmetadata = () => {
          AudioService.mainDuration = this.webMainAudio?.duration || null;
        };
        this.webBowlAudio.onended = () => {
          if (this.webMainAudio) {
            this.currentlyPlaying = 'main';
            this.webMainAudio.play().catch((e) => {
              console.warn('Main audio autoplay failed:', e);
            });
          }
        };
        this.webMainAudio.onended = () => {
          // Play Tibetan bowl sound again at the end
          this.currentlyPlaying = 'endBowl';
          const endBowl = new window.Audio('/assets/audio/TibetanBowlSound1.mp3');
          endBowl.volume = 0.8;
          endBowl.play().catch((e) => {
            console.warn('End bowl audio autoplay failed:', e);
          });
          this.isPlaying = false;
        };
        // Play bowl audio immediately after user gesture
        this.webBowlAudio.play().catch((e) => {
          console.warn('Bowl audio autoplay failed:', e);
        });
        // Debug: log currentTime every 500ms
        if (this.webDebugInterval) clearInterval(this.webDebugInterval);
        this.webDebugInterval = setInterval(() => {
          const bowl = this.webBowlAudio;
          const main = this.webMainAudio;
          console.log('[AudioService][DEBUG] Bowl:', bowl ? { currentTime: bowl.currentTime, duration: bowl.duration, paused: bowl.paused } : null);
          console.log('[AudioService][DEBUG] Main:', main ? { currentTime: main.currentTime, duration: main.duration, paused: main.paused } : null);
        }, 500);
        return true;
      }
      // Native: Play the Tibetan Bowl Sound 1 first
      const bowlSound = await Audio.Sound.createAsync(
        getAudioSource('TibetanBowlSound1.mp3'),
        {
          shouldPlay: true,
          isLooping: false,
          volume: 0.8,
          rate: 1.0,
        }
      );
      this.sound = bowlSound.sound;
      this.isPlaying = true;
      this.currentlyPlaying = 'bowl';
      // Store bowl duration
      const bowlStatus = await bowlSound.sound.getStatusAsync();
      AudioService.bowlDuration = bowlStatus.isLoaded ? (bowlStatus.durationMillis || null) : null;
      bowlSound.sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Play the ElevenLabsMatt.mp3 audio immediately after
          const elevenLabsSound = await Audio.Sound.createAsync(
            getAudioSource('ElevenLabsMatt.mp3'),
            {
              shouldPlay: true,
              isLooping: false,
              volume: 1.0,
              rate: 1.0,
            }
          );
          this.sound = elevenLabsSound.sound;
          this.currentlyPlaying = 'main';
          // Store main duration
          const mainStatus = await elevenLabsSound.sound.getStatusAsync();
          AudioService.mainDuration = mainStatus.isLoaded ? (mainStatus.durationMillis || null) : null;
          elevenLabsSound.sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              // Play Tibetan bowl sound again at the end
              this.currentlyPlaying = 'endBowl';
              Audio.Sound.createAsync(
                getAudioSource('TibetanBowlSound1.mp3'),
                {
                  shouldPlay: true,
                  isLooping: false,
                  volume: 0.8,
                  rate: 1.0,
                }
              ).then(({ sound }) => {
                sound.setOnPlaybackStatusUpdate((status) => {
                  if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync();
                  }
                });
              });
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
      if (Platform.OS === 'web') {
        const audio = new window.Audio('/assets/audio/Tibetan Bowl Sound 1.mp3');
        audio.volume = 0.6;
        audio.play();
        audio.onended = () => audio.remove();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        getAudioSource('TibetanBowlSound1.mp3'),
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
      if (Platform.OS === 'web') {
        const audio = new window.Audio('/assets/audio/TibetanBowlSound1.mp3');
        audio.volume = 0.7;
        audio.play();
        audio.onended = () => audio.remove();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        getAudioSource('TibetanBowlSound1.mp3'),
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
    if (Platform.OS === 'web') {
      if (this.webDebugInterval) clearInterval(this.webDebugInterval);
      this.webDebugInterval = null;
      if (this.webBowlAudio) {
        this.webBowlAudio.pause();
        this.webBowlAudio.currentTime = 0;
        this.webBowlAudio = null;
      }
      if (this.webMainAudio) {
        this.webMainAudio.pause();
        this.webMainAudio.currentTime = 0;
        this.webMainAudio = null;
      }
      this.isPlaying = false;
      return;
    }
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
    if (Platform.OS === 'web') {
      if (this.webBowlAudio && !this.webBowlAudio.paused) {
        this.webBowlAudio.pause();
      }
      if (this.webMainAudio && !this.webMainAudio.paused) {
        this.webMainAudio.pause();
      }
      this.isPlaying = false;
      return;
    }
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
    if (Platform.OS === 'web') {
      if (this.webBowlAudio && this.webBowlAudio.paused && this.webBowlAudio.currentTime < this.webBowlAudio.duration) {
        this.webBowlAudio.play();
        this.isPlaying = true;
        return;
      }
      if (this.webMainAudio && this.webMainAudio.paused && this.webMainAudio.currentTime < this.webMainAudio.duration) {
        this.webMainAudio.play();
        this.isPlaying = true;
        return;
      }
      return;
    }
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

  static getCurrentWebAudio(): HTMLAudioElement | null {
    // Prefer main audio if it has started or is not ended
    if (this.webMainAudio && this.webMainAudio.currentTime > 0 && this.webMainAudio.currentTime < this.webMainAudio.duration) {
      console.log('[AudioService] Using webMainAudio', {
        currentTime: this.webMainAudio.currentTime,
        duration: this.webMainAudio.duration,
        paused: this.webMainAudio.paused
      });
      return this.webMainAudio;
    }
    // If bowl audio is still playing or not finished
    if (this.webBowlAudio && this.webBowlAudio.currentTime < this.webBowlAudio.duration) {
      console.log('[AudioService] Using webBowlAudio', {
        currentTime: this.webBowlAudio.currentTime,
        duration: this.webBowlAudio.duration,
        paused: this.webBowlAudio.paused
      });
      return this.webBowlAudio;
    }
    // If main audio exists, use it
    if (this.webMainAudio) {
      console.log('[AudioService] Fallback to webMainAudio', {
        currentTime: this.webMainAudio.currentTime,
        duration: this.webMainAudio.duration,
        paused: this.webMainAudio.paused
      });
      return this.webMainAudio;
    }
    // If bowl audio exists, use it
    if (this.webBowlAudio) {
      console.log('[AudioService] Fallback to webBowlAudio', {
        currentTime: this.webBowlAudio.currentTime,
        duration: this.webBowlAudio.duration,
        paused: this.webBowlAudio.paused
      });
      return this.webBowlAudio;
    }
    console.log('[AudioService] No web audio element found');
    return null;
  }

  static async setPositionAsync(positionMillis: number): Promise<void> {
    if (Platform.OS === 'web') {
      const audio = this.getCurrentWebAudio();
      if (audio) {
        console.log('[AudioService] setPositionAsync', { positionMillis, audio });
        audio.currentTime = positionMillis / 1000;
      }
      return;
    }
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  static async getStatusAsync(): Promise<{ isLoaded: boolean; positionMillis: number; durationMillis: number }> {
    if (Platform.OS === 'web') {
      const audio = this.getCurrentWebAudio();
      let bowlDuration = AudioService.bowlDuration ? AudioService.bowlDuration * 1000 : 0;
      let mainDuration = AudioService.mainDuration ? AudioService.mainDuration * 1000 : 0;
      let positionMillis = 0;
      let durationMillis = bowlDuration + mainDuration + bowlDuration;
      if (audio) {
        if (AudioService.currentlyPlaying === 'bowl') {
          positionMillis = audio.currentTime * 1000;
        } else if (AudioService.currentlyPlaying === 'main') {
          positionMillis = bowlDuration + (audio.currentTime * 1000);
        } else if (AudioService.currentlyPlaying === 'endBowl') {
          positionMillis = bowlDuration + mainDuration + (audio.currentTime * 1000);
        }
        return {
          isLoaded: true,
          positionMillis,
          durationMillis: durationMillis || 1,
        };
      }
      return { isLoaded: false, positionMillis: 0, durationMillis: 1 };
    }
    if (this.sound) {
      const status = await this.sound.getStatusAsync();
      let bowlDuration = AudioService.bowlDuration || 0;
      let mainDuration = AudioService.mainDuration || 0;
      let positionMillis = 0;
      let durationMillis = bowlDuration + mainDuration + bowlDuration;
      if (status.isLoaded) {
        if (AudioService.currentlyPlaying === 'bowl') {
          positionMillis = status.positionMillis;
        } else if (AudioService.currentlyPlaying === 'main') {
          positionMillis = bowlDuration + status.positionMillis;
        } else if (AudioService.currentlyPlaying === 'endBowl') {
          positionMillis = bowlDuration + mainDuration + status.positionMillis;
        }
        return {
          isLoaded: true,
          positionMillis,
          durationMillis: durationMillis || 1,
        };
      } else {
        return { isLoaded: false, positionMillis: 0, durationMillis: 1 };
      }
    }
    return { isLoaded: false, positionMillis: 0, durationMillis: 1 };
  }
}

const getAudioSource = (filename: string) => {
  if (Platform.OS === 'web') {
    return `/assets/audio/${filename}`;
  } else {
    switch (filename) {
      case 'ElevenLabsMatt.mp3':
        return require('../assets/audio/ElevenLabsMatt.mp3');
      case 'TibetanBowlSound1.mp3':
        return require('../assets/audio/TibetanBowlSound1.mp3');
      // Add more cases as needed
      default:
        throw new Error('Unknown audio file');
    }
  }
};