# Double Up Development Memory

## Purpose

This file is the running project memory for Double Up. It records what has been understood, what has been decided, what has been built, what remains, and what still needs approval.

It is not a replacement for detailed technical documentation. The detailed project documents are linked from the documentation index.

## Product identity

The product name is Double Up. PulaPay is the previous project name and may remain in old files only until the user interface and configuration are updated.

Double Up is a digital wallet platform for persistent test fund transactions. It is not a collection of driver, vendor, provider, or transport workspaces.

People may use the wallet for different activities, such as transport, selling food, student expenses, family transfers, or ordinary payments. These activities do not create separate personal wallets.

Each person has one personal wallet. An approved agent also has a separate agent operational account and float.

## Current baseline

The current app is an Expo and React Native prototype. Most behavior is inside `App.tsx` and uses local React state.

The current prototype includes local demonstrations of:

• Registration and login
• Simulated verification codes
• Personal wallet actions
• Send, pay, deposit, and withdrawal screens
• Agent cash in and cash out
• Driver fare demonstrations
• QR and payment code concepts
• Activity history
• Physical card display
• USSD simulation
• Profile and logout behavior

The current prototype does not yet have a real backend, persistent shared ledger, real authentication, real notification delivery, or server enforced permissions.

## Confirmed product direction

The target is a clean working prototype with:

• Real user registration
• Real authenticated sessions
• One personal wallet per user
• Persistent backend test fund balances
• Backend controlled transactions
• Multi user transfers
• Receive requests using QR codes and six digit payment PINs
• Complete or Reuse decisions after the first successful receive payment
• Agent operations using a separate agent account and float
• A separate agent PIN when entering agent mode
• Withdrawal using a code or QR code
• Clear error and success states
• Test fund labels on balances and receipts
• Restricted administrative actions
• Durable transaction history

## Product rules

1. Personal wallets are not separated by occupation.
2. A driver, food seller, student, or ordinary customer uses the same personal wallet model.
3. Agent float is separate from personal funds.
4. Agent mode requires a separate agent PIN after the user has been approved as an agent.
5. A receive request creates a QR code and a six digit payment PIN.
6. The first successful payment causes the receiver to choose Complete or Reuse.
7. A reusable receive request remains accessible while other receive requests can be created.
8. Completing a receive request closes it and prevents further payment.
9. Withdrawal can be initiated using a withdrawal code or QR code.
10. The agent must see the withdrawal customer's identity and amount before confirming.
11. All wallet decisions and balance changes must be enforced by the backend.
12. Test funds are not real money and must not be presented as redeemable funds.

## Official project services

The official source repository is:

`https://github.com/autobotsdev49-bot/Double-Up.git`

The GitHub account display name is Autobotsdev.

The backend will use Supabase under the account or workspace named Double up. The planned Supabase project name is Double Up.

The GitHub repository is the source of truth for application code, database migrations, backend functions, documentation, and approved project configuration.

Supabase secrets, service role keys, private credentials, and local environment files must never be committed to GitHub.

The repository and Supabase project should be connected only after the setup plan and initial backend scope are approved.

## Interface rules

The interface should use:

• Actual icon assets or icon library icons
• No emoji icons
• No decorative sparkle symbols
• Custom Double Up cards
• Custom Double Up popups and modal sheets
• No native Android alert or dialog appearance for normal product flows
• Clear loading states
• Clear empty states
• Clear error states
• Clear success states
• Purposeful success animations
• Liquid Glass visual treatment combined with clean FlatList based content
• Professional spacing, typography, contrast, and touch targets
• Accessible labels and understandable feedback

The UI should feel like one coherent product. Native platform behavior may still be used where required for operating system permissions or system security, but normal product dialogs should use Double Up components.

Browser testing must not be run unless the user explicitly requests it. Native interface checks should use the connected Android phone when a device check is needed.

Buttons and interactive controls use rounded corners. Screens must include deliberate top spacing so content does not compete with the Android status area.

## Brand and visual direction

Double Up uses red, black, and white as its main brand colors.

The design system must include shades and tints for each main color. The palette should not use only one red, one black, and one white value.

The color system should provide semantic tokens for:

