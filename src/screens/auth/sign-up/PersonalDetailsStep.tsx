import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { FormField } from '../../../components/forms/FormField';
import { colors, spacing } from '../../../theme/tokens';
import { PersonalDetailsErrors, SignUpValues } from './types';

type PersonalDetailsStepProps = {
  values: SignUpValues;
  errors: PersonalDetailsErrors;
  actionError?: string;
  loading?: boolean;
  onChange: (key: keyof SignUpValues, value: string) => void;
  onContinue: () => void;
  onSignIn: () => void;
};

export function PersonalDetailsStep({ values, errors, actionError, loading = false, onChange, onContinue, onSignIn }: PersonalDetailsStepProps) {
  return (
    <View style={styles.form}>
      <View style={styles.nameRow}>
        <View style={styles.nameField}><FormField label="First name" icon="user" value={values.firstName} onChangeText={(value) => onChange('firstName', value)} error={errors.firstName} autoCapitalize="words" /></View>
        <View style={styles.nameField}><FormField label="Last name" icon="user" value={values.lastName} onChangeText={(value) => onChange('lastName', value)} error={errors.lastName} autoCapitalize="words" /></View>
      </View>
      <FormField label="Botswana mobile number" icon="phone" value={values.phone} onChangeText={(value) => onChange('phone', value)} error={errors.phone} keyboardType="phone-pad" placeholder="71 234 567" />
      {actionError ? <Text accessibilityRole="alert" style={styles.error}>{actionError}</Text> : null}
      <PrimaryButton label="Verify mobile number" onPress={onContinue} loading={loading} style={styles.button} />
      <Text onPress={onSignIn} style={styles.switchText}>Already have an account? <Text style={styles.switchStrong}>Sign in</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  nameRow: { flexDirection: 'row', gap: spacing.sm },
  nameField: { flex: 1 },
  button: { marginTop: spacing.sm },
  switchText: { color: colors.black[500], textAlign: 'center', fontSize: 13, fontWeight: '600', paddingVertical: spacing.md },
  switchStrong: { color: colors.black[950], fontWeight: '900' },
  error: { color: colors.error, fontSize: 13, lineHeight: 19 },
});
