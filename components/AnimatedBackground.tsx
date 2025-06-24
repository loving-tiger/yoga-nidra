import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 0.33, 0.66, 1],
      ['#F3E8FF', '#E9D5FF', '#DDD6FE', '#C4B5FD']
    );

    return {
      backgroundColor,
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = 0.3 + animationProgress.value * 0.4;
    return { opacity };
  });

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
});