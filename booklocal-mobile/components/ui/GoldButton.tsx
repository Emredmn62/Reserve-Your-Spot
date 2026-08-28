import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, FONTS, SPACING } from '../../constants/AppConstants';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GoldButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  size = 'lg',
  style,
  textStyle,
}: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[`size_${size}`],
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? COLORS.black : COLORS.gold} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`textSize_${size}`],
            variant === 'outlined' && styles.textOutlined,
            variant === 'ghost' && styles.textGhost,
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  size_sm: { height: 36, paddingHorizontal: SPACING.md },
  size_md: { height: 44, paddingHorizontal: SPACING.lg },
  size_lg: { height: 54, paddingHorizontal: SPACING.lg },
  filled: { backgroundColor: COLORS.gold },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.gold,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.45 },
  text: {
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
  textOutlined: { color: COLORS.gold },
  textGhost: { color: COLORS.gold },
  textDisabled: {},
});
