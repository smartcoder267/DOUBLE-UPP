# Payment Request Flow

**Status**: In Progress

## Summary

Double Up will move test funds between two real personal wallets through a receive request. The receiver creates one fixed amount request that has both a QR code and a six digit PIN. The payer reviews the receiver and amount before one atomic backend action moves funds, writes the ledger, records the transaction, and creates in app notification events.

## Context

The two test users have separate authenticated sessions and real P250.00 ledger balances. The next requirement is to prove that one user can pay another without hardcoded money, duplicate transfers, or client controlled balances.

This is a prototype test funds flow. It is not connected to real payment rails and is not a claim of PCI compliance.

## Requirements

1. **AC-1** Tomson can create a receive request with a required service and positive BWP amount.
2. **AC-2** The backend generates one request bound QR payload and one six digit payment PIN.
3. **AC-3** Tomson can reopen an active request and show its QR code and PIN without blocking creation of another request.
4. **AC-4** Gorata can scan the QR code with a custom Expo Camera interface or enter the PIN in a separate flow.
5. **AC-5** Gorata sees Tomson's name, service, amount, and her current balance before confirming.
6. **AC-6** Confirmation atomically records one transaction, one debit, one credit, and the new balances without overdrawing Gorata.
7. **AC-7** A repeated confirmation with the same idempotency key cannot move money twice.
8. **AC-8** Both users receive custom in app event notifications and success feedback after completion.
9. **AC-9** Tomson can complete the request after its first payment or reuse it for a chosen number of additional payments. A reused request closes automatically when the count reaches zero.
10. **AC-10** Invalid QR data, invalid PIN attempts, own wallet payment, insufficient funds, closed requests, lost connectivity, and duplicate confirmation have clear designed states.

## Decision

Use Supabase Postgres functions for every money mutation, with row locks, idempotency, an append only ledger, and audit events. Use Expo Camera for QR scanning, a custom scanner overlay, and a generated QR image for display. Use Supabase Realtime notification rows as the prototype event channel. FCM can later deliver the same persisted events without changing transaction logic.

**Implementation skills**: `supabase` · `supabase-postgres-best-practices` · `develop`

## Options considered

### Client controlled balance updates

This is quick to build but unsafe. Two devices can race, retries can duplicate money, and a modified client can write balances.

### Edge Function transaction service

This gives a server boundary but still needs one database transaction and row locking. It adds another deployment unit without improving this prototype flow.

### Postgres transaction functions

This is the selected approach. It keeps validation, locking, transaction records, ledger writes, audit events, and notifications inside one database transaction.

## Rationale

Money movement needs strong consistency. The client may request a payment but it must never calculate or write the result. A database function can lock both wallets in a stable order, check the payer balance, write both ledger sides, and either commit everything or commit nothing.

The notification table is the source of truth for user events. Realtime provides the current prototype popup. FCM later becomes another delivery path for the same event.

## Feature design

### Data model sketch

| Entity | Required fields | Relationships and constraints |
| --- | --- | --- |
| `payment_requests` | `id`, `receiver_wallet_id`, `service`, `amount_minor`, `qr_token`, `payment_pin`, `status`, `paid_count`, `reuse_remaining`, timestamps | Receiver owns request. QR token is unique. PIN is unique among payable requests. Amount is positive BWP minor units. |
| `wallet_transactions` | `id`, `payment_request_id`, `payer_wallet_id`, `receiver_wallet_id`, `amount_minor`, `status`, `idempotency_key`, `created_at`, `completed_at` | One payer scoped idempotency key. Payer and receiver must differ. Amount must match request. |
| `wallet_ledger_entries` | Existing fields plus nullable `transaction_id` | Exactly one debit and one credit per completed payment transaction. |
| `transaction_audit_events` | `id`, `transaction_id`, `event_type`, `actor_user_id`, `details`, `created_at` | Append only audit history for money state changes. |
| `user_notifications` | `id`, `user_id`, `event_type`, `title`, `body`, `data`, `read_at`, `created_at` | User can read and mark only their own notification as read. Clients cannot create financial notifications. |
| `private.payment_pin_attempts` | `id`, `user_id`, `attempted_at`, `matched` | Supports authenticated PIN lookup rate limits and audit. Not exposed through the Data API. |

### State transitions

`payment_requests`: `open` to `awaiting_receiver_action` after the first payment. The receiver chooses `closed` or returns it to `open` with `reuse_remaining` greater than zero. Each reused payment decrements the count. The final reused payment moves the request to `closed`. A receiver may also move an open request to `cancelled`.

`wallet_transactions`: created and completed inside one database transaction. Failed validation does not create a completed transaction or ledger entry.

### API surface

