# Supabase setup

## Project

• Name: Double Up
• Organization: Autobots Dev
• Region: `eu-west-2`
• Project ref: `erhsfuvwawdsmgwnulkj`
• API URL: `https://erhsfuvwawdsmgwnulkj.supabase.co`
• Current state: healthy; profile/wallet schema and phone challenge RPCs are deployed

The previous `autobotsdev` project was not modified. Keep the publishable key in local environment configuration and never put a Supabase secret/service-role key in this mobile app.

## Local configuration

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key (`sb_publishable_...`), never a secret key.
3. Restart Expo after changing environment values.

`.env.local` is ignored by Git. `.env.example` contains no credentials.

## Client

`src/services/supabase/client.ts` creates one Supabase client, persists sessions in AsyncStorage, refreshes tokens, and disables URL session detection for the native app.

## Registration lifecycle

The four visual steps remain: name/phone, phone OTP, email/password, email verification. Name, phone, and email progress are saved as a local onboarding draft; passwords and OTP values are never saved there. The email/password step creates the primary Supabase Auth user and includes the verified challenge ID with signup metadata. The auth trigger accepts that challenge only if it was verified and not claimed before, then creates the profile and one personal BWP wallet in the same Auth identity. Do not use phone OTP sign-in for this path, because it can create a separate passwordless identity.

### Prototype phone code behavior

`create_phone_simulation_challenge` is callable before signup. It normalizes Botswana numbers, limits resend frequency, creates a six-digit code with a five-minute expiry, and stores only its hash. For the current prototype it returns the generated code so the app can autofill the code cells. `verify_phone_simulation_challenge` rejects wrong, expired, exhausted, null, and reused codes; it allows up to five attempts. The challenge is claimed once by the Auth user during account creation. The profile records `phone_verification_mode = prototype_fcm` and `phone_verification_status = simulated_verified`.

This code is not sent by SMS or FCM and does not prove control of the SIM. Returning it to the app is intentional only for prototype autofill. When Firebase/FCM is ready, replace this delivery behavior with a push notification and stop returning the code from the create response. Keep the same explicit simulated-verification label; FCM proves access to an app installation, not phone-number ownership.

The Auth-created email confirmation is real. The current screen lets the user return from the email and press “I’ve verified my email”; the app then signs in against Supabase, which rejects unconfirmed accounts. Deep-link callback configuration for automatic return is still outstanding.

The local pending signup draft is cleared on completion, cancellation from the first step, and logout. Never treat client-supplied user metadata as authorization or verified contact data. The database trigger validates and claims the challenge itself.

## Still required

• Configure Supabase email templates, allowed redirect URLs, and the app deep-link scheme for automatic email-confirmation return.
• Configure Firebase/FCM for push delivery of simulated OTPs. No SMS provider is used by the current prototype flow.
• The wallet row is an identity placeholder only; there is no balance or ledger yet.
• Do not grant client insert/update rights to authoritative wallet balances.
