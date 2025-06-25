import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, processColor } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  // withDelay, // 未使用，移除
} from 'react-native-reanimated';
import { useTheme } from './ThemeContext';
import tinycolor from 'tinycolor2';

const { width, height } = Dimensions.get('window');

const toRgba = (hex: string, alpha: number) =>
  tinycolor(hex).setAlpha(alpha).toRgbString(); // "rgba(124,58,237,0.4)"

function isValidHex(color: string) {
  return /^#([0-9A-F]{6})$/i.test(color);
}

export default function AnimatedBackground() {
  const { themeColor } = useTheme();
  // iOS Expo 上 interpolateColor 可能会崩溃，做平台兼容处理
  const animationProgress = useSharedValue(0);

  // 气泡动画
  const bubble1X = useSharedValue(width * 0.2);
  const bubble1Y = useSharedValue(height * 0.8);
  const bubble1Scale = useSharedValue(0.8);

  const bubble2X = useSharedValue(width * 0.8);
  const bubble2Y = useSharedValue(height * 0.3);
  const bubble2Scale = useSharedValue(1.2);

  const bubble3X = useSharedValue(width * 0.1);
  const bubble3Y = useSharedValue(height * 0.4);
  const bubble3Scale = useSharedValue(0.6);

  const bubble4X = useSharedValue(width * 0.7);
  const bubble4Y = useSharedValue(height * 0.7);
  const bubble4Scale = useSharedValue(1.0);

  useEffect(() => {
    // 背景动画
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );

    // 气泡动画
    bubble1X.value = withRepeat(
      withTiming(width * 0.8, { duration: 12000 }),
      -1,
      true
    );
    bubble1Y.value = withRepeat(
      withTiming(height * 0.2, { duration: 15000 }),
      -1,
      true
    );
    bubble1Scale.value = withRepeat(
      withTiming(1.2, { duration: 4000 }),
      -1,
      true
    );

    bubble2X.value = withRepeat(
      withTiming(width * 0.2, { duration: 18000 }),
      -1,
      true
    );
    bubble2Y.value = withRepeat(
      withTiming(height * 0.8, { duration: 12000 }),
      -1,
      true
    );
    bubble2Scale.value = withRepeat(
      withTiming(0.8, { duration: 6000 }),
      -1,
      true
    );

    bubble3X.value = withRepeat(
      withTiming(width * 0.9, { duration: 20000 }),
      -1,
      true
    );
    bubble3Y.value = withRepeat(
      withTiming(height * 0.6, { duration: 10000 }),
      -1,
      true
    );
    bubble3Scale.value = withRepeat(
      withTiming(1.0, { duration: 5000 }),
      -1,
      true
    );

    bubble4X.value = withRepeat(
      withTiming(width * 0.3, { duration: 16000 }),
      -1,
      true
    );
    bubble4Y.value = withRepeat(
      withTiming(height * 0.1, { duration: 14000 }),
      -1,
      true
    );
    bubble4Scale.value = withRepeat(
      withTiming(0.7, { duration: 7000 }),
      -1,
      true
    );
  }, []);

  // Use static colors for animated background
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 0.33, 0.66, 1],
      ['#F3E8FF', '#E9D5FF', '#DDD6FE', '#C4B5FD']
    );
    return { backgroundColor };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = 0.3 + animationProgress.value * 0.4;
    return { opacity };
  });

  const bubble1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubble1X.value },
      { translateY: bubble1Y.value },
      { scale: bubble1Scale.value },
    ],
  }));

  const bubble2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubble2X.value },
      { translateY: bubble2Y.value },
      { scale: bubble2Scale.value },
    ],
  }));

  const bubble3Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubble3X.value },
      { translateY: bubble3Y.value },
      { scale: bubble3Scale.value },
    ],
  }));

  const bubble4Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubble4X.value },
      { translateY: bubble4Y.value },
      { scale: bubble4Scale.value },
    ],
  }));

  // Bubble colors (static)
  const bubbleColors = [
    'rgba(147, 51, 234, 0.3)',
    'rgba(168, 85, 247, 0.4)',
    'rgba(196, 181, 253, 0.3)',
    'rgba(124, 58, 237, 0.2)',
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, animatedStyle]} />
      <Animated.View style={[styles.gradientContainer, gradientStyle]}>
        <LinearGradient
          colors={['rgba(147, 51, 234, 0.1)', 'rgba(168, 85, 247, 0.2)', 'rgba(196, 181, 253, 0.1)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      {/* Floating bubbles */}
      <Animated.View style={[styles.bubble, { backgroundColor: bubbleColors[0], width: 120, height: 120 }, bubble1Style]} />
      <Animated.View style={[styles.bubble, { backgroundColor: bubbleColors[1], width: 80, height: 80 }, bubble2Style]} />
      <Animated.View style={[styles.bubble, { backgroundColor: bubbleColors[2], width: 60, height: 60 }, bubble3Style]} />
      <Animated.View style={[styles.bubble, { backgroundColor: bubbleColors[3], width: 100, height: 100 }, bubble4Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    flex: 1,
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.6,
  },
  bubble1: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  bubble2: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(168, 85, 247, 0.4)',
  },
  bubble3: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(196, 181, 253, 0.3)',
  },
  bubble4: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
});