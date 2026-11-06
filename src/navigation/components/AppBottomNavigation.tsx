import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, shadows, spacing } from '../../theme/tokens';
import type { NavigationItem } from '../types';

type AppBottomNavigationProps<TId extends string> = {
  activeId: TId;
  items: readonly NavigationItem<TId>[];
  onChange: (id: TId) => void;
};

export function AppBottomNavigation<TId extends string>({ activeId, items, onChange }: AppBottomNavigationProps<TId>) {
  return (
    <View accessibilityLabel="Main navigation" accessibilityRole="tablist" style={styles.container}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Feather name={item.icon} size={19} color={active ? colors.white : colors.black[400]} />
            </View>
            <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    minHeight: 76,
    marginHorizontal: spacing.md,
    marginBottom: Platform.OS === 'android' ? spacing.xxl : spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 28,
    backgroundColor: colors.white,
    flexDirection: 'row',
    ...shadows.card,
  },
  tab: { flex: 1, minWidth: 0, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  iconWrap: { width: 34, height: 30, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.red[600] },
  label: { color: colors.black[400], fontSize: 9, fontWeight: '800' },
  labelActive: { color: colors.red[600] },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
