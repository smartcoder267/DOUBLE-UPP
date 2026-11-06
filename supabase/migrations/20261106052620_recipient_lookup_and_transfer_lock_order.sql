create or replace function public.resolve_recipient_by_phone(p_recipient_phone text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_profile public.profiles;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;
  select * into v_profile from public.profiles where phone = btrim(p_recipient_phone);
  if not found then raise exception 'recipient_not_found'; end if;
  if v_profile.id = v_user_id then raise exception 'cannot_pay_own_wallet'; end if;
  return jsonb_build_object('recipient_name', btrim(v_profile.first_name || ' ' || v_profile.last_name));
end;
$$;

revoke all on function public.resolve_recipient_by_phone(text) from public, anon;
grant execute on function public.resolve_recipient_by_phone(text) to authenticated;

create or replace function public.send_money_to_user(
  p_recipient_phone text,
  p_amount_minor bigint,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender_user_id uuid := (select auth.uid());
  v_sender_wallet public.wallets;
  v_recipient_wallet public.wallets;
  v_recipient_profile public.profiles;
  v_existing public.wallet_transactions;
  v_transaction public.wallet_transactions;
  v_sender_balance bigint;
  v_recipient_balance bigint;
  v_sender_id uuid;
  v_recipient_id uuid;
begin
  if v_sender_user_id is null then raise exception 'not_authenticated'; end if;
  if p_amount_minor is null or p_amount_minor < 1 or p_amount_minor > 100000000 then raise exception 'invalid_amount'; end if;
  if p_idempotency_key is null then raise exception 'invalid_idempotency_key'; end if;
  if btrim(coalesce(p_recipient_phone, '')) = '' then raise exception 'recipient_not_found'; end if;

  select * into v_recipient_profile from public.profiles where phone = btrim(p_recipient_phone);
  if not found then raise exception 'recipient_not_found'; end if;
  if v_recipient_profile.id = v_sender_user_id then raise exception 'cannot_pay_own_wallet'; end if;

  select id into v_sender_id from public.wallets where user_id = v_sender_user_id and status = 'active';
  select id into v_recipient_id from public.wallets where user_id = v_recipient_profile.id and status = 'active';
  if v_sender_id is null then raise exception 'active_wallet_not_found'; end if;
  if v_recipient_id is null then raise exception 'recipient_wallet_not_found'; end if;

  if v_sender_id < v_recipient_id then
    select * into v_sender_wallet from public.wallets where id = v_sender_id for update;
    select * into v_recipient_wallet from public.wallets where id = v_recipient_id for update;
  else
    select * into v_recipient_wallet from public.wallets where id = v_recipient_id for update;
    select * into v_sender_wallet from public.wallets where id = v_sender_id for update;
  end if;

  select * into v_existing from public.wallet_transactions
  where payer_wallet_id = v_sender_wallet.id and idempotency_key = p_idempotency_key;
  if found then
    select coalesce(sum(amount_minor), 0) into v_sender_balance from public.wallet_ledger_entries where wallet_id = v_existing.payer_wallet_id;
    select coalesce(sum(amount_minor), 0) into v_recipient_balance from public.wallet_ledger_entries where wallet_id = v_existing.receiver_wallet_id;
    return jsonb_build_object('transaction_id', v_existing.id, 'status', v_existing.status, 'duplicate', true,
      'recipient_name', btrim(v_recipient_profile.first_name || ' ' || v_recipient_profile.last_name),
      'sender_balance_minor', v_sender_balance, 'recipient_balance_minor', v_recipient_balance);
  end if;

  select coalesce(sum(amount_minor), 0) into v_sender_balance from public.wallet_ledger_entries where wallet_id = v_sender_wallet.id;
  if v_sender_balance < p_amount_minor then raise exception 'insufficient_funds'; end if;
  select coalesce(sum(amount_minor), 0) into v_recipient_balance from public.wallet_ledger_entries where wallet_id = v_recipient_wallet.id;

  insert into public.wallet_transactions (payment_request_id, payer_wallet_id, receiver_wallet_id, amount_minor, idempotency_key)
  values (null, v_sender_wallet.id, v_recipient_wallet.id, p_amount_minor, p_idempotency_key) returning * into v_transaction;

  insert into public.wallet_ledger_entries (wallet_id, amount_minor, entry_kind, idempotency_key, description, transaction_id)
  values
    (v_sender_wallet.id, -p_amount_minor, 'transfer_debit', 'transfer:' || v_transaction.id::text || ':debit', 'Money sent', v_transaction.id),
    (v_recipient_wallet.id, p_amount_minor, 'transfer_credit', 'transfer:' || v_transaction.id::text || ':credit', 'Money received', v_transaction.id);

  insert into public.transaction_audit_events (transaction_id, event_type, actor_user_id, details)
  values (v_transaction.id, 'direct_transfer_completed', v_sender_user_id,
    jsonb_build_object('recipient_user_id', v_recipient_profile.id, 'amount_minor', p_amount_minor));

  insert into public.user_notifications (user_id, event_type, title, body, data)
  values
    (v_sender_user_id, 'payment_sent', 'Money sent', 'Your payment was sent successfully.', jsonb_build_object('transaction_id', v_transaction.id, 'amount_minor', p_amount_minor)),
    (v_recipient_profile.id, 'payment_received', 'Money received', 'You received money in your Double Up wallet.', jsonb_build_object('transaction_id', v_transaction.id, 'amount_minor', p_amount_minor));

  return jsonb_build_object('transaction_id', v_transaction.id, 'status', v_transaction.status, 'duplicate', false,
    'recipient_name', btrim(v_recipient_profile.first_name || ' ' || v_recipient_profile.last_name),
    'sender_balance_minor', v_sender_balance - p_amount_minor, 'recipient_balance_minor', v_recipient_balance + p_amount_minor);
end;
$$;

revoke all on function public.send_money_to_user(text, bigint, uuid) from public, anon;
grant execute on function public.send_money_to_user(text, bigint, uuid) to authenticated;
