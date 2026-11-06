import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../../components/common/GlassCard';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, radii, spacing } from '../../theme/tokens';

type DoubleUpStartupScreenProps = {
  onCreateAccount: () => void;
  onSignIn: () => void;
};

export function DoubleUpStartupScreen({ onCreateAccount, onSignIn }: DoubleUpStartupScreenProps) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();
  }, [entrance]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlow} />
      <Animated.View style={[styles.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Feather name="arrow-up-right" size={20} color={colors.white} />
          </View>
          <Text style={styles.brandName}>double up</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR WALLET. YOUR MOVE.</Text>
          <Text style={styles.title}>A clearer way to move value.</Text>
          <Text style={styles.subtitle}>
            Send, receive, pay and manage your money in one connected wallet built for everyday life.
          </Text>
        </View>

        <GlassCard tone="dark" style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>PERSONAL WALLET</Text>
              <Text style={styles.cardTitle}>TEST FUNDS</Text>
            </View>
            <Feather name="shield" size={20} color={colors.red[300]} />
          </View>
          <Text style={styles.cardBalance}>P 0.00</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Secure test environment</Text>
            <Text style={styles.cardFooterText}>BWP</Text>
          </View>
        </GlassCard>

        <View style={styles.actions}>
          <PrimaryButton label="Create an account" onPress={onCreateAccount} />
          <PrimaryButton label="Sign in" onPress={onSignIn} variant="light" />
        </View>

        <Text style={styles.disclaimer}>Double Up prototype. Test funds only. No real money movement.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.black[950] },
  backgroundGlow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.red[900],
    opacity: 0.3,
    top: -160,
    right: -100,
  },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.red[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.6 },
  hero: { marginTop: spacing.xxl, gap: spacing.sm },
  eyebrow: { color: colors.red[300], fontSize: 12, fontWeight: '800', letterSpacing: 1.8 },
  title: { color: colors.white, fontSize: 40, lineHeight: 45, fontWeight: '900', letterSpacing: -1.4 },
  subtitle: { color: colors.black[200], fontSize: 16, lineHeight: 24, maxWidth: 340 },
  walletCard: { marginTop: spacing.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardEyebrow: { color: colors.red[300], fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  cardTitle: { color: colors.white, fontSize: 15, fontWeight: '800', marginTop: 4 },
  cardBalance: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: spacing.xl },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  cardFooterText: { color: colors.black[300], fontSize: 11, fontWeight: '700' },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  disclaimer: { color: colors.black[400], fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: spacing.md },
});

