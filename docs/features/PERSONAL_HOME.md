# Personal Home and Navigation

## Status

Implemented and checked on the connected Samsung Android phone on 6 November 2026.

This slice replaces the temporary signed-in account summary with the first real Double Up Personal workspace. It provides the application shell and honest presentation states; it does not yet implement financial ledger operations.

## User flow

1. A restored or newly created Supabase session enters the Personal workspace.
2. The app loads the signed-in user's profile and personal BWP wallet summary.
3. Home shows the user's first name, wallet status, five transaction shortcuts, and recent activity state.
4. The permanent navigation provides Home, Pay, Requests, Activity, and Profile.
5. Pay opens QR and six-digit payment PIN entry choices.
6. Requests explains receive requests and provides the create-request entry point.
7. Activity provides the full transaction list state.
8. Profile shows the real signed-in identity and wallet summary and owns the sign-out action.

## Current data behavior

The current backend provides a profile and one personal wallet with `id`, `user_id`, `currency`, `status`, and `created_at`. It does not yet provide an authoritative balance, transaction ledger, payment requests, or notifications.

For that reason:

- Home displays `P —` and `Balance connection pending` rather than inventing a balance.
- Home and Activity display a clear no-activity state rather than sample transactions.
- Pay, Send, Deposit, Withdraw, notifications, and receive-request creation explain that the secure operation is pending backend connection.
- The app uses a custom Double Up bottom sheet for these messages, not a native Android product dialog.

## Code structure

```text
src/
  components/
    common/ActionRow.tsx
    feedback/FeaturePreviewSheet.tsx
    layout/TabScreen.tsx
  features/
    account/accountService.ts
    home/
      HomeHeader.tsx
      QuickActions.tsx
      RecentActivity.tsx
      WalletBalancePanel.tsx
      types.ts
  navigation/
    components/AppBottomNavigation.tsx
    configs/personalNavigation.ts
    types.ts
  screens/
    auth/AuthenticatedHomeScreen.tsx
    home/
      HomeScreen.tsx
      PayScreen.tsx
      RequestsScreen.tsx
      ActivityScreen.tsx
      ProfileScreen.tsx
```

`AuthenticatedHomeScreen` is the signed-in container. It owns selected-tab state, account loading, account errors, sign-out state, and temporary feature information sheets. Presentation screens receive data and callbacks through typed props.

`accountService` owns the Supabase profile and wallet summary queries. This keeps database access out of visual components and gives the future repository/API layer a single replacement point.

`AppBottomNavigation` is generic and configuration-driven. Agent and Admin navigation should reuse it with separate authorized configurations.

## States and interaction rules

- Account load errors appear in an in-app red-tinted banner with Retry.
- Profile and wallet loading states do not expose fake values.
- Bottom navigation contains exactly five labeled, accessible touch targets.
- All shortcuts use Feather icons; there are no emoji or decorative sparkle icons.
- The surface palette remains white, red, black, and grey.
- Rounded, borderless grey surfaces are used for grouped actions and empty states.
- The Expo Go floating tools button visible during development is not part of the app interface.

## Native verification record

Device: Samsung SM-A716V, Android device ID `R5CN702K3JH`.

Verified:

- The real signed-in profile and BWP wallet status load successfully.
- Home shows all five quick actions on one row.
- Home, Pay, Requests, Activity, and Profile can each be selected from the bottom navigation.
- The selected tab receives the red active state and all labels remain readable.
- Pay shows Scan QR code and Enter payment PIN.
- Requests and Activity show clear empty states.
- Profile shows the real email, phone, prototype verification state, wallet currency/status, and Sign out.
- Send opens the custom feature information sheet.
- TypeScript completes with no errors.

No browser test was run, following the project instruction.

## Backend work still required

1. Add an append-only wallet ledger and authoritative available/pending balance calculation.
2. Add transaction queries, status mapping, pagination, and receipt details.
3. Implement Send with recipient validation, idempotency, limits, and ledger entries.
4. Implement receive requests with service, amount, QR code, six-digit PIN, reuse count, and completion rules.
5. Implement Pay QR scanning and PIN payment confirmation.
6. Implement agent-assisted Deposit and Withdraw with separate operational float and customer confirmation.
7. Implement persistent notification records and delivery.
8. Replace temporary feature sheets with real flows only after their backend contracts and security rules are approved.
