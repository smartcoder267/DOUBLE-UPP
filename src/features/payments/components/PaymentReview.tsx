import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { colors, radii, spacing } from '../../../theme/tokens';
import type { PaymentPreview } from '../types';

type PaymentReviewProps = {
  preview: PaymentPreview;
  balance: number | null;
  loading?: boolean;
  error?: string;
  onBack: () => void;
  onConfirm: () => void;
};

export function PaymentReview({ preview, balance, loading = false, error, onBack, onConfirm }: PaymentReviewProps) {
  const amount = preview.amount_minor / 100;
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text style={styles.eyebrow}>CONFIRM PAYMENT</Text><Text style={styles.title}>Review before paying</Text><Text style={styles.description}>Make sure the receiver and amount are correct.</Text></View>
      <View style={styles.receiver}>
        <View style={styles.avatar}><Feather name="user" size={25} color={colors.white} /></View>
        <Text style={styles.receiverLabel}>PAYING</Text>
        <Text style={styles.receiverName}>{preview.receiver_name}</Text>
        <Text style={styles.service}>{preview.service}</Text>
      </View>
      <View style={styles.amountPanel}>
        <Text style={styles.amountLabel}>AMOUNT</Text>
        <Text style={styles.amount}>P {amount.toFixed(2)}</Text>
        <View style={styles.balanceRow}><Text style={styles.balanceLabel}>Your available balance</Text><Text style={styles.balance}>{balance === null ? 'Checking…' : `P ${balance.toFixed(2)}`}</Text></View>
      </View>
      {error ? <View accessibilityRole="alert" style={styles.errorPanel}><Feather name="alert-circle" size={18} color={colors.red[600]} /><Text style={styles.error}>{error}</Text></View> : null}
      <PrimaryButton label={`Pay P ${amount.toFixed(2)}`} loading={loading} onPress={onConfirm} />
      <PrimaryButton label="Go back" variant="light" disabled={loading} onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.lg },
  header: { gap: spacing.xs },
  eyebrow: { color: colors.red[600], fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.black[950], fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 },
  description: { color: colors.black[500], fontSize: 13, lineHeight: 20 },
  receiver: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  avatar: { width: 68, height: 68, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  receiverLabel: { color: colors.black[400], fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  receiverName: { color: colors.black[950], fontSize: 21, fontWeight: '900' },
  service: { color: colors.black[500], fontSize: 13 },
  amountPanel: { borderRadius: radii.lg, backgroundColor: colors.black[950], padding: spacing.lg, gap: spacing.sm },
  amountLabel: { color: colors.black[300], fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  amount: { color: colors.white, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  balanceRow: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { color: colors.black[300], fontSize: 11, fontWeight: '700' },
  balance: { color: colors.red[300], fontSize: 12, fontWeight: '900' },
  errorPanel: { borderRadius: radii.lg, backgroundColor: colors.red[50], padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  error: { flex: 1, color: colors.black[700], fontSize: 12, lineHeight: 18 },
});
