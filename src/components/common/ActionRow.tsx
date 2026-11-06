import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, radii, spacing } from '../../theme/tokens';

type ActionRowProps = {
  icon: ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  onPress: () => void;
};

export function ActionRow({ icon, title, description, onPress }: ActionRowProps) {
  return (
    <Pressable accessibilityLabel={title} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}><Feather name={icon} size={22} color={colors.red[600]} /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.black[300]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 88, borderRadius: radii.lg, backgroundColor: colors.black[50], padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.black[950], fontSize: 15, fontWeight: '900' },
  description: { color: colors.black[500], fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
