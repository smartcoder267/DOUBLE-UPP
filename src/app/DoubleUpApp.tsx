import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { DoubleUpOnboardingScreen } from '../screens/startup/DoubleUpOnboardingScreen';
import { DoubleUpSplashScreen } from '../screens/startup/DoubleUpSplashScreen';
import { DoubleUpWelcomeScreen } from '../screens/startup/DoubleUpWelcomeScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { AuthenticatedHomeScreen } from '../screens/auth/AuthenticatedHomeScreen';
import { clearPendingSignUpDraft, signInWithEmail, signOut } from '../services/supabase/auth';
import { supabase } from '../services/supabase/client';

type StartupRoute = 'splash' | 'onboarding' | 'welcome' | 'create-account' | 'sign-in' | 'authenticated';

export default function DoubleUpApp() {
  const [route, setRoute] = useState<StartupRoute>('splash');
  const [user, setUser] = useState<User | null>(null);
  const routeRef = useRef(route);
  routeRef.current = route;

  const handleSignOut = async () => {
    await signOut();
    await clearPendingSignUpDraft();
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session && ['INITIAL_SESSION', 'SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        if (['splash', 'onboarding', 'welcome', 'sign-in'].includes(routeRef.current)) {
          setRoute('authenticated');
        }
      } else if (event === 'SIGNED_OUT' && routeRef.current === 'authenticated') {
        setRoute('welcome');
      }
    });

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        setUser(data.user);
        if (['splash', 'onboarding', 'welcome', 'sign-in'].includes(routeRef.current)) setRoute('authenticated');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (route === 'authenticated' && user) {
    return <AuthenticatedHomeScreen user={user} onSignOut={handleSignOut} />;
  }

  if (route === 'splash') {
    return <DoubleUpSplashScreen onFinish={() => setRoute((current) => current === 'splash' ? 'onboarding' : current)} />;
  }

  if (route === 'onboarding') {
    return <DoubleUpOnboardingScreen onFinish={() => setRoute('welcome')} onSignIn={() => setRoute('sign-in')} />;
  }

  if (route === 'welcome') {
    return <DoubleUpWelcomeScreen onCreateAccount={() => setRoute('create-account')} onSignIn={() => setRoute('sign-in')} />;
  }

  if (route === 'create-account') {
    return (
      <SignUpScreen
        onBack={() => setRoute('welcome')}
        onSignIn={() => setRoute('sign-in')}
        onSubmit={() => {
          void supabase.auth.getUser().then(({ data, error }) => {
            if (!error && data.user) setUser(data.user);
            setRoute('authenticated');
          });
        }}
      />
    );
  }

  if (route === 'sign-in') {
    return (
      <SignInScreen
        onBack={() => setRoute('welcome')}
        onCreateAccount={() => setRoute('create-account')}
        onSubmit={async (email, password) => {
          const signedInUser = await signInWithEmail(email, password);
          await clearPendingSignUpDraft();
          setUser(signedInUser);
          setRoute('authenticated');
        }}
      />
    );
  }

  return null;
}