• Primary red
• Dark red
• Light red tint
• Soft red background
• Black
• Near black
• Charcoal
• White
• Soft white
• Light gray surfaces
• Border gray
• Secondary text gray
• Disabled text and controls
• Success state
• Warning state
• Error state

Red should communicate primary actions, active controls, confirmations, important financial emphasis, and branded highlights. Black should provide strong contrast, navigation, and premium surfaces. White and soft white should support readable cards, forms, and clean content areas.

The exact color values should be defined as shared design tokens before the first major UI implementation. Screens should consume semantic names instead of hardcoded color values.

The splash screen animation shared on 6 November 2026 is the visual reference for the Double Up startup experience. It should be reviewed before implementing the final splash screen.

## Code quality rules

• Keep screens focused on presentation and user interaction.
• Keep business rules in feature modules or services.
• Keep backend calls out of visual components where possible.
• Use shared types instead of repeating object shapes.
• Use clear names for files, functions, states, and API results.
• Keep one responsibility per module.
• Prefer small files that are easy to test.
• Do not add a dependency when an existing project capability is sufficient.
• Do not copy old UberClone implementation patterns without checking whether they fit the current Expo and TypeScript setup.
• Run type checking and relevant tests after meaningful changes.
• Do not claim a flow is complete until it has been verified through the real application path.

## Approval rule

Every major change requires approval from the user before implementation.

Major changes include:

• Database schema changes
• Authentication changes
• New backend services
• Changes to wallet or ledger behavior
• Changes to agent permissions
• Changes to payment request behavior
• New external services
• New dependencies with meaningful impact
• Navigation restructuring
• Major UI or branding changes
• Security model changes
• Deployment or production configuration

Normal small corrections that are required to complete an already approved change may be grouped into the same approval scope, but the scope must be stated clearly.

## Progress status

### Completed

• Current PulaPay prototype reviewed.
• Existing local authentication and wallet flows documented in conversation.
• Double Up product specification reviewed.
• Product corrected from role workspaces to a digital wallet platform.
• Receive flow clarified to use QR plus six digit payment PIN.
• Withdrawal clarified to support QR or code based processing.
• Separate agent PIN requirement recorded.
• UberClone project inspected as a code structure reference.
• Documentation baseline created.
• Existing `App.tsx` preserved as `legacy/PulaPayPrototypeApp.tsx` before the new entry structure was introduced.
• New Double Up startup shell added with separate theme tokens, reusable glass card, reusable primary button, and startup screen modules.
• Root entry now opens the new Double Up startup shell while the original `App.tsx` remains unchanged.
• TypeScript check passed after the startup structure was added.
• Root files were organized without deletion. The APK moved to `artifacts/apk`, development scripts moved to `scripts`, logs moved to `logs`, the full product specification moved to `docs/specifications`, and the old root application moved to `legacy`.
• Reusable authentication layout, header, input, checkbox, primary button, registration screen, and sign in screen were added.
• Registration and onboarding were checked on the connected Samsung Android phone. The onboarding top inset was corrected after the native check.
• The post-onboarding welcome screen was redesigned around a professional Double Up wallet illustration, concise product copy, and more rounded red and black actions.
• Primary buttons and the onboarding action now use the larger shared corner radius.
• Registration was separated into four clear stages: personal details and mobile number, mobile OTP verification, email and password, and email link verification.
• Reusable registration progress, six-digit verification input, verification screen, credentials screen, personal-details screen, and animated account-ready components were added.
• A professional security illustration was generated and added to the Sign In screen.
• The updated welcome, first registration stage, mobile verification stage, credentials stage, and Sign In screen were checked on the connected Samsung Android phone.
• TypeScript passed after the progressive registration and Sign In visual updates.
• Email verification was corrected to use a secure email link instead of a six digit email OTP. The screen now shows the destination email, waiting state, verification status check, and resend link action.
• A clean reusable personal Home screen presentation layer was added under `src/features/home` and `src/screens/home`. It includes the personal balance panel, Send, Pay, Receive, Deposit, Withdraw and History actions, recent activity loading/error/empty/populated states, notification/profile controls, and bottom navigation.
• The new Home screen is intentionally separate from the live Supabase authenticated container while the concurrent backend task finishes its data integration.
• Bottom navigation was approved and locked on 6 November 2026 with a maximum of five buttons. Personal uses Home, Pay, Requests, Activity, and Profile. Agent uses Overview, Deposit, Withdraw, Activity, and Profile. Admin uses Overview, Users, Reviews, Transactions, and More.
• Personal Home quick actions are Send, Pay, Receive, Deposit, and Withdraw. History is available through Activity and is not repeated as a Home quick action.
• Approved agents switch only between Personal and Agent modes using the separate agent PIN. Admin uses a restricted admin session and is not an ordinary mode switch. Driver and provider workspaces are not part of Double Up.
• The full navigation decision, access rules, implementation structure, and verification checklist are recorded in `docs/NAVIGATION.md`.

