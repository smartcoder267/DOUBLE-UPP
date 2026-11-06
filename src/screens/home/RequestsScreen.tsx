import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormField } from '../../components/forms/FormField';
import { TabScreen } from '../../components/layout/TabScreen';
import { createPaymentRequest, listMyPaymentRequests, paymentErrorMessage, setPaymentRequestReuse } from '../../features/payments/paymentService';
import type { CreatedPaymentRequest, PaymentRequest } from '../../features/payments/types';
import { colors, radii, spacing } from '../../theme/tokens';

type RequestMode = 'list' | 'create' | 'detail';
type RequestsScreenProps = { refreshSignal: number; onRequestChanged: () => void | Promise<void> };

function toCreated(request: PaymentRequest): CreatedPaymentRequest {
  return { ...request, qr_payload: `doubleup://pay-request/${request.qr_token}` };
}

function statusLabel(status: string) {
  if (status === 'open') return 'Ready to receive';
  if (status === 'awaiting_receiver_action') return 'Choose complete or reuse';
  if (status === 'closed') return 'Completed';
  return 'Cancelled';
}

function RequestRow({ request, onPress }: { request: PaymentRequest; onPress: () => void }) {
  const content = <><View style={styles.rowIcon}><Feather name={request.status === 'open' ? 'maximize' : request.status === 'awaiting_receiver_action' ? 'check' : 'lock'} size={20} color={colors.red[600]} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{request.service}</Text><Text style={styles.rowStatus}>{statusLabel(request.status)} · PIN {request.payment_pin}</Text></View><View style={styles.rowEnd}><Text style={styles.rowAmount}>P {(request.amount_minor / 100).toFixed(2)}</Text>{request.status === 'closed' || request.status === 'cancelled' ? <Feather name="lock" size={16} color={colors.black[300]} /> : <Feather name="chevron-right" size={18} color={colors.black[300]} />}</View></>;
  if (request.status === 'closed' || request.status === 'cancelled') return <View accessibilityLabel={`${request.service}, ${statusLabel(request.status)}, read only`} style={styles.row}>{content}</View>;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${request.service} request`} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>{content}</Pressable>;
}

export function RequestsScreen({ refreshSignal, onRequestChanged }: RequestsScreenProps) {
  const [mode, setMode] = useState<RequestMode>('list');
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [selected, setSelected] = useState<CreatedPaymentRequest>();
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [reuseCount, setReuseCount] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadRequests = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const nextRequests = await listMyPaymentRequests();
      setRequests(nextRequests);
      setSelected((current) => {
        if (!current) return current;
        const updated = nextRequests.find((request) => request.id === current.id);
        return updated ? toCreated(updated) : current;
      });
    }
    catch (loadError) { setError(paymentErrorMessage(loadError)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadRequests(); }, []);
  useEffect(() => {
    if (refreshSignal > 0) void loadRequests();
  }, [refreshSignal]);

  const create = async () => {
    const trimmedService = service.trim();
    const normalizedAmount = amount.trim().replace(',', '.');
    if (!trimmedService) { setError('Enter what the payment is for.'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) { setError('Enter a valid amount with up to two decimal places.'); return; }
    const amountMinor = Math.round(Number(normalizedAmount) * 100);
    if (amountMinor < 1) { setError('The amount must be more than P 0.00.'); return; }
    setLoading(true);
    setError(undefined);
    try {
      const request = await createPaymentRequest(trimmedService, amountMinor);
      setSelected(request);
      setMode('detail');
      setService('');
      setAmount('');
      await onRequestChanged();
    } catch (createError) { setError(paymentErrorMessage(createError)); }
    finally { setLoading(false); }
  };

  const decideReuse = async (count: number) => {
    if (!selected) return;
    setLoading(true);
    setError(undefined);
    try {
      await setPaymentRequestReuse(selected.id, count);
      await loadRequests();
      setMode('list');
      setSelected(undefined);
      await onRequestChanged();
    } catch (reuseError) { setError(paymentErrorMessage(reuseError)); setLoading(false); }
  };

  if (mode === 'create') {
    return (
      <TabScreen eyebrow="RECEIVE MONEY" title="Create request" description="Set the service and amount once. Double Up will generate both a QR code and six digit PIN.">
        <View style={styles.form}>
          <FormField label="Service or reason" icon="briefcase" value={service} placeholder="e.g. Haircut" maxLength={120} autoCapitalize="sentences" onChangeText={(value) => { setService(value); setError(undefined); }} />
          <FormField label="Amount (BWP)" icon="credit-card" value={amount} placeholder="0.00" keyboardType="decimal-pad" onChangeText={(value) => { setAmount(value.replace(/[^\d.,]/g, '')); setError(undefined); }} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Generate request" loading={loading} onPress={() => void create()} />
          <PrimaryButton label="Go back" variant="light" disabled={loading} onPress={() => { setError(undefined); setMode('list'); }} />
        </View>
      </TabScreen>
    );
  }

  if (mode === 'detail' && selected) {
    const awaitingDecision = selected.status === 'awaiting_receiver_action';
    return (
      <TabScreen eyebrow="PAYMENT REQUEST" title={awaitingDecision ? 'Payment received' : 'Ready to scan'} description={awaitingDecision ? 'Complete this request or keep it available for more payments.' : 'The payer can scan this QR code or enter the PIN below.'}>
        {!awaitingDecision ? (
          <View style={styles.qrSection}>
            <View style={styles.qrWrap}><QRCode value={selected.qr_payload} size={210} color={colors.black[950]} backgroundColor={colors.white} /></View>
            <Text style={styles.service}>{selected.service}</Text><Text style={styles.amount}>P {(selected.amount_minor / 100).toFixed(2)}</Text>
            <Text style={styles.or}>OR ENTER PIN</Text><Text selectable style={styles.pin}>{selected.payment_pin}</Text>
            <Text style={styles.hint}>Only share this code with the person paying you.</Text>
          </View>
        ) : (
          <View style={styles.decision}>
            <View style={styles.decisionIcon}><Feather name="check" size={30} color={colors.white} /></View>
            <Text style={styles.decisionTitle}>P {(selected.amount_minor / 100).toFixed(2)} received</Text>
            <Text style={styles.hint}>Close it now, or choose how many additional payments this same request should accept.</Text>
            <FormField label="Additional payments" icon="repeat" value={reuseCount} keyboardType="number-pad" maxLength={3} onChangeText={(value) => setReuseCount(value.replace(/\D/g, '').slice(0, 3))} />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Reuse this request" loading={loading} disabled={!reuseCount || Number(reuseCount) < 1 || Number(reuseCount) > 100} onPress={() => void decideReuse(Number(reuseCount))} />
            <PrimaryButton label="Complete request" variant="black" disabled={loading} onPress={() => void decideReuse(0)} />
          </View>
        )}
        {!awaitingDecision ? <PrimaryButton label="Back to requests" variant="light" onPress={() => { setMode('list'); setSelected(undefined); void loadRequests(); }} /> : null}
      </TabScreen>
    );
  }

  return (
    <TabScreen eyebrow="RECEIVE MONEY" title="Requests" description="Create and reopen payment requests without blocking a new receive transaction.">
      <PrimaryButton label="Create receive request" onPress={() => { setError(undefined); setMode('create'); }} />
      {loading ? <View style={styles.state}><ActivityIndicator color={colors.red[600]} /><Text style={styles.stateText}>Loading your requests…</Text></View> : null}
      {!loading && error ? <View style={styles.state}><Feather name="alert-circle" size={26} color={colors.red[600]} /><Text accessibilityRole="alert" style={styles.stateText}>{error}</Text><PrimaryButton label="Try again" variant="light" onPress={() => void loadRequests()} style={styles.full} /></View> : null}
      {!loading && !error && requests.length === 0 ? <View style={styles.state}><View style={styles.emptyIcon}><Feather name="inbox" size={26} color={colors.red[600]} /></View><Text style={styles.stateTitle}>No receive requests yet</Text><Text style={styles.stateText}>Create one to get a QR code and six digit payment PIN.</Text></View> : null}
      {!loading && !error ? <View style={styles.list}>{requests.map((request) => <RequestRow key={request.id} request={request} onPress={() => { setSelected(toCreated(request)); setError(undefined); setMode('detail'); }} />)}</View> : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md }, error: { color: colors.error, fontSize: 12, lineHeight: 18, fontWeight: '700' }, qrSection: { alignItems: 'center', gap: spacing.sm }, qrWrap: { padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.white },
  service: { color: colors.black[500], fontSize: 13, fontWeight: '700', marginTop: spacing.sm }, amount: { color: colors.black[950], fontSize: 30, fontWeight: '900' }, or: { color: colors.black[400], fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: spacing.sm }, pin: { color: colors.red[600], fontSize: 34, fontWeight: '900', letterSpacing: 7 }, hint: { color: colors.black[500], fontSize: 12, lineHeight: 18, textAlign: 'center' },
  decision: { alignItems: 'center', gap: spacing.md }, decisionIcon: { width: 68, height: 68, borderRadius: radii.lg, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center' }, decisionTitle: { color: colors.black[950], fontSize: 24, fontWeight: '900' },
  state: { borderRadius: radii.lg, backgroundColor: colors.black[50], padding: spacing.lg, alignItems: 'center', gap: spacing.sm }, stateTitle: { color: colors.black[950], fontSize: 16, fontWeight: '900' }, stateText: { color: colors.black[500], fontSize: 12, lineHeight: 18, textAlign: 'center' }, emptyIcon: { width: 56, height: 56, borderRadius: radii.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, full: { alignSelf: 'stretch' },
  list: { gap: spacing.sm }, row: { minHeight: 82, borderRadius: radii.lg, backgroundColor: colors.black[50], padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, rowIcon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1, gap: 4 }, rowTitle: { color: colors.black[950], fontSize: 14, fontWeight: '900' }, rowStatus: { color: colors.black[500], fontSize: 10, lineHeight: 15 }, rowEnd: { alignItems: 'flex-end', gap: 6 }, rowAmount: { color: colors.black[950], fontSize: 13, fontWeight: '900' }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
