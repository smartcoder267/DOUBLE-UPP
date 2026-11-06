import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type HomeHeaderProps = {
  firstName?: string;
  hasUnreadNotifications?: boolean;
  onNotifications: () => void;
  onProfile: () => void;
};

export function HomeHeader({ firstName, hasUnreadNotifications = false, onNotifications, onProfile }: HomeHeaderProps) {
  const initial = firstName?.trim().charAt(0).toUpperCase() || 'D';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Good day</Text>
        <Text style={styles.name}>{firstName || 'Double Up member'}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityLabel="Open notifications" accessibilityRole="button" hitSlop={8} onPress={onNotifications} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Feather name="bell" size={20} color={colors.black[900]} />
          {hasUnreadNotifications ? <View accessibilityLabel="Unread notifications" style={styles.notificationDot} /> : null}
        </Pressable>
        <Pressable accessibilityLabel="Open profile" accessibilityRole="button" hitSlop={8} onPress={onProfile} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: colors.black[500], fontSize: 13, fontWeight: '700' },
  name: { color: colors.black[950], fontSize: 22, fontWeight: '900', letterSpacing: -0.6, marginTop: spacing.xs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: colors.black[50], alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: radii.pill, backgroundColor: colors.red[600] },
  avatar: { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.97 }] },
});
