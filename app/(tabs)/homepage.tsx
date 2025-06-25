import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated as RNAnimated, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/AnimatedBackground';
import { AudioService } from '@/services/AudioService';
import { DEFAULT_ROUTINES } from '@/data/routines';
import { useFocusEffect } from 'expo-router';
import { Pause, Play, Square } from 'lucide-react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PROGRESS_BAR_WIDTH = Math.min(220, SCREEN_WIDTH * 0.7);

function SkipButton({ direction, onPress }: { direction: 'back' | 'forward'; onPress: () => void }) {
  // Classic skip icon: two triangles and a bar
  const isBack = direction === 'back';
  return (
    <TouchableOpacity style={styles.controlButton} onPress={onPress}>
      <Svg width={36} height={36} viewBox="0 0 36 36">
        {isBack ? (
          <>
            {/* Bar */}
            <Rect x={7} y={10} width={3} height={16} fill="#fff" rx={1.5} />
            {/* First triangle */}
            <Polygon points="24,10 12,18 24,26" fill="#fff" />
            {/* Second triangle, slightly to the right */}
            <Polygon points="30,10 18,18 30,26" fill="#fff" />
          </>
        ) : (
          <>
            {/* Bar */}
            <Rect x={26} y={10} width={3} height={16} fill="#fff" rx={1.5} />
            {/* First triangle */}
            <Polygon points="12,10 24,18 12,26" fill="#fff" />
            {/* Second triangle, slightly to the left */}
            <Polygon points="6,10 18,18 6,26" fill="#fff" />
          </>
        )}
      </Svg>
    </TouchableOpacity>
  );
}

