import React from 'react';
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { colors, radii, spacing } from '../../theme/tokens';

type DoubleUpWelcomeScreenProps = {
  onCreateAccount: () => void;
  onSignIn: () => void;
};

export function DoubleUpWelcomeScreen({ onCreateAccount, onSignIn }: DoubleUpWelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image source={require('../../../assets/app-icon.png')} style={styles.icon} />
          <Text style={styles.brandName}>Double Up</Text>
        </View>

        <View style={styles.heroStage}>
          <View style={styles.heroGlow} />
          <Image source={require('../../../assets/welcome-wallet.png')} resizeMode="contain" style={styles.heroImage} />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.eyebrow}>YOUR EVERYDAY WALLET</Text>
          <Text style={styles.title}>Simple money movement, built around you.</Text>
          <Text style={styles.tagline}>Send, receive and pay confidently with clear confirmations at every step.</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Create an account" onPress={onCreateAccount} />
          <PrimaryButton label="Sign in" onPress={onSignIn} variant="black" />
          <Text style={styles.disclaimer}>Prototype environment. Test funds only.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + spacing.md : spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 34, height: 34, borderRadius: radii.sm },
  brandName: { color: colors.black[950], fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  heroStage: { flex: 1.05, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  heroGlow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.red[50] },
  heroImage: { width: '112%', height: '112%' },
  copyBlock: { paddingBottom: spacing.lg },
  eyebrow: { color: colors.red[600], fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: spacing.sm },
  title: { color: colors.black[950], fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -1 },
  tagline: { color: colors.black[500], fontSize: 14, lineHeight: 21, marginTop: spacing.sm, maxWidth: 355 },
  actions: { marginTop: 'auto', gap: spacing.sm },
  disclaimer: { color: colors.black[400], fontSize: 11, textAlign: 'center', marginTop: spacing.sm },
});

