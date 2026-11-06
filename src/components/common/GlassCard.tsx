import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme/tokens';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'light' | 'dark' | 'red';
};

export function GlassCard({ children, style, tone = 'light' }: GlassCardProps) {
  return <View style={[styles.base, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card,
  },
  light: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(255,255,255,0.92)',
  },
  dark: {
    backgroundColor: 'rgba(11,11,12,0.92)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  red: {
    backgroundColor: colors.red[600],
    borderColor: colors.red[400],
  },
});

