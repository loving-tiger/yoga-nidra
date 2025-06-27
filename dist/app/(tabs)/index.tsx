import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated as RNAnimated, Dimensions, Pressable, Modal, View as RNView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedBackground from '@/components/AnimatedBackground';
import { AudioService } from '@/services/AudioService';
import { DEFAULT_ROUTINES } from '@/data/routines';
import { useFocusEffect } from 'expo-router';
import { Pause, Play, Square } from 'lucide-react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import WheelColorPicker from 'react-native-wheel-color-picker';
import { useTheme } from '@/components/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Button from '@/components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
// @ts-ignore
import tinycolor from 'tinycolor2';
import { useAuth } from '@/components/AuthContext';
import { saveAlarmTime } from '@/services/SupabaseService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PROGRESS_BAR_WIDTH = Math.min(220, SCREEN_WIDTH * 0.7);

const PRESET_COLORS = [
  '#A7C7E7', // pastel blue
  '#B5EAD7', // pastel mint
  '#FFDAC1', // pastel peach
  '#E2F0CB', // pastel green
  '#FFB7B2', // pastel pink
  '#C7CEEA', // pastel lavender
  '#FFF1BA', // pastel yellow
  '#D4A5A5', // muted rose
];

function safeTinycolor(color: string) {
  try {
    if (!color || typeof color !== 'string' || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      return tinycolor('#7C3AED');
    }
    return tinycolor(color);
  } catch {
    return tinycolor('#7C3AED');
  }
}

function SkipButton({ direction, onPress, color, backgroundColor }: { direction: 'back' | 'forward'; onPress: () => void; color: string; backgroundColor: string }) {
  // Classic skip icon: two triangles and a bar
  const isBack = direction === 'back';
  return (
    <TouchableOpacity style={[styles.controlButton, { backgroundColor }]} onPress={onPress}>
      <Svg width={36} height={36} viewBox="0 0 36 36">
        {isBack ? (
          <>
            {/* Bar */}
            <Rect x={7} y={10} width={3} height={16} fill={color} rx={1.5} />
            {/* First triangle */}
            <Polygon points="24,10 12,18 24,26" fill={color} />
            {/* Second triangle, slightly to the right */}
            <Polygon points="30,10 18,18 30,26" fill={color} />
          </>
        ) : (
          <>
            {/* Bar */}
            <Rect x={26} y={10} width={3} height={16} fill={color} rx={1.5} />
            {/* First triangle */}
            <Polygon points="12,10 24,18 12,26" fill={color} />
            {/* Second triangle, slightly to the left */}
            <Polygon points="6,10 18,18 6,26" fill={color} />
          </>
        )}
      </Svg>
    </TouchableOpacity>
  );
}

