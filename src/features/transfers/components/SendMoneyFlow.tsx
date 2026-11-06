import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FormField } from '../../../components/forms/FormField';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SuccessAnimation } from '../../../components/feedback/SuccessAnimation';
import { createPaymentIdempotencyKey } from '../../payments/paymentService';
import { normalizeRecipientPhone, paymentErrorMessage, resolveRecipient, sendMoneyToUser } from '../transferService';
import type { RecipientPreview, TransferResult } from '../types';
import { colors, radii, spacing } from '../../../theme/tokens';

type SendMode = 'form' | 'review' | 'success';
type SendMoneyFlowProps = { balance: number | null; onCompleted: () => void | Promise<void>; onBack: () => void; onModeChange?: (mode: SendMode) => void };

export function SendMoneyFlow({ balance, onCompleted, onBack, onModeChange }: SendMoneyFlowProps) {
  const [mode, setMode] = useState<SendMode>('form');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState<RecipientPreview>();
  const [result, setResult] = useState<TransferResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const idempotencyKey = useRef(createPaymentIdempotencyKey());
  const changeMode = (nextMode: SendMode) => { setMode(nextMode); onModeChange?.(nextMode); };

  const amountMinor = () => Math.round(Number(amount.trim().replace(',', '.')) * 100);

  const review = async () => {
    const cleanPhone = phone.trim();
    const normalizedAmount = amount.trim().replace(',', '.');
    if (!cleanPhone) { setError('Enter the recipient phone number.'); return; }
    if (!/^\d+([.,]\d{0,2})?$/.test(normalizedAmount) || amountMinor() < 1) { setError('Enter a valid amount. You can use whole numbers or up to two decimal places.'); return; }
    setLoading(true);
    setError(undefined);
    try {
      setRecipient(await resolveRecipient(cleanPhone));
      changeMode('review');
    } catch (resolveError) { setError(paymentErrorMessage(resolveError)); }
    finally { setLoading(false); }
  };

  const confirm = async () => {
    if (!recipient) return;
    setLoading(true);
    setError(undefined);
    try {
      setResult(await sendMoneyToUser(phone, amountMinor(), idempotencyKey.current));
      changeMode('success');
      await onCompleted();
    } catch (sendError) { setError(paymentErrorMessage(sendError)); }
    finally { setLoading(false); }
  };

  if (mode === 'success' && result) {
    return (
      <View style={styles.success}>
        <SuccessAnimation />
        <Text style={styles.eyebrow}>TRANSFER COMPLETE</Text>
        <Text style={styles.successTitle}>You sent P {(amountMinor() / 100).toFixed(2)}</Text>
        <Text style={styles.description}>Your payment to {result.recipient_name} was completed successfully.</Text>
        <View style={styles.balanceBlock}><Text style={styles.balanceLabel}>NEW AVAILABLE BALANCE</Text><Text style={styles.balance}>{`P ${(result.sender_balance_minor / 100).toFixed(2)}`}</Text></View>
        <PrimaryButton label="Done" onPress={onBack} style={styles.fullButton} />
      </View>
    );
  }

  if (mode === 'review' && recipient) {
    return (
      <View style={styles.screenContent}>
        <View style={styles.heading}><Text style={styles.eyebrow}>CONFIRM PAYMENT</Text><Text style={styles.title}>Confirm payment</Text><Text style={styles.headingDescription}>Review the details. Nothing has been sent yet.</Text></View>
        <View style={styles.reviewPanel}>
          <View style={styles.avatar}><Feather name="user" size={25} color={colors.white} /></View>
          <Text style={styles.reviewLabel}>SENDING TO</Text>
          <Text style={styles.recipientName}>{recipient.recipient_name}</Text>
          <Text style={styles.phone}>{normalizeRecipientPhone(phone)}</Text>
        </View>
        <View style={styles.amountPanel}><Text style={styles.balanceLabel}>AMOUNT</Text><Text style={styles.transferAmount}>{`P ${(amountMinor() / 100).toFixed(2)}`}</Text><Text style={styles.available}>{balance === null ? 'Checking balance…' : `Available after transfer: P ${((balance - amountMinor() / 100)).toFixed(2)}`}</Text></View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Confirm payment" loading={loading} onPress={() => void confirm()} />
        <PrimaryButton label="Edit details" variant="light" disabled={loading} onPress={() => changeMode('form')} />
      </View>
    );
  }

  return (
    <View style={styles.screenContent}>
      <View style={styles.heading}><Text style={styles.eyebrow}>SEND MONEY</Text><Text style={styles.title}>Send to a user</Text><Text style={styles.headingDescription}>Send test funds directly to another Double Up personal wallet.</Text></View>
      <View style={styles.form}>
        <FormField label="Recipient phone number" icon="phone" value={phone} placeholder="Phone number" keyboardType="phone-pad" onChangeText={(value) => { setPhone(value.replace(/[^\d+ ]/g, '')); setError(undefined); }} />
        <FormField label="Amount (BWP)" icon="credit-card" value={amount} placeholder="0.00" keyboardType="decimal-pad" onChangeText={(value) => { setAmount(value.replace(/[^\d.,]/g, '')); setError(undefined); }} />
        <Text style={styles.help}>Enter a local number or include a country code for an international recipient. The recipient’s name will be shown before you confirm.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Find recipient" loading={loading} onPress={() => void review()} />
        <PrimaryButton label="Go back" variant="light" disabled={loading} onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md }, heading: { gap: spacing.xs }, eyebrow: { color: colors.red[600], fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, title: { color: colors.black[950], fontSize: 26, lineHeight: 31, fontWeight: '900', letterSpacing: -0.8 }, headingDescription: { color: colors.black[500], fontSize: 12, lineHeight: 18 }, form: { gap: spacing.sm }, help: { color: colors.black[500], fontSize: 11, lineHeight: 16 }, error: { color: colors.error, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  reviewPanel: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md }, avatar: { width: 68, height: 68, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, reviewLabel: { color: colors.black[400], fontSize: 10, fontWeight: '900', letterSpacing: 1.1 }, recipientName: { color: colors.black[950], fontSize: 22, fontWeight: '900' }, phone: { color: colors.black[500], fontSize: 13 },
  amountPanel: { borderRadius: radii.lg, backgroundColor: colors.black[950], padding: spacing.lg, gap: spacing.sm }, balanceLabel: { color: colors.black[300], fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, transferAmount: { color: colors.white, fontSize: 36, fontWeight: '900' }, available: { color: colors.black[300], fontSize: 12 },
  success: { flex: 1, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, successTitle: { color: colors.black[950], fontSize: 26, lineHeight: 32, fontWeight: '900', textAlign: 'center' }, description: { color: colors.black[500], fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 330 }, balanceBlock: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs }, balance: { color: colors.black[950], fontSize: 24, fontWeight: '900' }, fullButton: { alignSelf: 'stretch', marginTop: spacing.xl },
});
