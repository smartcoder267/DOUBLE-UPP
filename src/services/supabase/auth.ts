import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

export const PENDING_SIGNUP_DRAFT_KEY = 'double-up.pending-sign-up.v1';

export async function clearPendingSignUpDraft(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_SIGNUP_DRAFT_KEY);
}

export type PhoneSimulationChallenge = {
  challenge_id: string;
  code: string;
  expires_at: string;
};

export type SignUpDetails = {
  firstName: string;
  lastName: string;
  phoneChallengeId: string;
  email: string;
  password: string;
};

export async function requestPhoneSimulationCode(phone: string): Promise<PhoneSimulationChallenge> {
  const { data, error } = await supabase.rpc('create_phone_simulation_challenge', { p_phone: phone });
  if (error) throw new Error(mapAuthError(error.message));

  const challenge = data as unknown as PhoneSimulationChallenge | null;
  if (!challenge?.challenge_id || !challenge.code || !challenge.expires_at) {
    throw new Error('Could not start phone verification. Please try again.');
  }
  return challenge;
}

export async function verifyPhoneSimulationCode(challengeId: string, code: string): Promise<void> {
  const { data, error } = await supabase.rpc('verify_phone_simulation_challenge', {
    p_challenge_id: challengeId,
    p_code: code,
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (data !== true) throw new Error('That code is incorrect or expired. Request a new code and try again.');
}

export async function registerWithEmail(details: SignUpDetails): Promise<{ user: User; session: Session | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: details.email.trim().toLowerCase(),
    password: details.password,
    options: {
      data: {
        first_name: details.firstName.trim(),
        last_name: details.lastName.trim(),
        phone_challenge_id: details.phoneChallengeId,
      },
    },
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.user) throw new Error('Supabase did not return the new account. Please try again.');
  return { user: data.user, session: data.session };
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.user) throw new Error('Sign in did not return an account. Please try again.');
  return data.user;
}

export async function resendSignupEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLowerCase(),
  });
  if (error) throw new Error(mapAuthError(error.message));
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw new Error(mapAuthError(error.message));
}

export async function getSignedInUser(): Promise<User | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(mapAuthError(sessionError.message));
  if (!sessionData.session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(mapAuthError(error.message));
  return data.user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapAuthError(error.message));
}

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('email not confirmed')) return 'Confirm your email from the link we sent, then sign in here.';
  if (normalized.includes('already registered') || normalized.includes('already been registered')) return 'An account already uses this email. Sign in or use password reset.';
  if (normalized.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (normalized.includes('password should be at least')) return 'Use a password with at least 8 characters.';
  if (normalized.includes('invalid_phone')) return 'Enter a valid Botswana mobile number.';
  if (normalized.includes('otp_resend_too_soon')) return 'Wait a moment before requesting another code.';
  return message;
}
