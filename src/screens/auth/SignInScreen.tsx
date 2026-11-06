import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FormField } from '../../components/forms/FormField';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { colors, spacing } from '../../theme/tokens';
import { sendPasswordResetEmail } from '../../services/supabase/auth';

type SignInScreenProps = {
  onBack: () => void;
  onCreateAccount: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function SignInScreen({ onBack, onCreateAccount, onSubmit }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [requestError, setRequestError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
    setEmailError(validEmail ? undefined : 'Enter your registered email address.');
    setPasswordError(password ? undefined : 'Enter your password.');
    if (!validEmail || !password) return;
    setLoading(true);
    setRequestError(undefined);
    setNotice(undefined);
    try {
      await onSubmit(email.trim().toLowerCase(), password);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError('Enter your email address first so we can send a reset link.');
      return;
    }
    setLoading(true);
    setRequestError(undefined);
    setNotice(undefined);
    try {
      await sendPasswordResetEmail(email);
      setNotice('If an account exists for this email, a password reset link has been sent.');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Could not send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <AuthHeader
        eyebrow="WELCOME BACK"
        title="Sign in to your wallet."
        description="Continue securely to your Double Up account and test fund activity."
        onBack={onBack}
      />
      <View style={styles.heroStage}>
        <View style={styles.heroGlow} />
        <Image source={require('../../../assets/sign-in-secure.png')} resizeMode="contain" style={styles.heroImage} />
      </View>
      <View style={styles.form}>
        <FormField label="Email address" icon="mail" value={email} onChangeText={(value) => { setEmail(value); setEmailError(undefined); }} error={emailError} keyboardType="email-address" placeholder="name@example.com" />
        <FormField label="Password" icon="lock" value={password} onChangeText={(value) => { setPassword(value); setPasswordError(undefined); }} error={passwordError} password placeholder="Enter your password" />
        <Pressable accessibilityRole="button" disabled={loading} onPress={handlePasswordReset} style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
        {requestError ? <Text accessibilityRole="alert" style={styles.error}>{requestError}</Text> : null}
        {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
        <PrimaryButton label="Sign in" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
        <Text onPress={onCreateAccount} style={styles.switchText}>New to Double Up? <Text style={styles.switchStrong}>Create an account</Text></Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  heroStage: { height: 190, alignItems: 'center', justifyContent: 'center', marginTop: -16, marginBottom: spacing.lg },
  heroGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: colors.red[50] },
  heroImage: { width: 230, height: 205 },
  form: { gap: spacing.lg },
  forgotButton: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  forgotText: { color: colors.red[600], fontSize: 13, fontWeight: '800' },
  submitButton: { marginTop: spacing.sm },
  switchText: { color: colors.black[500], textAlign: 'center', fontSize: 13, fontWeight: '600', paddingVertical: spacing.md },
  switchStrong: { color: colors.black[950], fontWeight: '900' },
  error: { color: colors.error, fontSize: 13, lineHeight: 19 },
  notice: { color: colors.black[700], fontSize: 13, lineHeight: 19 },
});