function RestartIcon({ color = '#fff' }) {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36">
      <Rect x={7} y={10} width={3} height={16} fill={color} rx={1.5} />
      <Polygon points="26,10 14,18 26,26" fill={color} />
    </Svg>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function DashboardScreen() {
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<{ x: number; time: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const progressBarRef = useRef<View>(null);
  const lastSeekPosition = useRef<number | null>(null);
  const { themeColor, setThemeColor, lightness, setLightness, colors } = useTheme();
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Hide alarm tab for now
  // const [settingsTab, setSettingsTab] = useState<'color' | 'alarm'>('color');
  const [settingsTab, setSettingsTab] = useState<'color'>('color');

  // Alarm state (hidden for now)
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { session } = useAuth();

  useFocusEffect(
    useCallback(() => {
      return () => setShowControls(false);
    }, [])
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (showControls && !isSeeking) {
      interval = setInterval(async () => {
        const status = await AudioService.getStatusAsync();
        // console.log('[Progress Poll]', status);
        if (status.isLoaded) {
          setProgress(status.positionMillis);
          setDuration(status.durationMillis || 1);
        }
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showControls, isSeeking]);

  useEffect(() => {
    AudioService.initializeAudio();
  }, []);

  const handleArise = async () => {
    setIsLoading(true);
    try {
      const success = await AudioService.playRoutine(DEFAULT_ROUTINES[0]);
      if (success) {
        setShowControls(true);
        setIsPlaying(true);
        setProgress(0);
        setDuration(1);
      } else {
        alert('Failed to start audio.');
      }
    } catch (error) {
      alert('Error starting routine: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePausePlay = async () => {
    setIsLoading(true);
    try {
      if (isPlaying) {
        await AudioService.pauseAudio();
        setIsPlaying(false);
      } else {
        await AudioService.resumeAudio();
        setIsPlaying(true);
      }
    } catch (error) {
      alert('Error toggling play/pause: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = async () => {
    setIsLoading(true);
    try {
      await AudioService.stopAudio();
      setIsPlaying(true);
      setProgress(0);
      const success = await AudioService.playRoutine(DEFAULT_ROUTINES[0]);
      if (!success) {
        alert('Failed to restart audio.');
      }
    } catch (error) {
      alert('Error restarting routine: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = async (seconds: number) => {
    const status = await AudioService.getStatusAsync();
    if (status.isLoaded && typeof status.durationMillis === 'number') {
      let newPosition = status.positionMillis + seconds * 1000;
      newPosition = Math.max(0, Math.min(newPosition, status.durationMillis));
      await AudioService.setPositionAsync(newPosition);
      setProgress(newPosition);
    }
  };

  const handleStop = async () => {
    await AudioService.stopAudio();
    setShowControls(false);
    setIsPlaying(false);
    setProgress(0);
  };

  // --- Custom Web Progress Bar Handlers ---
  // These handlers allow click and drag on the progress bar for web.
  const [webDragging, setWebDragging] = useState(false);
  const [webDragX, setWebDragX] = useState<number | null>(null);

  // Helper to get percent from mouse event
  const getWebBarPercent = (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const percent = Math.max(0, Math.min(x, PROGRESS_BAR_WIDTH)) / PROGRESS_BAR_WIDTH;
    return percent;
  };

  // Mouse down: start drag and set position
  const handleWebBarMouseDown = async (evt: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (duration <= 1) return;
    setWebDragging(true);
    const percent = getWebBarPercent(evt);
    const newPosition = percent * duration;
    setProgress(newPosition);
    setIsSeeking(true);
    setWebDragX(percent * PROGRESS_BAR_WIDTH);
    await AudioService.setPositionAsync(newPosition);
    // Add mousemove/mouseup listeners to window for drag
    window.addEventListener('mousemove', handleWebBarMouseMove);
    window.addEventListener('mouseup', handleWebBarMouseUp);
  };

  // Mouse move: update preview and progress
  const handleWebBarMouseMove = async (evt: MouseEvent) => {
    if (!webDragging || duration <= 1) return;
    // Find the progress bar element
    const bar = document.getElementById('web-progress-bar');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const percent = Math.max(0, Math.min(x, PROGRESS_BAR_WIDTH)) / PROGRESS_BAR_WIDTH;
    const newPosition = percent * duration;
    setProgress(newPosition);
    setWebDragX(percent * PROGRESS_BAR_WIDTH);
    setIsSeeking(true);
    // Don't set position on every move, only on mouse up
  };

  // Mouse up: finish drag and set position
  const handleWebBarMouseUp = async (evt: MouseEvent) => {
    if (!webDragging || duration <= 1) return;
    setWebDragging(false);
    setIsSeeking(false);
    setWebDragX(null);
    // Find the progress bar element
    const bar = document.getElementById('web-progress-bar');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const percent = Math.max(0, Math.min(x, PROGRESS_BAR_WIDTH)) / PROGRESS_BAR_WIDTH;
    const newPosition = percent * duration;
    setProgress(newPosition);
    await AudioService.setPositionAsync(newPosition);
    // Remove listeners
    window.removeEventListener('mousemove', handleWebBarMouseMove);
    window.removeEventListener('mouseup', handleWebBarMouseUp);
  };

  // --- End Custom Web Progress Bar Handlers ---

  const ProgressBarComponent = Platform.OS === 'web' ? (
    <div
      id="web-progress-bar"
      style={{
        width: PROGRESS_BAR_WIDTH,
        height: 32,
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
      onMouseDown={handleWebBarMouseDown}
      // No onMouseMove/onMouseUp here, handled globally for drag
    >
      <div
        style={{
          height: 8,
          width: PROGRESS_BAR_WIDTH,
          backgroundColor: colors.card,
          borderRadius: 6,
          margin: '0 10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 8,
            backgroundColor: colors.button,
            borderRadius: 6,
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${((progress / duration) * PROGRESS_BAR_WIDTH) || 0}px`,
            transition: webDragging ? 'none' : 'width 0.1s',
          }}
        />
      </div>
      {/* Seek callout on drag */}
      {webDragging && webDragX !== null && (
        <div
          style={{
            position: 'absolute',
            left: webDragX - 30,
            bottom: 36,
            width: 60,
            height: 28,
            backgroundColor: colors.card,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            border: `1px solid ${colors.button}`,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(88,28,135,0.15)',
          }}
        >
          <span style={{ color: colors.text, fontWeight: 600, fontSize: 13 }}>
            {formatTime(progress)}
          </span>
        </div>
      )}
    </div>
  ) : (
    <Pressable
      style={styles.progressTouchArea}
      onPress={async (evt) => {
        if (duration > 1) {
          const { locationX } = evt.nativeEvent;
          const x = Math.max(0, Math.min(locationX, PROGRESS_BAR_WIDTH));
          const percent = x / PROGRESS_BAR_WIDTH;
          const newPosition = percent * duration;
          setProgress(newPosition);
          await AudioService.setPositionAsync(newPosition);
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
        if (duration > 1) {
          const { locationX } = evt.nativeEvent;
          const x = Math.max(0, Math.min(locationX, PROGRESS_BAR_WIDTH));
          const percent = x / PROGRESS_BAR_WIDTH;
          const newPosition = percent * duration;
          setProgress(newPosition);
          await AudioService.setPositionAsync(newPosition);
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
      <View style={[styles.progressBar, { backgroundColor: colors.card }] }>
        <View style={[styles.progressFill, { backgroundColor: colors.button, width: (progress / duration) * PROGRESS_BAR_WIDTH }]} />
      </View>
      {isSeeking && seekPreview && (
        <View style={[styles.seekCallout, { left: seekPreview.x - 30, backgroundColor: colors.card, borderColor: colors.button }]}> 
          <Text style={[styles.seekCalloutText, { color: colors.text }]}>{formatTime(seekPreview.time)}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedBackground color={themeColor} />
      {!showControls && (
        <TouchableOpacity 
          style={[styles.ariseButton, { backgroundColor: colors.button + '22', borderColor: colors.button }]}
          onPress={handleArise}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={[styles.ariseText, { color: colors.button }]}>{isLoading ? 'Loading...' : 'Arise'}</Text>
        </TouchableOpacity>
      )}
      {showControls && (
        <View style={styles.centeredControlsWrapper}>
          <View style={styles.controlsRow}>
            <SkipButton direction="back" onPress={() => handleSeek(-15)} color={colors.buttonText} backgroundColor={colors.button} />
            <SkipButton direction="forward" onPress={() => handleSeek(15)} color={colors.buttonText} backgroundColor={colors.button} />
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.button }]} onPress={handlePausePlay} disabled={isLoading}>
              {isPlaying ? <Pause size={24} color={colors.buttonText} /> : <Play size={24} color={colors.buttonText} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.button }]} onPress={handleStartOver} disabled={isLoading}>
              <RestartIcon color={colors.buttonText} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.stopButton, { backgroundColor: colors.button }]} onPress={handleStop}>
              <Square size={24} color={colors.buttonText} />
            </TouchableOpacity>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Text style={[styles.progressTime, { color: colors.text }]}>{formatTime(progress)}</Text>
            <View style={styles.progressBarWrapper}>
              {ProgressBarComponent}
            </View>
            <Text style={[styles.progressTime, { color: colors.text }]}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}

      {/* Floating Color Wheel Button */}
      <RNView style={styles.fabContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.button }]}
          onPress={() => setColorModalVisible(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="cog" size={28} color={colors.buttonText} />
        </TouchableOpacity>
      </RNView>

      {/* Color Picker Modal */}
      <Modal
        visible={colorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setColorModalVisible(false)}
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Tab Switcher */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: settingsTab === 'color' ? themeColor : 'transparent',
                  alignItems: 'center',
                }}
                onPress={() => setSettingsTab('color')}
              >
                <Text style={{ color: settingsTab === 'color' ? themeColor : colors.text, fontWeight: '600' }}>Color</Text>
              </TouchableOpacity>
              {/* 
              // Hide the Alarm tab for now, but keep the code for future use
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: settingsTab === 'alarm' ? themeColor : 'transparent',
                  alignItems: 'center',
                }}
                onPress={() => setSettingsTab('alarm')}
              >
                <Text style={{ color: settingsTab === 'alarm' ? themeColor : colors.text, fontWeight: '600' }}>Alarm</Text>
              </TouchableOpacity>
              */}
            </View>
            {/* Tab Content */}
            {settingsTab === 'color' ? (
              <>
                <Text style={{
                  color: '#111',
                  fontWeight: '700',
                  marginBottom: 16,
                  textAlign: 'center',
                  fontSize: 20,
                  letterSpacing: 0.5,
                }}>
                  Choose a Theme Color
                </Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  {PRESET_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: color,
                        margin: 8,
                        borderWidth: themeColor === color ? 3 : 1,
                        borderColor: themeColor === color ? '#111' : '#ccc',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: color,
                        shadowOpacity: themeColor === color ? 0.3 : 0.1,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                      }}
                      onPress={() => setThemeColor(color)}
                      activeOpacity={0.8}
                    >
                      {themeColor === color && (
                        <Text style={{ color: '#111', fontWeight: 'bold', fontSize: 18 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <Button
                  title="Done"
                  onPress={() => setColorModalVisible(false)}
                  color={colors.button}
                  textColor={colors.buttonText}
                  style={{ marginTop: 8 }}
                />
              </>
            ) : (
              // Hide the alarm tab content for now, but keep the code for future use
              /*
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <Text style={{
                  color: '#111',
                  fontWeight: '700',
                  marginBottom: 16,
                  textAlign: 'center',
                  fontSize: 20,
                  letterSpacing: 0.5,
                }}>
                  Set Alarm Time
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: themeColor,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 16,
                  }}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={{ color: '#111', fontWeight: '600' }}>
                    {alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={alarmTime}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={(event: any, selectedDate: Date | undefined) => {
                      setShowTimePicker(false);
                      if (selectedDate) setAlarmTime(selectedDate);
                    }}
                  />
                )}
                <Button
                  title="Save Alarm Time"
                  onPress={async () => {
                    if (!session?.user?.id) {
                      alert('You must be logged in to save alarm time.');
                      return;
                    }
                    try {
                      await saveAlarmTime(session.user.id, alarmTime);
                      alert('Alarm time saved!');
                      setColorModalVisible(false);
                    } catch (error: any) {
                      let message = 'Failed to save alarm time.';
                      if (error?.message) message += '\n' + error.message;
                      if (error?.details) message += '\n' + error.details;
                      else if (typeof error === 'object') message += '\n' + JSON.stringify(error);
                      alert(message);
                    }
                  }}
                  color={colors.button}
                  textColor={colors.buttonText}
                  style={{ marginTop: 8 }}
                />
              </View>
              */
              null
            )}
          </RNView>
        </RNView>
      </Modal>
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
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
}); 