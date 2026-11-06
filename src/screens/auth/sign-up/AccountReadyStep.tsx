import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { SuccessAnimation } from '../../../components/feedback/SuccessAnimation';
import { colors, spacing } from '../../../theme/tokens';

type AccountReadyStepProps = { firstName: string; onComplete: () => void };

export function AccountReadyStep({ firstName, onComplete }: AccountReadyStepProps) {
  return (
    <View style={styles.container}>
      <SuccessAnimation />
      <Text style={styles.eyebrow}>ACCOUNT READY</Text>
      <Text style={styles.title}>Welcome to Double Up, {firstName}.</Text>
      <Text style={styles.description}>Your details have been completed. You can now continue to your wallet experience.</Text>
      <Text style={styles.disclaimer}>Prototype environment · Test funds only</Text>
      <PrimaryButton label="Continue to Double Up" onPress={onComplete} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.xl },
  eyebrow: { color: colors.red[600], fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: spacing.lg },
  title: { color: colors.black[950], fontSize: 30, lineHeight: 36, fontWeight: '900', letterSpacing: -1, textAlign: 'center', marginTop: spacing.sm },
  description: { color: colors.black[500], fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: spacing.md, maxWidth: 340 },
  disclaimer: { color: colors.black[400], fontSize: 11, marginTop: spacing.lg },
  button: { alignSelf: 'stretch', marginTop: spacing.xl },
});
