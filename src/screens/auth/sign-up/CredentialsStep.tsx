import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckboxRow } from '../../../components/forms/CheckboxRow';
import { FormField } from '../../../components/forms/FormField';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { colors, spacing } from '../../../theme/tokens';
import { CredentialsErrors, SignUpValues } from './types';

type CredentialsStepProps = {
  values: SignUpValues;
  confirmPassword: string;
  acceptedTerms: boolean;
  errors: CredentialsErrors;
  actionError?: string;
  loading?: boolean;
  onChange: (key: keyof SignUpValues, value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTermsChange: (value: boolean) => void;
  onContinue: () => void;
};

export function CredentialsStep(props: CredentialsStepProps) {
  return (
    <View style={styles.form}>
      <FormField label="Email address" icon="mail" value={props.values.email} onChangeText={(value) => props.onChange('email', value)} error={props.errors.email} keyboardType="email-address" placeholder="name@example.com" />
      <FormField label="Create a password" icon="lock" value={props.values.password} onChangeText={(value) => props.onChange('password', value)} error={props.errors.password} password placeholder="At least 8 characters" />
      <FormField label="Confirm password" icon="lock" value={props.confirmPassword} onChangeText={props.onConfirmPasswordChange} error={props.errors.confirmPassword} password placeholder="Enter your password again" />
      <CheckboxRow checked={props.acceptedTerms} onChange={props.onTermsChange} error={props.errors.terms} label={<>I agree to the Double Up terms and understand this prototype uses test funds only.</>} />
      {props.actionError ? <Text accessibilityRole="alert" style={styles.error}>{props.actionError}</Text> : null}
      <PrimaryButton label="Create account and verify email" onPress={props.onContinue} loading={props.loading} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, button: { marginTop: spacing.sm }, error: { color: colors.error, fontSize: 13, lineHeight: 19 } });
