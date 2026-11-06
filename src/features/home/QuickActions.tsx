import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';
import type { HomeAction, HomeActionId } from './types';

const actions: HomeAction[] = [
  { id: 'send', label: 'Send', icon: 'arrow-up-right' },
  { id: 'pay', label: 'Pay', icon: 'maximize' },
  { id: 'receive', label: 'Receive', icon: 'arrow-down-left' },
  { id: 'deposit', label: 'Deposit', icon: 'plus' },
  { id: 'withdraw', label: 'Withdraw', icon: 'download' },
];

type QuickActionsProps = { onAction: (action: HomeActionId) => void };

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <Pressable key={action.id} accessibilityLabel={action.label} accessibilityRole="button" onPress={() => onAction(action.id)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <View style={[styles.iconCircle, index === 0 && styles.primaryIcon]}>
            <Feather name={action.icon} size={21} color={index === 0 ? colors.white : colors.black[900]} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row' },
  action: { flex: 1, minWidth: 0, alignItems: 'center', gap: spacing.sm, minHeight: 82 },
  iconCircle: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.black[50], alignItems: 'center', justifyContent: 'center' },
  primaryIcon: { backgroundColor: colors.red[600] },
  label: { color: colors.black[800], fontSize: 11, fontWeight: '800' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