### In progress

• Agreeing the clean Double Up project structure.
• Agreeing the first implementation flow.
• Preparing the backend and authentication architecture.
• Connecting the approved registration interface to real backend authentication and verification delivery.

The bullets above describe the pre-auth foundation state and are superseded by the implementation record below.

### Backend and Supabase status (2026-11-06)

• The referenced frontend task designed four steps: name/phone, phone code, email/password, and email confirmation. Its verification screens were prototypes before the implementation recorded below.
• Initial Supabase inspection found an older inactive `autobotsdev` project; it remains untouched and is not the app's backend.

### Backend direction confirmed (2026-11-06)

• Created **Double Up** under **Autobots Dev**, region `eu-west-2`, project ref `erhsfuvwawdsmgwnulkj`, API URL `https://erhsfuvwawdsmgwnulkj.supabase.co`. It reports healthy. The prior `autobotsdev` project was left untouched.
• User chose email/password as the primary account identity while retaining the four-step UI. Name, phone, and email are saved in local draft storage; passwords and OTP values are not saved.
• The temporary pre-auth OTP is generated server-side, hashed in a private table, expires after five minutes, is limited to five attempts, and can be used once. For prototype autofill, the create RPC returns the code to the app. Profile status is labeled `simulated_verified`/`prototype_fcm`, not real phone ownership. The auth trigger validates and claims the challenge for the new email identity, then creates a profile and exactly one BWP wallet.
• Supabase email/password signup, email confirmation resend/check-by-sign-in, sign-in, persistent session restore, sign-out, and profile/wallet loading are connected. Password-reset email requests are wired; recovery-link completion remains open.
• Four migrations are deployed and local filenames match the remote migration history: `20261106024337_auth_profile_wallet_and_phone_challenges.sql`, `20261106025239_harden_phone_simulation_challenges.sql`, `20261106025632_protect_challenge_access_and_claim_verified_phone.sql`, and `20261106030153_limit_phone_challenge_rpcs_to_signup.sql`. Profile and wallet tables have RLS; clients can read only their own rows and have no write grants. OTP RPC execution is limited to the pre-signup `anon` role.
• Supabase security advisors flag the intentionally anon-callable `SECURITY DEFINER` OTP RPCs because signup begins before authentication and the code is returned for autofill. This is temporary prototype-only behavior; remove code return and switch to FCM delivery before broad/public use. FCM and automatic email deep-link return are not configured.
• TypeScript passes. API checks passed for six-digit challenge generation, null rejection, correct verification, one-time use, five-attempt limit, and resend cooldown. No real Auth user, inbox, or device signup was tested.

### Next proposed work

1. Approve the target project structure.
2. Approve the startup and authentication foundation.
3. Connect the existing Double Up startup and authentication screens to the navigation shell selected for the full app.
4. Configure the email redirect allowlist and app deep-link callback; finish email-confirmation and recovery testing on a device.
5. Configure Firebase/FCM and replace the temporary OTP code return with push delivery.
6. Test real signup, email verification, login, session restore, logout, profile, and wallet creation with two test accounts.
7. Connect the wallet dashboard to backend data.
8. Implement Send Money, receive requests, payment requests, then agent setup and the separate agent PIN.

### Personal Home and navigation implementation (2026-11-06)

