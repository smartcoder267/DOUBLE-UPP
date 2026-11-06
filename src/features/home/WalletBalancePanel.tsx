import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/tokens';

type WalletBalancePanelProps = {
  balance: number | null;
  currency?: string;
  walletStatus?: string;
};

function formatBalance(balance: number, currency: string) {
  const amount = balance.toLocaleString('en-BW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'BWP' ? `P ${amount}` : `${currency} ${amount}`;
}

export function WalletBalancePanel({ balance, currency = 'BWP', walletStatus = 'active' }: WalletBalancePanelProps) {
  const [hidden, setHidden] = useState(false);
  const hasBalance = balance !== null;

  return (
    <View style={styles.panel}>
      <View style={styles.redGlow} />
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>AVAILABLE PERSONAL BALANCE</Text>
          <Text style={styles.testFunds}>Test funds</Text>
        </View>
        <Pressable accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'} accessibilityRole="button" hitSlop={8} onPress={() => setHidden((current) => !current)} style={styles.eyeButton}>
          <Feather name={hidden ? 'eye-off' : 'eye'} size={19} color={colors.white} />
        </Pressable>
      </View>

      <Text accessibilityLabel={hidden ? 'Balance hidden' : hasBalance ? `Available balance ${balance} ${currency}` : 'Balance not available'} style={styles.amount}>
        {hidden ? '••••••' : hasBalance ? formatBalance(balance, currency) : 'P —'}
      </Text>

      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{hasBalance ? `${walletStatus} wallet` : 'Balance connection pending'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { minHeight: 196, borderRadius: 30, backgroundColor: colors.black[950], padding: spacing.lg, overflow: 'hidden', justifyContent: 'space-between' },
  redGlow: { position: 'absolute', width: 190, height: 190, borderRadius: radii.pill, backgroundColor: colors.red[700], opacity: 0.72, right: -72, top: -98 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  label: { color: colors.black[200], fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  testFunds: { color: colors.red[300], fontSize: 12, fontWeight: '800', marginTop: spacing.xs },
  eyeButton: { width: 44, height: 44, borderRadius: radii.lg, backgroundColor: colors.black[700], alignItems: 'center', justifyContent: 'center' },
  amount: { color: colors.white, fontSize: 36, fontWeight: '900', letterSpacing: -1.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusDot: { width: 7, height: 7, borderRadius: radii.pill, backgroundColor: colors.red[400] },
  statusText: { color: colors.black[200], fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});
