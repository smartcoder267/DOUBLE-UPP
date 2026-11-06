import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';
import type { HomeActivity } from './types';

type RecentActivityProps = {
  title?: string;
  showViewAll?: boolean;
  activity: HomeActivity[];
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  onViewAll: () => void;
  onActivity: (activity: HomeActivity) => void;
};

export function RecentActivity({ title = 'Recent activity', showViewAll = true, activity, loading = false, error, onRetry, onViewAll, onActivity }: RecentActivityProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll ? <Pressable accessibilityRole="button" onPress={onViewAll} hitSlop={8}><Text style={styles.viewAll}>View all</Text></Pressable> : null}
      </View>

      {loading ? (
        <View accessibilityLiveRegion="polite" style={styles.messagePanel}><Text style={styles.messageTitle}>Loading activity</Text><Text style={styles.messageText}>Getting your latest wallet activity.</Text></View>
      ) : error ? (
        <View accessibilityRole="alert" style={styles.messagePanel}>
          <Text style={styles.messageTitle}>Activity is unavailable</Text>
          <Text style={styles.messageText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : activity.length === 0 ? (
        <View style={styles.messagePanel}>
          <View style={styles.emptyIcon}><Feather name="inbox" size={21} color={colors.black[500]} /></View>
          <Text style={styles.messageTitle}>No activity yet</Text>
          <Text style={styles.messageText}>Your completed, pending and failed transactions will appear here.</Text>
        </View>
      ) : activity.slice(0, 3).map((item) => (
        <Pressable key={item.id} accessibilityRole="button" onPress={() => onActivity(item)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={[styles.activityIcon, item.direction === 'credit' && styles.creditIcon]}>
            <Feather name={item.direction === 'credit' ? 'arrow-down-left' : 'arrow-up-right'} size={18} color={item.direction === 'credit' ? colors.black[700] : colors.red[600]} />
          </View>
          <View style={styles.activityCopy}>
            <Text numberOfLines={1} style={styles.activityTitle}>{item.title}</Text>
            <Text numberOfLines={1} style={styles.activityDescription}>{item.description} · {item.timestampLabel}</Text>
          </View>
          <View style={styles.amountBlock}>
            <Text style={[styles.activityAmount, item.direction === 'credit' && styles.creditAmount]}>{item.direction === 'credit' ? '+' : '−'} P {item.amount.toFixed(2)}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  title: { color: colors.black[950], fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  viewAll: { color: colors.red[600], fontSize: 12, fontWeight: '900' },
  messagePanel: { borderRadius: radii.lg, backgroundColor: colors.black[50], padding: spacing.lg, alignItems: 'center', gap: spacing.xs },
  emptyIcon: { width: 44, height: 44, borderRadius: radii.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  messageTitle: { color: colors.black[900], fontSize: 14, fontWeight: '900' },
  messageText: { color: colors.black[500], fontSize: 12, lineHeight: 18, textAlign: 'center' },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  retryText: { color: colors.red[600], fontSize: 12, fontWeight: '900' },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  activityIcon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.red[50], alignItems: 'center', justifyContent: 'center' },
  creditIcon: { backgroundColor: colors.black[50] },
  activityCopy: { flex: 1, gap: spacing.xs },
  activityTitle: { color: colors.black[900], fontSize: 13, fontWeight: '900' },
  activityDescription: { color: colors.black[400], fontSize: 11 },
  amountBlock: { alignItems: 'flex-end', gap: spacing.xs },
  activityAmount: { color: colors.black[900], fontSize: 12, fontWeight: '900' },
  creditAmount: { color: colors.black[900] },
  status: { color: colors.black[400], fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  pressed: { opacity: 0.72 },
});