function RestartIcon() {
  // Single left-pointing triangle with a vertical bar (classic skip to start)
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36">
      {/* Bar at the left edge */}
      <Rect x={7} y={10} width={3} height={16} fill="#fff" rx={1.5} />
      {/* Triangle */}
      <Polygon points="26,10 14,18 26,26" fill="#fff" />
    </Svg>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function HomepageScreen() {
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<{ x: number; time: number } | null>(null);
  const progressBarRef = useRef<View>(null);
  const lastSeekPosition = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => setShowControls(false);
    }, [])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (showControls && !isSeeking) {
      interval = setInterval(async () => {
        if (AudioService['sound']) {
          const status = await AudioService['sound'].getStatusAsync();
          if (status.isLoaded) {
            setProgress(status.positionMillis);
            setDuration(status.durationMillis || 1);
          }
        }
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showControls, isSeeking]);

  const handleArise = async () => {
    try {
      setShowControls(true);
      setIsPlaying(true);
      setProgress(0);
      setDuration(1);
      await AudioService.playRoutine(DEFAULT_ROUTINES[0]);
    } catch (error) {
      console.error('Error starting routine:', error);
    }
  };

  const handlePausePlay = async () => {
    if (isPlaying) {
      await AudioService.pauseAudio();
      setIsPlaying(false);
    } else {
      await AudioService.resumeAudio();
      setIsPlaying(true);
    }
  };

  const handleStartOver = async () => {
    await AudioService.stopAudio();
    setIsPlaying(true);
    setProgress(0);
    await AudioService.playRoutine(DEFAULT_ROUTINES[0]);
  };

  const handleSeek = async (seconds: number) => {
    if (AudioService['sound']) {
      const status = await AudioService['sound'].getStatusAsync();
      if (status.isLoaded && typeof status.durationMillis === 'number') {
        let newPosition = status.positionMillis + seconds * 1000;
        newPosition = Math.max(0, Math.min(newPosition, status.durationMillis));
        await AudioService['sound'].setPositionAsync(newPosition);
        setProgress(newPosition);
      }
    }
  };

  const handleStop = async () => {
    await AudioService.stopAudio();
    setShowControls(false);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      {!showControls && (
        <TouchableOpacity 
          style={styles.ariseButton} 
          onPress={handleArise}
          activeOpacity={0.8}
        >
          <Text style={styles.ariseText}>Arise</Text>
        </TouchableOpacity>
      )}
      {showControls && (
        <View style={styles.centeredControlsWrapper}>
          <View style={styles.controlsRow}>
            <SkipButton direction="back" onPress={() => handleSeek(-15)} />
            <SkipButton direction="forward" onPress={() => handleSeek(15)} />
            <TouchableOpacity style={styles.controlButton} onPress={handlePausePlay}>
              {isPlaying ? <Pause size={24} color="#fff" /> : <Play size={24} color="#fff" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleStartOver}>
              <RestartIcon />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={handleStop}>
              <Square size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Text style={styles.progressTime}>{formatTime(progress)}</Text>
            <View style={styles.progressBarWrapper}>
              <Pressable
                style={styles.progressTouchArea}
                onPress={async (evt) => {
                  if (duration > 1 && AudioService['sound']) {
                    const { locationX } = evt.nativeEvent;
                    const x = Math.max(0, Math.min(locationX, PROGRESS_BAR_WIDTH));
                    const percent = x / PROGRESS_BAR_WIDTH;
                    const newPosition = percent * duration;
                    setProgress(newPosition);
                    await AudioService['sound'].setPositionAsync(newPosition);
                  }
                }}
                onPressIn={(evt: any) => {
                  if (duration > 1) {
                    const { locationX } = evt.nativeEvent;
                    const x = Math.max(0, Math.min(locationX, PROGRESS_BAR_WIDTH));
                    const percent = x / PROGRESS_BAR_WIDTH;
                    const previewTime = percent * duration;
                    setIsSeeking(true);
                    setSeekPreview({ x, time: previewTime });
                  }
                }}
                onPressOut={async (evt: any) => {
                  setIsSeeking(false);
                  setSeekPreview(null);
                  if (duration > 1 && AudioService['sound']) {
                    const { locationX } = evt.nativeEvent;
                    const x = Math.max(0, Math.min(locationX, PROGRESS_BAR_WIDTH));
                    const percent = x / PROGRESS_BAR_WIDTH;
                    const newPosition = percent * duration;
                    setProgress(newPosition);
                    await AudioService['sound'].setPositionAsync(newPosition);
                  }
                }}
                onTouchMove={(evt: any) => {
                  if (duration > 1) {
                    const touch = evt.nativeEvent.touches[0];
                    if (!touch) return;
                    const x = Math.max(0, Math.min(touch.locationX, PROGRESS_BAR_WIDTH));
                    const percent = x / PROGRESS_BAR_WIDTH;
                    const previewTime = percent * duration;
                    setSeekPreview({ x, time: previewTime });
                  }
                }}
              >
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: (progress / duration) * PROGRESS_BAR_WIDTH }]} />
                </View>
                {isSeeking && seekPreview && (
                  <View style={[styles.seekCallout, { left: seekPreview.x - 30 }]}> 
                    <Text style={styles.seekCalloutText}>{formatTime(seekPreview.time)}</Text>
                  </View>
                )}
              </Pressable>
            </View>
            <Text style={styles.progressTime}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ariseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  ariseText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#581C87',
    letterSpacing: 2,
  },
  centeredControlsWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    borderRadius: 40,
    padding: 4,
  },
  controlButton: {
    backgroundColor: 'rgba(88, 28, 135, 0.55)', // dark purple, translucent
    borderRadius: 27,
    padding: 11,
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#581C87',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    backdropFilter: 'blur(8px)',
    width: 48,
    height: 48,
  },
  stopButton: {
    backgroundColor: 'rgba(88, 28, 135, 0.85)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    width: '90%',
    maxWidth: 380,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  progressBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    maxWidth: PROGRESS_BAR_WIDTH,
  },
  progressTouchArea: {
    width: PROGRESS_BAR_WIDTH,
    height: 32, // much larger for touch
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressBar: {
    height: 8,
    width: PROGRESS_BAR_WIDTH,
    backgroundColor: 'rgba(88, 28, 135, 0.18)',
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressTime: {
    color: '#581C87',
    fontWeight: '600',
    fontSize: 13,
    width: 38,
    textAlign: 'center',
  },
  seekCallout: {
    position: 'absolute',
    bottom: 36,
    width: 60,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#581C87',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#7C3AED',
    zIndex: 10,
  },
  seekCalloutText: {
    color: '#581C87',
    fontWeight: '600',
    fontSize: 13,
  },
}); 