| Function | Key inputs | Key outputs | Auth | Key errors |
| --- | --- | --- | --- | --- |
| `create_payment_request` | service, amount minor | request id, QR token, PIN, status | Signed in receiver | invalid amount, inactive wallet |
| `list_my_payment_requests` | cursor, limit | owned requests, next cursor | Signed in receiver | invalid cursor |
| `resolve_payment_request_qr` | QR token | receiver name, service, amount, request id | Signed in payer | invalid payload, closed request, own request |
| `resolve_payment_request_pin` | six digit PIN | receiver name, service, amount, request id | Signed in payer | invalid PIN, rate limited, closed request, own request |
| `confirm_payment_request` | request id, idempotency key | transaction id, both resulting balances, status | Signed in payer | insufficient funds, duplicate, invalid state |
| `set_payment_request_reuse` | request id, additional count | request status, remaining count | Request receiver | not awaiting action, invalid count |
| `list_my_notifications` | cursor, limit | notifications, next cursor | Signed in user | invalid cursor |
| `mark_notification_read` | notification id | read timestamp | Notification owner | not found, forbidden |

### Value sourcing

| Action | Value displayed or produced | Source |
| --- | --- | --- |
| Create request | Service and amount | Receiver input validated by backend |
| Display QR | QR payload | Versioned scheme plus server generated `qr_token` |
| Display PIN | Six digit PIN | Server generated `payment_pin`, visible only to receiver and resolver function |
| Payment review | Receiver name | Receiver profile joined by backend function |
| Payment review | Amount and service | Locked payment request row |
| Confirm payment | Payer identity | `auth.uid()` mapped to payer wallet |
| Confirm payment | Resulting balances | Sum of committed ledger entries |
| Notify users | Titles, bodies, and event data | Completed transaction and payment request rows |

### Key invariants

1. Clients never insert ledger, transaction, audit, or financial notification rows directly.
2. Every completed transaction has equal debit and credit amounts.
3. A payer balance cannot become negative.
4. The payer and receiver wallets must differ and both must be active BWP wallets.
5. Request amount and receiver cannot change after creation.
6. One payer scoped idempotency key can produce at most one transaction.
7. Every financial mutation is audited.
8. Request state transitions happen only through backend functions.

### Security model

Users can read their own wallet, ledger, transactions, requests, and notifications. A payer can resolve only the limited public payment preview returned by a backend function. The function does not expose email, phone, wallet identifiers, or private profile fields. PIN lookup is limited and logged. Security definer functions use an empty search path, explicit authentication checks, revoked public execution, and grants only to authenticated users.

### Configuration required

No new secret is required. Expo Camera requires the camera permission string and QR scanning support in the Expo app configuration.

### Critical test scenarios

1. Happy path: Gorata scans Tomson's QR, confirms P50.00, and both balances and notifications update once, verifies **AC-1** through **AC-9**.
2. Failure case: repeating the same confirmation returns the existing transaction and does not add another ledger pair, verifies **AC-7**.
3. Failure case: a payment above Gorata's available balance fails without partial rows, verifies **AC-6** and **AC-10**.
4. Authorization: a third user cannot read Tomson's full request row or either user's private wallet data, verifies **AC-10**.

## Build plan

1. Add request, transaction, audit, notification, and PIN attempt schema with RLS and indexes, satisfies **AC-1**, **AC-2**, **AC-6**, **AC-8**, **AC-9**.
2. Add create, resolve, confirm, and reuse functions with locking and idempotency, satisfies **AC-1** through **AC-10**.
3. Build Tomson's create request and request detail screens with QR and PIN, satisfies **AC-1**, **AC-2**, **AC-3**.
4. Build Gorata's Expo Camera scanner, PIN entry, and payment review, satisfies **AC-4**, **AC-5**, **AC-10**.
5. Build success animation, realtime event popup, request decision, and balance refresh, satisfies **AC-8**, **AC-9**.
6. Verify one QR payment across both physical devices, then verify a separate PIN payment, satisfies **AC-1** through **AC-10**.
7. Document the schema, functions, screens, verification evidence, and known prototype limits, satisfies **AC-10**.

## Consequences

### Positive

* Balances remain derived from an auditable ledger.
* Retries cannot duplicate money.
* The same persisted event can drive an in app popup now and FCM later.
* QR and PIN share one request and one payment backend.

### Negative and tradeoffs

* Six digit PINs require lookup limits because the code space is small.
* Realtime is useful for the prototype but is not a replacement for background push delivery.
* The Postgres functions are security sensitive and require direct database tests.

### Neutral

* Requests do not expire by time in this prototype. They close through receiver action, cancellation, or reuse completion.

## Follow up

* [ ] Approve a production request expiry rule before public testing.
* [ ] Replace prototype PIN controls with the final abuse protection policy before production.
* [ ] Connect FCM as a delivery consumer of persisted notification events.
