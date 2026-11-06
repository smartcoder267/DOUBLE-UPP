import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../theme/tokens';

type SignUpProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function SignUpProgress({ currentStep, totalSteps }: SignUpProgressProps) {
  return (
    <View accessibilityLabel={`Registration step ${currentStep} of ${totalSteps}`} style={styles.container}>
      <Text style={styles.label}>Step {currentStep} of {totalSteps}</Text>
      <View style={styles.trackRow}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={[styles.track, index < currentStep && styles.trackActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginBottom: spacing.lg },
  label: { color: colors.black[400], fontSize: 12, fontWeight: '800' },
  trackRow: { flexDirection: 'row', gap: spacing.xs },
  track: { flex: 1, height: 4, borderRadius: radii.pill, backgroundColor: colors.black[100] },
  trackActive: { backgroundColor: colors.red[600] },
});
