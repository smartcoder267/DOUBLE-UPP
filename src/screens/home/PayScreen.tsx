import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionRow } from '../../components/common/ActionRow';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormField } from '../../components/forms/FormField';
import { TabScreen } from '../../components/layout/TabScreen';
import { PaymentReview } from '../../features/payments/components/PaymentReview';
import { PaymentScanner } from '../../features/payments/components/PaymentScanner';
import { PaymentSuccess } from '../../features/payments/components/PaymentSuccess';
import {
  confirmPaymentRequest,
  createPaymentIdempotencyKey,
  paymentErrorMessage,
  resolvePaymentRequestPin,
  resolvePaymentRequestQr,
} from '../../features/payments/paymentService';
import type { PaymentPreview, PaymentResult } from '../../features/payments/types';
import { colors, radii, spacing } from '../../theme/tokens';

type PayMode = 'menu' | 'scanner' | 'pin' | 'review' | 'success';
type PayScreenProps = { balance: number | null; onPaymentCompleted: () => void | Promise<void> };

export function PayScreen({ balance, onPaymentCompleted }: PayScreenProps) {
  const [mode, setMode] = useState<PayMode>('menu');
  const [pin, setPin] = useState('');
  const [preview, setPreview] = useState<PaymentPreview>();
  const [result, setResult] = useState<PaymentResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const idempotencyKey = useRef(createPaymentIdempotencyKey());

  const resetPayment = () => {
    setMode('menu');
    setPin('');
    setPreview(undefined);
    setResult(undefined);
    setError(undefined);
    idempotencyKey.current = createPaymentIdempotencyKey();
  };

  const resolveQr = async (payload: string) => {
    setLoading(true);
    setError(undefined);
    try {
      setPreview(await resolvePaymentRequestQr(payload));
      setMode('review');
    } catch (resolveError) {
      setError(paymentErrorMessage(resolveError));
    } finally {
      setLoading(false);
    }
  };

  const resolvePin = async () => {
    if (!/^\d{6}$/.test(pin)) { setError('Enter the complete six digit payment PIN.'); return; }
    setLoading(true);
    setError(undefined);
    try {
      setPreview(await resolvePaymentRequestPin(pin));
      setMode('review');
    } catch (resolveError) {
      setError(paymentErrorMessage(resolveError));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setLoading(true);
    setError(undefined);
    try {
      const paymentResult = await confirmPaymentRequest(preview.id, idempotencyKey.current);
      setResult(paymentResult);
      setMode('success');
      await onPaymentCompleted();
    } catch (paymentError) {
      setError(paymentErrorMessage(paymentError));
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'scanner') return <PaymentScanner loading={loading} error={error} onBack={resetPayment} onScanned={(data) => void resolveQr(data)} onTryAgain={() => setError(undefined)} />;
  if (mode === 'review' && preview) return <PaymentReview preview={preview} balance={balance} loading={loading} error={error} onBack={() => { setError(undefined); setMode('menu'); }} onConfirm={() => void confirm()} />;
  if (mode === 'success' && preview && result) return <PaymentSuccess preview={preview} result={result} onDone={resetPayment} />;

  if (mode === 'pin') {
    return (
      <TabScreen eyebrow="PAYMENT PIN" title="Enter six digit PIN" description="Use the PIN shown on the receiver's Double Up request.">
        <View style={styles.pinPanel}>
          <FormField label="Payment PIN" icon="hash" value={pin} error={error} keyboardType="number-pad" maxLength={6} placeholder="000000" onChangeText={(value) => { setPin(value.replace(/\D/g, '').slice(0, 6)); setError(undefined); }} />
          <Text style={styles.help}>You will review the receiver, service and amount before money moves.</Text>
          <PrimaryButton label="Continue" loading={loading} disabled={pin.length !== 6} onPress={() => void resolvePin()} />
          <PrimaryButton label="Go back" variant="light" disabled={loading} onPress={resetPayment} />
        </View>
      </TabScreen>
    );
  }

  return (
    <TabScreen eyebrow="PERSONAL WALLET" title="Pay" description="Pay a secure request using its QR code or six digit PIN.">
      <View style={styles.balancePanel}><Text style={styles.balanceLabel}>AVAILABLE TO PAY</Text><Text style={styles.balance}>{balance === null ? 'Checking…' : `P ${balance.toFixed(2)}`}</Text></View>
      <View style={styles.actions}>
        <ActionRow icon="maximize" title="Scan QR code" description="Use the custom Double Up scanner, then review before paying." onPress={() => { setError(undefined); setMode('scanner'); }} />
        <ActionRow icon="hash" title="Enter payment PIN" description="Enter the six digit PIN shown by the receiver." onPress={() => { setError(undefined); setMode('pin'); }} />
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md }, pinPanel: { gap: spacing.md }, help: { color: colors.black[500], fontSize: 12, lineHeight: 18 },
  balancePanel: { borderRadius: radii.lg, backgroundColor: colors.black[950], padding: spacing.lg, gap: spacing.xs },
  balanceLabel: { color: colors.black[300], fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, balance: { color: colors.white, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },
});
