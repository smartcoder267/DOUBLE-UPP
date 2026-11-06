# Send Money

## Status

Implemented in the prototype. The UI is ready for manual two-device testing.

## User flow

1. The sender taps Home > Send. A fixed custom bottom sheet opens over the Home screen.
2. The sender enters the recipient's verified phone number and a positive BWP amount.
3. Double Up resolves only the recipient's display name. It does not expose the recipient's email, wallet ID, or private profile fields.
4. The bottom sheet closes and a separate centered custom confirmation popup opens with the found recipient, phone number, amount, and estimated post-transfer balance. Finding the recipient does not send money.
5. The sender chooses Confirm payment. Only this action calls the transfer backend and performs one atomic wallet transfer.
6. Edit details returns to the original bottom sheet with the entered values preserved without creating a transaction.
6. The sender sees the animated success state and refreshed balance.
7. Both sender and recipient receive a persisted notification row and a custom in-app notification banner when connected to Realtime.

Choosing Edit details closes the centered review popup and reopens the bottom sheet. The form and review content are intentionally non-scrollable so the modal stays compact and predictable on the connected phones. The sheet uses keyboard-aware padding and Android resize mode so focused fields remain visible above the keyboard. The review popup has an explicit minimum height so its actions do not collapse into a short strip.

## Backend API

### `resolve_recipient_by_phone`

Authentication: signed-in user.

Input:

```json
{ "p_recipient_phone": "+26773156636" }
```

Output:

```json
{ "recipient_name": "Tomson Ntebang" }
```

The function rejects missing recipients and attempts to resolve the signed-in user as their own recipient.

### `send_money_to_user`

Authentication: signed-in user. Only the `authenticated` role can execute it.

Input:

```json
{
  "p_recipient_phone": "+26773156636",
  "p_amount_minor": 5000,
  "p_idempotency_key": "client-generated-uuid"
}
```

The function locks both active wallets in UUID order, checks the sender balance, inserts one transaction, inserts one debit and one credit ledger entry, writes one audit event, and creates sender/recipient notifications. A repeated request with the same sender and idempotency key returns the original transaction instead of moving money again.

Error codes include `recipient_not_found`, `cannot_pay_own_wallet`, `recipient_wallet_not_found`, `active_wallet_not_found`, `invalid_amount`, `insufficient_funds`, and `not_authenticated`.

## Code structure

- `src/features/transfers/types.ts` contains transfer response types.
- `src/features/transfers/transferService.ts` is the only client service for recipient lookup and direct transfer RPC calls.
- `src/features/transfers/components/SendMoneyFlow.tsx` owns the form, review, error, loading, and success states.
- `src/features/transfers/components/SendMoneySheet.tsx` presents the flow as a custom rounded bottom sheet.
- `src/screens/home/PayScreen.tsx` is reserved for QR scanning and payment PIN entry.
- `src/screens/auth/AuthenticatedHomeScreen.tsx` opens the Send sheet from the Home quick action and refreshes the account after success.
- `supabase/migrations/20261106052340_direct_wallet_transfers.sql` adds the nullable request reference and direct transfer function.
- `supabase/migrations/20261106052620_recipient_lookup_and_transfer_lock_order.sql` adds recipient lookup and corrects lock ordering.

## Manual test plan

Use the two existing test users:

- Tomson: `+26773156636`
- Gorata: `+26778664288`

Test from Tomson's device:

1. Tap Send on Home to open the bottom sheet.
2. Enter Gorata's phone and a small amount such as P10.00.
3. Confirm that Gorata's name appears before the transfer.
4. Confirm and check the success animation and Tomson's new balance.
5. Check Gorata's device for the custom notification banner and increased balance.
6. Check Activity on both devices for Money sent / Money received.

Also test an invalid phone, a self phone, an amount above the balance, and retrying after a connection interruption. No browser test is required for this flow.
