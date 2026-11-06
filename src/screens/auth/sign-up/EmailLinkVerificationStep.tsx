import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { colors, radii, spacing } from '../../../theme/tokens';

type EmailLinkVerificationStepProps = {
  email: string;
  error?: string;
  loading?: boolean;
  onCheckVerification: () => void | Promise<void>;
  onResend: () => void | Promise<void>;
};

export function EmailLinkVerificationStep({ email, error, loading = false, onCheckVerification, onResend }: EmailLinkVerificationStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconStage}>
        <View style={styles.iconCircle}>
          <Feather accessibilityElementsHidden importantForAccessibility="no-hide-descendants" name="mail" size={30} color={colors.red[600]} />
        </View>
        <View style={styles.linkBadge}>
          <Feather accessibilityElementsHidden importantForAccessibility="no-hide-descendants" name="link-2" size={15} color={colors.white} />
        </View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.helper}>We sent a secure verification link to</Text>
        <Text accessibilityLabel={`Verification email sent to ${email}`} style={styles.destination}>{email}</Text>
        <Text style={styles.instructions}>Open the email and tap the verification link. Return to Double Up and sign in to finish setting up your account.</Text>
      </View>

      <View accessibilityLiveRegion="polite" style={styles.waitingPanel}>
        <ActivityIndicator color={colors.red[600]} size="small" />
        <View style={styles.waitingCopy}>
          <Text style={styles.waitingTitle}>Waiting for verification</Text>
          <Text style={styles.waitingText}>This screen will update when your email is confirmed.</Text>
        </View>
      </View>

      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="I’ve verified my email" onPress={onCheckVerification} loading={loading} style={styles.button} />
      <Pressable accessibilityRole="button" disabled={loading} onPress={onResend} style={styles.resendButton}>
        <Text style={styles.resendText}>Link expired or missing? <Text style={styles.resendStrong}>Send a new link</Text></Text>
      </Pressable>
      <Text style={styles.previewNote}>Email confirmation is handled by Supabase. If the link has not arrived, check spam or request another.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  iconStage: { width: 64, height: 64 },
  iconCircle: { width: 58, height: 58, borderRadius: radii.lg, backgroundColor: colors.red[50], alignItems: 'center', justifyContent: 'center' },
  linkBadge: { position: 'absolute', right: 0, bottom: 0, width: 27, height: 27, borderRadius: radii.pill, backgroundColor: colors.red[600], alignItems: 'center', justifyContent: 'center' },
  copyBlock: { gap: spacing.sm },
  helper: { color: colors.black[500], fontSize: 14 },
  destination: { color: colors.black[950], fontSize: 17, fontWeight: '900' },
  instructions: { color: colors.black[500], fontSize: 14, lineHeight: 21 },
  waitingPanel: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.black[50] },
  waitingCopy: { flex: 1, gap: spacing.xs },
  waitingTitle: { color: colors.black[900], fontSize: 14, fontWeight: '900' },
  waitingText: { color: colors.black[500], fontSize: 12, lineHeight: 18 },
  button: { marginTop: spacing.sm },
  resendButton: { alignItems: 'center', paddingVertical: spacing.xs, minHeight: 44, justifyContent: 'center' },
  resendText: { color: colors.black[500], fontSize: 13, fontWeight: '600', textAlign: 'center' },
  resendStrong: { color: colors.red[600], fontWeight: '900' },
  previewNote: { color: colors.black[400], fontSize: 11, lineHeight: 17, textAlign: 'center' },
  error: { color: colors.error, fontSize: 13, lineHeight: 19 },
});
