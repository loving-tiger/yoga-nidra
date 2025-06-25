import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[`${size}Button`]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton as ViewStyle);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton as ViewStyle);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton as ViewStyle);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton as ViewStyle);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText as TextStyle);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText as TextStyle);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostText as TextStyle);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText as TextStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
  },
  secondaryButton: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#7C3AED',
  },
  ghostText: {
    color: '#7C3AED',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});