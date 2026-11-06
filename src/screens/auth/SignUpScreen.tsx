import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { SignUpProgress } from '../../components/auth/SignUpProgress';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { clearPendingSignUpDraft, PENDING_SIGNUP_DRAFT_KEY, registerWithEmail, requestPhoneSimulationCode, resendSignupEmail, signInWithEmail, verifyPhoneSimulationCode } from '../../services/supabase/auth';
import { AccountReadyStep } from './sign-up/AccountReadyStep';
import { CredentialsStep } from './sign-up/CredentialsStep';
import { EmailLinkVerificationStep } from './sign-up/EmailLinkVerificationStep';
import { PersonalDetailsStep } from './sign-up/PersonalDetailsStep';
import { CredentialsErrors, PersonalDetailsErrors, SignUpValues } from './sign-up/types';
import { VerificationStep } from './sign-up/VerificationStep';

export type { SignUpValues } from './sign-up/types';

type SignUpScreenProps = {
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (values: SignUpValues) => void;
};

type SignUpStep = 'personal' | 'phone-verification' | 'credentials' | 'email-verification' | 'ready';
type PendingSignUpDraft = Pick<SignUpValues, 'firstName' | 'lastName' | 'phone' | 'email'>;

const stepDetails: Record<Exclude<SignUpStep, 'ready'>, { number: number; eyebrow: string; title: string; description: string }> = {
  personal: { number: 1, eyebrow: 'CREATE YOUR WALLET', title: 'Let’s start with you.', description: 'Enter your name and Botswana mobile number to begin securely.' },
  'phone-verification': { number: 2, eyebrow: 'MOBILE VERIFICATION', title: 'Confirm your number.', description: 'This prototype code confirms the onboarding step, not ownership of your SIM.' },
  credentials: { number: 3, eyebrow: 'SECURE YOUR ACCOUNT', title: 'Add your sign-in details.', description: 'Your email and password create the primary Double Up account.' },
  'email-verification': { number: 4, eyebrow: 'EMAIL VERIFICATION', title: 'Check your inbox.', description: 'Confirm your email to activate your account. Your name and phone challenge are attached to this account.' },
};