• User approval was received to replace the signed-in placeholder with the proper Personal Home and approved bottom navigation.
• Implemented the five locked Personal destinations: Home, Pay, Requests, Activity, and Profile. Navigation is configuration-driven and reusable for future authorized Agent and Admin configurations.
• Implemented the exact Home shortcuts: Send, Pay, Receive, Deposit, and Withdraw. Pay routes to Pay; Receive routes to Requests; Activity is not duplicated as a shortcut.
• Added focused Pay, Requests, Activity, and Profile screens, reusable tab layout and action-row components, and a custom Double Up information sheet for secure operations that are not connected yet.
• Moved profile and wallet summary queries into `src/features/account/accountService.ts`. The signed-in container now owns account loading/error/retry, selected tab, feature-sheet state, and sign out.
• The current wallet table has no balance or ledger fields. Home intentionally displays `P —` and `Balance connection pending`; Activity intentionally displays no activity. No money or transactions were fabricated.
• Native verification passed on the connected Samsung SM-A716V (`R5CN702K3JH`) for Home, Pay, Requests, Activity, Profile, five quick actions on one row, selected navigation states, real profile/wallet details, empty states, and the custom feature sheet. No browser test was run.
• TypeScript passed with `tsc --noEmit` after implementation. Full implementation and backend follow-up are documented in `docs/features/PERSONAL_HOME.md`.

### Payment request and direct send implementation (2026-11-06)

• The first live receive request was created on Tomson's device for `QR payment test`, P50.00. The backend generated QR and PIN `078083`. No funds were moved during scanner setup.
• Completed or cancelled receive requests are now displayed as read-only rows. They have no open action and show a lock state. Only open and awaiting-receiver-action requests can be opened.
• Added direct Send Money flow: phone recipient lookup, amount validation, recipient review, atomic transfer confirmation, animated success, balance refresh, Activity entries, and persisted sender/receiver notifications.
• Added `resolve_recipient_by_phone` and `send_money_to_user` Supabase functions. The transfer locks both wallets in UUID order, prevents self-transfer and overdraft, uses sender-scoped idempotency, writes the transaction/debit/credit/audit records, and creates notification events.
• Added `src/features/transfers/` with transfer types, service, and reusable `SendMoneyFlow`. Home Send now routes into the Pay area instead of a placeholder sheet.
• Supabase migration files were created with the CLI and applied to the Double Up project. Remote versions are `20261106052340_direct_wallet_transfers` and `20261106052620_recipient_lookup_and_transfer_lock_order`.
• TypeScript passed after the payment and direct-send changes. Native testing caught and fixed the Expo Go absence of `globalThis.crypto.getRandomValues` in the idempotency helper.
• No browser test was run. Manual two-device transfer testing remains open for the user.

### Send Money bottom sheet adjustment (2026-11-06)

• Send Money was removed from the Pay screen. Pay now contains only QR scanning and payment PIN entry.
• Home > Send now opens a custom rounded bottom sheet containing recipient input, amount input, recipient review, confirmation, errors, and success animation.
• Phone input is normalized at the service boundary: local Botswana forms such as `73156636`, `073156636`, and `26773156636` resolve to `+26773156636`; explicit international country codes remain supported.
• Amount input now accepts whole numbers, one decimal place, or two decimal places and converts them to minor units before the backend call.
• Send Money presentation is now split: a non-scrollable bottom sheet is used for entering details, then it closes before a centered popup opens for review/confirmation. Edit closes the popup and reopens the bottom sheet.
• Fixed Send Money modal layout: the review popup now has a minimum usable height, and the bottom sheet uses keyboard-aware padding with Android resize mode so focused fields remain visible while typing.
• Clarified Send Money confirmation semantics: recipient lookup only opens a confirmation popup; money is not sent until the user presses `Confirm payment`. `Edit details` returns to the input sheet without creating a transaction.

## Decisions still requiring approval

• Final source folder structure
• Whether the first backend slice includes ID upload
• Exact receive request expiry rules
• Exact withdrawal approval and handover states
• Agent approval and test float provisioning process
• Notification provider and notification scope
• Test fund issuance method

## Important implementation boundary

The existing UI is a reference for useful visual ideas and flows. It is not the final code structure.

The clean implementation should start with the correct Double Up startup experience and application structure, then build the approved flows on top of it. The current large `App.tsx` should not continue growing.

## Update format

Each progress update should record:

• Date
• Change or decision
• Files affected
• What was verified
• What remains open
• Whether user approval was received

