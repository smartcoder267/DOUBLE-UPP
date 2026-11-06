import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SuccessAnimation } from '../../../components/feedback/SuccessAnimation';
import { colors, spacing } from '../../../theme/tokens';
import type { PaymentPreview, PaymentResult } from '../types';

type PaymentSuccessProps = { preview: PaymentPreview; result: PaymentResult; onDone: () => void };

export function PaymentSuccess({ preview, result, onDone }: PaymentSuccessProps) {
  return (
    <View style={styles.container}>
      <SuccessAnimation />
      <Text style={styles.eyebrow}>PAYMENT COMPLETE</Text>
      <Text style={styles.title}>You paid P {(preview.amount_minor / 100).toFixed(2)}</Text>
      <Text style={styles.description}>Your payment to {preview.receiver_name} was completed successfully.</Text>
      <View style={styles.balanceBlock}><Text style={styles.balanceLabel}>NEW AVAILABLE BALANCE</Text><Text style={styles.balance}>P {(result.payer_balance_minor / 100).toFixed(2)}</Text></View>
      <PrimaryButton label="Done" onPress={onDone} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  eyebrow: { color: colors.red[600], fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: colors.black[950], fontSize: 26, lineHeight: 32, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center' },
  description: { color: colors.black[500], fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 330 },
  balanceBlock: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
  balanceLabel: { color: colors.black[400], fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  balance: { color: colors.black[950], fontSize: 24, fontWeight: '900' },
  button: { alignSelf: 'stretch', marginTop: spacing.xl },
});
