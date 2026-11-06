import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, shadows, spacing } from '../../../theme/tokens';
import type { InAppNotification } from '../types';

type InAppNotificationBannerProps = {
  notification: InAppNotification;
  onClose: () => void;
  onOpen: () => void;
};

export function InAppNotificationBanner({ notification, onClose, onOpen }: InAppNotificationBannerProps) {
  const translateY = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }).start();
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose, translateY]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }] }>
      <Pressable accessibilityLabel={`${notification.title}. ${notification.body}`} accessibilityRole="button" onPress={onOpen} style={styles.main}>
        <View style={styles.icon}><Feather name={notification.event_type === 'payment_received' ? 'arrow-down-left' : 'check'} size={21} color={colors.white} /></View>
        <View style={styles.copy}><Text style={styles.title}>{notification.title}</Text><Text numberOfLines={2} style={styles.body}>{notification.body}</Text></View>
      </Pressable>
      <Pressable accessibilityLabel="Dismiss notification" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.close}><Feather name="x" size={18} color={colors.black[500]} /></Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', zIndex: 20, top: spacing.sm, left: spacing.md, right: spacing.md, minHeight: 82, borderRadius: radii.lg, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', ...shadows.card },
  main: { flex: 1, minHeight: 82, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 46, height: 46, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: spacing.xs },
  title: { color: colors.black[950], fontSize: 13, fontWeight: '900' },
  body: { color: colors.black[500], fontSize: 11, lineHeight: 16 },
  close: { width: 44, height: 82, alignItems: 'center', justifyContent: 'center' },
});