export function SignUpScreen({ onBack, onSignIn, onSubmit }: SignUpScreenProps) {
  const [step, setStep] = useState<SignUpStep>('personal');
  const [values, setValues] = useState<SignUpValues>({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [personalErrors, setPersonalErrors] = useState<PersonalDetailsErrors>({});
  const [credentialsErrors, setCredentialsErrors] = useState<CredentialsErrors>({});
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneChallengeId, setPhoneChallengeId] = useState<string>();
  const [phoneCodeExpiresAt, setPhoneCodeExpiresAt] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(PENDING_SIGNUP_DRAFT_KEY)
      .then((saved) => {
        if (!mounted || !saved) return;
        const draft = JSON.parse(saved) as Partial<PendingSignUpDraft>;
        setValues((current) => ({
          ...current,
          firstName: typeof draft.firstName === 'string' ? draft.firstName : current.firstName,
          lastName: typeof draft.lastName === 'string' ? draft.lastName : current.lastName,
          phone: typeof draft.phone === 'string' ? draft.phone : current.phone,
          email: typeof draft.email === 'string' ? draft.email : current.email,
        }));
      })
      .catch(() => undefined)
      .finally(() => { if (mounted) setDraftHydrated(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!draftHydrated) return;
    const draft: PendingSignUpDraft = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      email: values.email,
    };
    void AsyncStorage.setItem(PENDING_SIGNUP_DRAFT_KEY, JSON.stringify(draft));
  }, [draftHydrated, values.firstName, values.lastName, values.phone, values.email]);

  const updateValue = (key: keyof SignUpValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setPersonalErrors((current) => ({ ...current, [key]: undefined }));
    setCredentialsErrors((current) => ({ ...current, [key]: undefined }));
    setActionError(undefined);
  };

  const continueFromPersonal = async () => {
    const nextErrors: PersonalDetailsErrors = {};
    if (!values.firstName.trim()) nextErrors.firstName = 'Enter your first name.';
    if (!values.lastName.trim()) nextErrors.lastName = 'Enter your last name.';
    if (!/^(?:\+267)?[237]\d{7}$/.test(values.phone.replace(/[\s()-]/g, ''))) nextErrors.phone = 'Enter a valid Botswana mobile number.';
    setPersonalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setActionError(undefined);
    try {
      const challenge = await requestPhoneSimulationCode(values.phone);
      setPhoneChallengeId(challenge.challenge_id);
      setPhoneCodeExpiresAt(challenge.expires_at);
      setPhoneCode(challenge.code);
      setCodeError(undefined);
      setStep('phone-verification');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not start phone verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const continueFromCredentials = async () => {
    const nextErrors: CredentialsErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (confirmPassword !== values.password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!acceptedTerms) nextErrors.terms = 'Accept the terms to continue.';
    setCredentialsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!phoneChallengeId) {
      setActionError('Verify your mobile number before creating your account.');
      setStep('phone-verification');
      return;
    }

    setIsLoading(true);
    setActionError(undefined);
    try {
      const result = await registerWithEmail({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneChallengeId,
        email: values.email,
        password: values.password,
      });
      if (result.session) {
        setStep('ready');
      } else {
        setStep('email-verification');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!phoneChallengeId || !phoneCodeExpiresAt || Date.now() >= new Date(phoneCodeExpiresAt).getTime()) {
      setCodeError('This code has expired. Request a new code to continue.');
      return;
    }
    if (phoneCode.length !== 6) {
      setCodeError('Enter the complete six-digit code.');
      return;
    }
    setIsLoading(true);
    setCodeError(undefined);
    try {
      await verifyPhoneSimulationCode(phoneChallengeId, phoneCode);
      setStep('credentials');
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : 'That code could not be verified.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendPhoneCode = async () => {
    setIsLoading(true);
    setCodeError(undefined);
    try {
      const challenge = await requestPhoneSimulationCode(values.phone);
      setPhoneChallengeId(challenge.challenge_id);
      setPhoneCodeExpiresAt(challenge.expires_at);
      setPhoneCode(challenge.code);
    } catch (error) {
      setCodeError(error instanceof Error ? error.message : 'Could not send a new code.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerification = async () => {
    setIsLoading(true);
    setActionError(undefined);
    try {
      await signInWithEmail(values.email, values.password);
      setStep('ready');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Email is not verified yet.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailVerification = async () => {
    setIsLoading(true);
    setActionError(undefined);
    try {
      await resendSignupEmail(values.email);
      setActionError('A new verification email was sent.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not resend the verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'personal') {
      void clearPendingSignUpDraft();
      return onBack();
    }
    if (step === 'phone-verification') return setStep('personal');
    if (step === 'credentials') return setStep('phone-verification');
    if (step === 'email-verification') return onBack();
  };

  if (step === 'ready') {
    return (
      <ScreenContainer contentStyle={styles.readyContent}>
        <AccountReadyStep
          firstName={values.firstName.trim()}
          onComplete={() => {
            void clearPendingSignUpDraft();
            onSubmit({ ...values, email: values.email.trim().toLowerCase(), phone: values.phone.replace(/[\s()-]/g, '') });
          }}
        />
      </ScreenContainer>
    );
  }

  const details = stepDetails[step];

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <AuthHeader eyebrow={details.eyebrow} title={details.title} description={details.description} onBack={handleBack} />
      <SignUpProgress currentStep={details.number} totalSteps={4} />
      {step === 'personal' ? <PersonalDetailsStep values={values} errors={personalErrors} actionError={actionError} loading={isLoading} onChange={updateValue} onContinue={continueFromPersonal} onSignIn={() => { void clearPendingSignUpDraft(); onSignIn(); }} /> : null}
      {step === 'phone-verification' ? <VerificationStep destination={values.phone} code={phoneCode} error={codeError} loading={isLoading} onCodeChange={(value) => { setPhoneCode(value); setCodeError(undefined); }} onContinue={verifyCode} onResend={resendPhoneCode} /> : null}
      {step === 'credentials' ? <CredentialsStep values={values} confirmPassword={confirmPassword} acceptedTerms={acceptedTerms} errors={credentialsErrors} actionError={actionError} loading={isLoading} onChange={updateValue} onConfirmPasswordChange={(value) => { setConfirmPassword(value); setCredentialsErrors((current) => ({ ...current, confirmPassword: undefined })); }} onTermsChange={(value) => { setAcceptedTerms(value); setCredentialsErrors((current) => ({ ...current, terms: undefined })); }} onContinue={continueFromCredentials} /> : null}
      {step === 'email-verification' ? <EmailLinkVerificationStep email={values.email.trim().toLowerCase()} error={actionError} loading={isLoading} onCheckVerification={checkEmailVerification} onResend={resendEmailVerification} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  readyContent: { flex: 1 },
});
