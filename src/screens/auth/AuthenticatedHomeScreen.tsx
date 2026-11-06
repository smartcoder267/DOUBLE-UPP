import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { Feather } from '@expo/vector-icons';
import { FeaturePreviewSheet } from '../../components/feedback/FeaturePreviewSheet';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { loadAccountSummary, type LedgerEntrySummary, type ProfileSummary, type WalletSummary } from '../../features/account/accountService';
import type { HomeActionId, HomeActivity } from '../../features/home/types';
import { InAppNotificationBanner } from '../../features/payments/components/InAppNotificationBanner';
import { subscribeToInAppNotifications } from '../../features/payments/notificationService';
import type { InAppNotification } from '../../features/payments/types';
import { SendMoneySheet } from '../../features/transfers/components/SendMoneySheet';
import { AppBottomNavigation } from '../../navigation/components/AppBottomNavigation';
import { personalNavigation } from '../../navigation/configs/personalNavigation';
import type { PersonalTabId } from '../../navigation/types';
import { colors, radii, spacing } from '../../theme/tokens';
import { ActivityScreen } from '../home/ActivityScreen';
import { HomeScreen } from '../home/HomeScreen';
import { PayScreen } from '../home/PayScreen';
import { ProfileScreen } from '../home/ProfileScreen';
import { RequestsScreen } from '../home/RequestsScreen';

type AuthenticatedHomeScreenProps = { user: User; onSignOut: () => Promise<void> };
type PreviewContent = { title: string; description: string };

function ledgerEntryToActivity(entry: LedgerEntrySummary): HomeActivity {
  const entryDate = new Date(entry.created_at);
  const today = new Date();
  const isToday = entryDate.toDateString() === today.toDateString();

  return {
    id: entry.id,
    title: entry.entry_kind === 'prototype_funding'
      ? 'Prototype funds added'
      : entry.entry_kind === 'transfer_credit'
        ? 'Payment received'
        : entry.entry_kind === 'transfer_debit'
          ? 'Payment sent'
          : entry.description,
    description: entry.description,
    amount: Math.abs(entry.amount_minor) / 100,
    direction: entry.amount_minor >= 0 ? 'credit' : 'debit',
    timestampLabel: isToday ? 'Today' : entryDate.toLocaleDateString('en-BW', { day: 'numeric', month: 'short' }),
    status: 'completed',
  };
}

export function AuthenticatedHomeScreen({ user, onSignOut }: AuthenticatedHomeScreenProps) {
  const [activeTab, setActiveTab] = useState<PersonalTabId>('home');
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntrySummary[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string>();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewContent | null>(null);
  const [notification, setNotification] = useState<InAppNotification | null>(null);
  const [paymentRefreshSignal, setPaymentRefreshSignal] = useState(0);
  const [sendMoneyVisible, setSendMoneyVisible] = useState(false);

  const refreshAccount = useCallback(async () => {
    setAccountLoading(true);
    setAccountError(undefined);
    try {
      const summary = await loadAccountSummary(user.id);
      setProfile(summary.profile);
      setWallet(summary.wallet);
      setBalanceMinor(summary.balance?.available_balance_minor ?? null);
      setLedgerEntries(summary.ledgerEntries);
    } catch (loadError) {
      setAccountError(loadError instanceof Error ? loadError.message : 'Could not load your account details.');
    } finally {
      setAccountLoading(false);
    }
  }, [user.id]);

  useEffect(() => { void refreshAccount(); }, [refreshAccount]);
  useEffect(() => subscribeToInAppNotifications(user.id, (nextNotification) => {
    setNotification(nextNotification);
    setPaymentRefreshSignal((value) => value + 1);
    void refreshAccount();
  }), [refreshAccount, user.id]);

  const openPreview = (title: string, description: string) => setPreview({ title, description });
  const activity = ledgerEntries.map(ledgerEntryToActivity);

  const handleHomeAction = (action: HomeActionId) => {
    if (action === 'pay') {
      setActiveTab('pay');
      return;
    }
    if (action === 'send') {
      setSendMoneyVisible(true);
      return;
    }
    if (action === 'receive') {
      setActiveTab('requests');
      return;
    }

    const content: Record<Exclude<HomeActionId, 'pay' | 'receive' | 'send'>, PreviewContent> = {
      deposit: { title: 'Deposit money', description: 'Deposit test funds through an approved Double Up agent.' },
      withdraw: { title: 'Withdraw money', description: 'Create a secure withdrawal QR code or amount-specific code for an agent.' },
    };
    openPreview(content[action].title, content[action].description);
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    setAccountError(undefined);
    try {
      await onSignOut();
    } catch (signOutError) {
      setAccountError(signOutError instanceof Error ? signOutError.message : 'Could not sign out.');
    } finally {
      setSignOutLoading(false);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'pay':
        return <PayScreen balance={balanceMinor === null ? null : balanceMinor / 100} onPaymentCompleted={() => refreshAccount()} />;
      case 'requests':
        return <RequestsScreen refreshSignal={paymentRefreshSignal} onRequestChanged={() => refreshAccount()} />;
      case 'activity':
        return <ActivityScreen activity={activity} loading={accountLoading} onRetry={() => void refreshAccount()} onActivity={() => undefined} />;
      case 'profile':
        return <ProfileScreen email={user.email} profile={profile} wallet={wallet} loading={accountLoading} signingOut={signOutLoading} onSignOut={() => void handleSignOut()} />;
      case 'home':
      default:
        return (
          <HomeScreen
            firstName={profile?.first_name}
            balance={balanceMinor === null ? null : balanceMinor / 100}
            currency={wallet?.currency}
            walletStatus={wallet?.status}
            activity={activity}
            activityLoading={accountLoading}
            onAction={handleHomeAction}
            onActivity={() => undefined}
            onActivityRetry={() => void refreshAccount()}
            onViewAllActivity={() => setActiveTab('activity')}
            onNotifications={() => openPreview('Notifications', 'Wallet alerts, request updates and transaction status messages will appear here.')}
            onProfile={() => setActiveTab('profile')}
          />
        );
    }
  };

  return (
    <ScreenContainer contentStyle={styles.shell}>
      {accountError ? (
        <View accessibilityRole="alert" style={styles.errorBanner}>
          <Feather name="alert-circle" size={18} color={colors.red[600]} />
          <Text style={styles.errorText}>{accountError}</Text>
          <Pressable accessibilityLabel="Retry account loading" accessibilityRole="button" hitSlop={8} onPress={() => void refreshAccount()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.screen}>{renderActiveScreen()}</View>
      <AppBottomNavigation activeId={activeTab} items={personalNavigation} onChange={setActiveTab} />

      <FeaturePreviewSheet visible={preview !== null} title={preview?.title ?? ''} description={preview?.description ?? ''} onClose={() => setPreview(null)} />
      <SendMoneySheet visible={sendMoneyVisible} balance={balanceMinor === null ? null : balanceMinor / 100} onClose={() => setSendMoneyVisible(false)} onCompleted={() => refreshAccount()} />
      {notification ? (
        <InAppNotificationBanner
          notification={notification}
          onClose={() => setNotification(null)}
          onOpen={() => {
            setActiveTab(notification.event_type === 'payment_received' ? 'requests' : 'activity');
            setNotification(null);
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  shell: { paddingHorizontal: 0 },
  screen: { flex: 1 },
  errorBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, minHeight: 54, borderRadius: radii.lg, backgroundColor: colors.red[50], paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  errorText: { flex: 1, color: colors.black[700], fontSize: 12, lineHeight: 17 },
  retryButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: colors.red[600], fontSize: 12, fontWeight: '900' },
});
