# Double Up Backend and API Plan

## Backend readiness snapshot (2026-11-06)

Registration now uses the four-step UI: name and phone, prototype phone code, email and password, then email confirmation. Email/password is the real primary Supabase identity. Phone verification is explicitly simulated in this prototype and does not prove SIM ownership.

The dedicated Supabase project **Double Up** is in the **Autobots Dev** organization (`eu-west-2`). Project ref: `erhsfuvwawdsmgwnulkj`; API URL: `https://erhsfuvwawdsmgwnulkj.supabase.co`. It reports `ACTIVE_HEALTHY`. The earlier `autobotsdev` project was left untouched. A publishable client key is in ignored local setup and is intentionally not recorded here.

### Implemented auth foundation

1. Email/password creates the Auth user; the UI requires email confirmation before showing account-ready.
2. Name, phone, and email are persisted locally as a pending draft; passwords and codes are not persisted.
3. A pre-auth RPC creates a random six-digit phone simulation code, stores its hash with expiry/attempt limits, and returns it for prototype autofill. A second RPC checks it. The Auth trigger claims a verified challenge once and creates the user profile and one BWP wallet.
4. Profile and wallet RLS allow users to read only their own rows. Clients have no insert/update grants and cannot change phone verification status or wallet state.
5. Login, session restoration, logout, password-reset email requests, profile/wallet loading, and email resend/check behavior are connected to Supabase Auth.
6. No balances, ledger, FCM delivery, phone ownership proof, identity documents, agent access, or financial operations are implemented in this slice.

### Provider constraints to resolve

• Email/password is the primary identity. The verified simulated phone challenge is bound by the signup trigger to that same user.
• The prototype challenge endpoints are intentionally executable before sign-in and return the code for autofill; Supabase security advisors warn about anon-executable `SECURITY DEFINER` functions. This is an explicitly temporary prototype behavior; remove code return and move push delivery into a protected FCM implementation before broader/public use.
• Email is confirmed through Supabase, but the deep-link return/redirect allowlist and app callback are not configured. The user can return to the app and explicitly check by signing in.
• FCM delivery is not configured. The current code autofills in-app and must not be described as SMS or push delivered.

Four versioned migrations are deployed: `auth_profile_wallet_and_phone_challenges`, `harden_phone_simulation_challenges`, `protect_challenge_access_and_claim_verified_phone`, and `limit_phone_challenge_rpcs_to_signup`. The RPCs are only executable by the pre-signup `anon` role; the security advisor warning remains intentional for the current pre-auth onboarding flow. TypeScript and direct RPC create/verify/null-rejection/attempt-limit/resend-cooldown/one-time-use checks passed. Email confirmation was not completed with a real inbox/account on a device; no auth users have been created for verification.

## Backend purpose

The backend provides persistent identity, wallet accounts, test fund ledger operations, payment request state, agent permissions, notifications, and audit records.

The current frontend demo data is not a backend and must not be treated as one.

## Planned backend concepts

The exact schema requires approval before implementation. The expected concepts are:

• Authenticated users
• User profiles
• Normalized phone associations
• Personal wallets
• Agent accounts and agent capabilities
• Ledger accounts
• Ledger entries
• Transactions
• Receive payment requests
• Withdrawal requests
• Deposit challenges
• Notifications
• Identity documents
• Admin review records
• Audit events

## API principles

All API operations should:

• Require an authenticated session where appropriate
• Validate input on the server
• Validate ownership and permissions
• Return typed success or error results
• Use idempotency for operations that move value
• Avoid exposing private data unnecessarily
• Record important audit events
• Return the committed transaction state rather than trusting the client

## Planned API boundaries

The names are provisional until the backend specification is approved.

### Authentication

```text
register
login
restoreSession
logout
requestPasswordReset
completePasswordReset
```

### Profile and wallet

```text
getMyProfile
updateMyProfile
getMyPersonalWallet
getMyWalletActivity
```

### Transfers

```text
resolveRecipientByPhone
createTransfer
getTransferReceipt
```

### Receive requests

```text
createReceiveRequest
getMyReceiveRequests
getReceiveRequestByCode
payReceiveRequest
completeReceiveRequest
reuseReceiveRequest
```

### Agent operations

```text
applyForAgentAccess
createAgentPin
verifyAgentPin
getAgentAccount
createDepositRequest
verifyDepositOtp
createWithdrawalRequest
resolveWithdrawalRequest
confirmWithdrawalHandover
```

## Transfer behavior

A transfer should be one atomic backend operation.

The backend should:

1. Confirm the sender owns the source wallet.
2. Confirm the recipient is valid.
3. Confirm the sender has sufficient available balance.
4. Confirm the request has not already been processed.
5. Create the debit ledger entry.
6. Create the credit ledger entry.
7. Create the transaction record.
8. Create notification events.
9. Return the committed receipt.

If any required step fails, the transfer must not partially post.

## Receive request behavior

A receive request contains:

• Owner
• Service or description
• Amount
• QR token
• Six digit payment PIN reference
• Status
• Initial payment state
• Additional reuse limit
• Additional successful payment count
• Expiry information

The QR token and payment PIN must not expose sensitive account data. Payment requests must be resolved and validated by the backend.

## Withdrawal behavior

A withdrawal request should contain:

• Customer
• Amount
• One time code or QR token
• Agent when resolved
• Status
• Customer approval state
• Handover state
• Expiry information
• Audit history

The request must not be completed simply because an agent entered a code. The backend must require the approved state and handover completion state defined by the approved product design.

## Security requirements

• Never store passwords or PINs in plain text.
• Store agent PIN verification securely and separately from the normal account PIN.
• Enforce access rules in the backend, not only in the app.
• Keep identity documents private.
• Use row level security or equivalent authorization rules.
• Use short lived challenges for OTP and payment codes.
• Prevent reuse of completed or expired codes.
• Use server generated transaction references.
• Use audit logs for administrative changes.
• Do not put service role keys in the mobile app.
• Do not treat push notification delivery as proof that a transaction succeeded.

## API documentation standard

Every implemented endpoint or backend function should document:

• Name
• Purpose
• Authentication requirement
• Authorized roles
• Request shape
• Response shape
• Validation rules
• Error codes
• Idempotency behavior
• Audit behavior
• Example success result
• Example failure result

