import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HomeHeader } from '../../features/home/HomeHeader';
import { QuickActions } from '../../features/home/QuickActions';
import { RecentActivity } from '../../features/home/RecentActivity';
import type { HomeActionId, HomeActivity } from '../../features/home/types';
import { WalletBalancePanel } from '../../features/home/WalletBalancePanel';
import { colors, spacing } from '../../theme/tokens';

type HomeScreenProps = {
  firstName?: string;
  balance: number | null;
  currency?: string;
  walletStatus?: string;
  activity: HomeActivity[];
  activityLoading?: boolean;
  activityError?: string;
  hasUnreadNotifications?: boolean;
  onAction: (action: HomeActionId) => void;
  onActivity: (activity: HomeActivity) => void;
  onActivityRetry: () => void;
  onViewAllActivity: () => void;
  onNotifications: () => void;
  onProfile: () => void;
};

export function HomeScreen(props: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <HomeHeader firstName={props.firstName} hasUnreadNotifications={props.hasUnreadNotifications} onNotifications={props.onNotifications} onProfile={props.onProfile} />
      <WalletBalancePanel balance={props.balance} currency={props.currency} walletStatus={props.walletStatus} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Move your money</Text>
        <QuickActions onAction={props.onAction} />
      </View>

      <RecentActivity activity={props.activity} loading={props.activityLoading} error={props.activityError} onRetry={props.onActivityRetry} onViewAll={props.onViewAllActivity} onActivity={props.onActivity} />
      <Text style={styles.disclaimer}>Double Up prototype · Test funds only</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.xl },
  section: { gap: spacing.lg },
  sectionTitle: { color: colors.black[950], fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  disclaimer: { color: colors.black[400], fontSize: 10, textAlign: 'center' },
});
