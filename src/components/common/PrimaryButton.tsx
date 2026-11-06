import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme/tokens';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'red' | 'black' | 'light';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'red',
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const unavailable = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        unavailable && styles.disabled,
        pressed && !unavailable && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'light' ? colors.black[900] : colors.white} /> : <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  red: { backgroundColor: colors.red[600] },
  black: { backgroundColor: colors.black[900] },
  light: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.black[100] },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  redLabel: { color: colors.white },
  blackLabel: { color: colors.white },
  lightLabel: { color: colors.black[900] },
  disabled: { opacity: 0.48 },
  pressed: { transform: [{ scale: 0.985 }] },
});

