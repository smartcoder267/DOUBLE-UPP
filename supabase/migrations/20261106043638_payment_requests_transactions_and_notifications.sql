-- Double Up payment requests, atomic wallet payments, audit events, and
-- persisted in-app notifications for the two-user prototype flow.

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  receiver_wallet_id uuid not null references public.wallets(id) on delete restrict,
  service text not null check (char_length(btrim(service)) between 1 and 120),
  amount_minor bigint not null check (amount_minor between 1 and 100000000),
  qr_token uuid not null default gen_random_uuid() unique,
  payment_pin text not null unique check (payment_pin ~ '^[0-9]{6}$'),
  status text not null default 'open'
    check (status in ('open', 'awaiting_receiver_action', 'closed', 'cancelled')),
  paid_count integer not null default 0 check (paid_count between 0 and 10000),
  reuse_remaining integer not null default 0 check (reuse_remaining between 0 and 100),
  first_paid_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_requests_receiver_created_idx
  on public.payment_requests(receiver_wallet_id, created_at desc);
create index payment_requests_status_created_idx
  on public.payment_requests(status, created_at desc);

alter table public.payment_requests enable row level security;
revoke all on public.payment_requests from public, anon, authenticated;
grant select on public.payment_requests to authenticated;

create policy payment_requests_select_owned
  on public.payment_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wallets
      where wallets.id = payment_requests.receiver_wallet_id
        and wallets.user_id = (select auth.uid())
    )
  );

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_request_id uuid not null references public.payment_requests(id) on delete restrict,
  payer_wallet_id uuid not null references public.wallets(id) on delete restrict,
  receiver_wallet_id uuid not null references public.wallets(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'completed' check (status in ('completed', 'reversed')),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz not null default now(),
  check (payer_wallet_id <> receiver_wallet_id),
  unique (payer_wallet_id, idempotency_key)
);

create index wallet_transactions_payer_created_idx
  on public.wallet_transactions(payer_wallet_id, created_at desc);
create index wallet_transactions_receiver_created_idx
  on public.wallet_transactions(receiver_wallet_id, created_at desc);
create index wallet_transactions_request_created_idx
  on public.wallet_transactions(payment_request_id, created_at desc);

alter table public.wallet_transactions enable row level security;
revoke all on public.wallet_transactions from public, anon, authenticated;
grant select on public.wallet_transactions to authenticated;

create policy wallet_transactions_select_participant
  on public.wallet_transactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wallets
      where wallets.user_id = (select auth.uid())
        and wallets.id in (wallet_transactions.payer_wallet_id, wallet_transactions.receiver_wallet_id)
    )
  );

alter table public.wallet_ledger_entries
  add column transaction_id uuid references public.wallet_transactions(id) on delete restrict;

create unique index wallet_ledger_entries_transaction_side_idx
  on public.wallet_ledger_entries(transaction_id, wallet_id, entry_kind)
  where transaction_id is not null;

create table public.transaction_audit_events (
  id bigint generated always as identity primary key,
  transaction_id uuid not null references public.wallet_transactions(id) on delete restrict,
  event_type text not null check (char_length(event_type) between 1 and 80),
  actor_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index transaction_audit_events_transaction_created_idx
  on public.transaction_audit_events(transaction_id, created_at desc);

alter table public.transaction_audit_events enable row level security;
revoke all on public.transaction_audit_events from public, anon, authenticated;
grant select on public.transaction_audit_events to authenticated;

create policy transaction_audit_events_select_participant
  on public.transaction_audit_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wallet_transactions
      join public.wallets
        on wallets.id in (
          wallet_transactions.payer_wallet_id,
          wallet_transactions.receiver_wallet_id
        )
      where wallet_transactions.id = transaction_audit_events.transaction_id
        and wallets.user_id = (select auth.uid())
    )
  );

create table public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (char_length(event_type) between 1 and 80),
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 240),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index user_notifications_user_created_idx
  on public.user_notifications(user_id, created_at desc);
create index user_notifications_user_unread_idx
  on public.user_notifications(user_id, created_at desc)
  where read_at is null;

alter table public.user_notifications enable row level security;
revoke all on public.user_notifications from public, anon, authenticated;
grant select on public.user_notifications to authenticated;
grant update (read_at) on public.user_notifications to authenticated;

create policy user_notifications_select_own
  on public.user_notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy user_notifications_update_own
  on public.user_notifications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create table private.payment_pin_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now(),
  matched boolean not null
);

create index payment_pin_attempts_user_attempted_idx
  on private.payment_pin_attempts(user_id, attempted_at desc);

alter table private.payment_pin_attempts enable row level security;
revoke all on private.payment_pin_attempts from public, anon, authenticated;

create function public.create_payment_request(
  p_service text,
  p_amount_minor bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_wallet public.wallets%rowtype;
  v_request public.payment_requests%rowtype;
  v_pin text;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if p_service is null or char_length(btrim(p_service)) not between 1 and 120 then
    raise exception 'invalid_service';
  end if;
  if p_amount_minor is null or p_amount_minor not between 1 and 100000000 then
    raise exception 'invalid_amount';
  end if;

  select * into v_wallet
  from public.wallets
  where user_id = v_user_id and status = 'active';
  if not found then
    raise exception 'active_wallet_not_found';
  end if;

  loop
    v_attempt := v_attempt + 1;
    if v_attempt > 20 then
      raise exception 'payment_pin_generation_failed';
    end if;
    v_pin := lpad(floor(random() * 1000000)::bigint::text, 6, '0');
    begin
      insert into public.payment_requests (
        receiver_wallet_id,
        service,
        amount_minor,
        payment_pin
      )
      values (v_wallet.id, btrim(p_service), p_amount_minor, v_pin)
      returning * into v_request;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  return jsonb_build_object(
    'id', v_request.id,
    'service', v_request.service,
    'amount_minor', v_request.amount_minor,
    'payment_pin', v_request.payment_pin,
    'qr_token', v_request.qr_token,
    'qr_payload', 'doubleup://pay-request/' || v_request.qr_token::text,
    'status', v_request.status,
    'created_at', v_request.created_at
  );
end;
$$;

revoke all on function public.create_payment_request(text, bigint) from public, anon;
grant execute on function public.create_payment_request(text, bigint) to authenticated;

create function private.payment_request_preview(
  p_request_id uuid,
  p_payer_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_preview jsonb;
begin
  select jsonb_build_object(
    'id', payment_requests.id,
    'receiver_name', profiles.first_name || ' ' || profiles.last_name,
    'service', payment_requests.service,
    'amount_minor', payment_requests.amount_minor,
    'status', payment_requests.status,
    'created_at', payment_requests.created_at
  ) into v_preview
  from public.payment_requests
  join public.wallets on wallets.id = payment_requests.receiver_wallet_id
  join public.profiles on profiles.id = wallets.user_id
  where payment_requests.id = p_request_id
    and payment_requests.status = 'open'
    and wallets.status = 'active'
    and wallets.user_id <> p_payer_user_id;

  if v_preview is null then
    raise exception 'payment_request_unavailable';
  end if;
  return v_preview;
end;
$$;

revoke all on function private.payment_request_preview(uuid, uuid)
  from public, anon, authenticated;

create function public.resolve_payment_request_qr(p_qr_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  select id into v_request_id
  from public.payment_requests
  where qr_token = p_qr_token;
  if v_request_id is null then
    raise exception 'payment_request_unavailable';
  end if;
  return private.payment_request_preview(v_request_id, v_user_id);
end;
$$;

revoke all on function public.resolve_payment_request_qr(uuid) from public, anon;
grant execute on function public.resolve_payment_request_qr(uuid) to authenticated;

create function public.resolve_payment_request_pin(p_payment_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_request_id uuid;
  v_recent_attempts integer;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if p_payment_pin is null or p_payment_pin !~ '^[0-9]{6}$' then
    raise exception 'invalid_payment_pin';
  end if;

  select count(*)::integer into v_recent_attempts
  from private.payment_pin_attempts
  where user_id = v_user_id
    and attempted_at > now() - interval '5 minutes';
  if v_recent_attempts >= 10 then
    raise exception 'payment_pin_rate_limited';
  end if;

  select id into v_request_id
  from public.payment_requests
  where payment_pin = p_payment_pin and status = 'open';

  insert into private.payment_pin_attempts(user_id, matched)
  values (v_user_id, v_request_id is not null);

  if v_request_id is null then
    return jsonb_build_object('error', 'payment_request_unavailable');
  end if;
  begin
    return private.payment_request_preview(v_request_id, v_user_id);
  exception when raise_exception then
    return jsonb_build_object('error', 'payment_request_unavailable');
  end;
end;
$$;

revoke all on function public.resolve_payment_request_pin(text) from public, anon;
grant execute on function public.resolve_payment_request_pin(text) to authenticated;

create function public.confirm_payment_request(
  p_request_id uuid,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_payer_wallet public.wallets%rowtype;
  v_receiver_wallet public.wallets%rowtype;
  v_request public.payment_requests%rowtype;
  v_transaction public.wallet_transactions%rowtype;
  v_existing public.wallet_transactions%rowtype;
  v_payer_balance bigint;
  v_receiver_balance bigint;
  v_payer_name text;
  v_receiver_name text;
  v_request_status text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if p_idempotency_key is null then
    raise exception 'idempotency_key_required';
  end if;

  select * into v_payer_wallet
  from public.wallets
  where user_id = v_user_id and status = 'active';
  if not found then
    raise exception 'active_wallet_not_found';
  end if;

  select * into v_existing
  from public.wallet_transactions
  where payer_wallet_id = v_payer_wallet.id
    and idempotency_key = p_idempotency_key;
  if found then
    select coalesce(sum(amount_minor), 0)::bigint into v_payer_balance
    from public.wallet_ledger_entries where wallet_id = v_existing.payer_wallet_id;
    select coalesce(sum(amount_minor), 0)::bigint into v_receiver_balance
    from public.wallet_ledger_entries where wallet_id = v_existing.receiver_wallet_id;
    return jsonb_build_object(
      'transaction_id', v_existing.id,
      'status', v_existing.status,
      'payer_balance_minor', v_payer_balance,
      'receiver_balance_minor', v_receiver_balance,
      'duplicate', true
    );
  end if;

  select * into v_request
  from public.payment_requests
  where id = p_request_id
  for update;

  select * into v_existing
  from public.wallet_transactions
  where payer_wallet_id = v_payer_wallet.id
    and idempotency_key = p_idempotency_key;
  if found then
    select coalesce(sum(amount_minor), 0)::bigint into v_payer_balance
    from public.wallet_ledger_entries where wallet_id = v_existing.payer_wallet_id;
    select coalesce(sum(amount_minor), 0)::bigint into v_receiver_balance
    from public.wallet_ledger_entries where wallet_id = v_existing.receiver_wallet_id;
    return jsonb_build_object(
      'transaction_id', v_existing.id,
      'status', v_existing.status,
      'payer_balance_minor', v_payer_balance,
      'receiver_balance_minor', v_receiver_balance,
      'duplicate', true
    );
  end if;

  if v_request.id is null or v_request.status <> 'open' then
    raise exception 'payment_request_unavailable';
  end if;

  select * into v_receiver_wallet
  from public.wallets
  where id = v_request.receiver_wallet_id;
  if not found or v_receiver_wallet.status <> 'active' then
    raise exception 'receiver_wallet_unavailable';
  end if;
  if v_receiver_wallet.id = v_payer_wallet.id then
    raise exception 'cannot_pay_own_request';
  end if;

  perform id
  from public.wallets
  where id in (v_payer_wallet.id, v_receiver_wallet.id)
  order by id
  for update;

  select coalesce(sum(amount_minor), 0)::bigint into v_payer_balance
  from public.wallet_ledger_entries
  where wallet_id = v_payer_wallet.id;
  if v_payer_balance < v_request.amount_minor then
    raise exception 'insufficient_funds';
  end if;

  insert into public.wallet_transactions (
    payment_request_id,
    payer_wallet_id,
    receiver_wallet_id,
    amount_minor,
    idempotency_key
  ) values (
    v_request.id,
    v_payer_wallet.id,
    v_receiver_wallet.id,
    v_request.amount_minor,
    p_idempotency_key
  ) returning * into v_transaction;

  insert into public.wallet_ledger_entries (
    wallet_id,
    amount_minor,
    entry_kind,
    idempotency_key,
    description,
    transaction_id
  ) values
    (
      v_payer_wallet.id,
      -v_request.amount_minor,
      'transfer_debit',
      'transaction:' || v_transaction.id::text || ':debit',
      v_request.service,
      v_transaction.id
    ),
    (
      v_receiver_wallet.id,
      v_request.amount_minor,
      'transfer_credit',
      'transaction:' || v_transaction.id::text || ':credit',
      v_request.service,
      v_transaction.id
    );

  if v_request.paid_count = 0 then
    v_request_status := 'awaiting_receiver_action';
    update public.payment_requests
    set paid_count = 1,
        status = v_request_status,
        first_paid_at = now(),
        updated_at = now()
    where id = v_request.id;
  elsif v_request.reuse_remaining <= 1 then
    v_request_status := 'closed';
    update public.payment_requests
    set paid_count = paid_count + 1,
        reuse_remaining = 0,
        status = v_request_status,
        closed_at = now(),
        updated_at = now()
    where id = v_request.id;
  else
    v_request_status := 'open';
    update public.payment_requests
    set paid_count = paid_count + 1,
        reuse_remaining = reuse_remaining - 1,
        updated_at = now()
    where id = v_request.id;
  end if;

  select first_name || ' ' || last_name into v_payer_name
  from public.profiles where id = v_user_id;
  select profiles.first_name || ' ' || profiles.last_name into v_receiver_name
  from public.profiles
  where profiles.id = v_receiver_wallet.user_id;

  insert into public.transaction_audit_events (
    transaction_id,
    event_type,
    actor_user_id,
    details
  ) values (
    v_transaction.id,
    'payment_completed',
    v_user_id,
    jsonb_build_object(
      'payment_request_id', v_request.id,
      'amount_minor', v_request.amount_minor,
      'request_status', v_request_status
    )
  );

  insert into public.user_notifications (
    user_id,
    event_type,
    title,
    body,
    data
  ) values
    (
      v_user_id,
      'payment_sent',
      'Payment sent',
      'P ' || to_char(v_request.amount_minor::numeric / 100, 'FM999999990.00') || ' paid to ' || v_receiver_name,
      jsonb_build_object('transaction_id', v_transaction.id, 'payment_request_id', v_request.id)
    ),
    (
      v_receiver_wallet.user_id,
      'payment_received',
      'Payment received',
      'P ' || to_char(v_request.amount_minor::numeric / 100, 'FM999999990.00') || ' received from ' || v_payer_name,
      jsonb_build_object('transaction_id', v_transaction.id, 'payment_request_id', v_request.id)
    );

  select coalesce(sum(amount_minor), 0)::bigint into v_payer_balance
  from public.wallet_ledger_entries where wallet_id = v_payer_wallet.id;
  select coalesce(sum(amount_minor), 0)::bigint into v_receiver_balance
  from public.wallet_ledger_entries where wallet_id = v_receiver_wallet.id;

  return jsonb_build_object(
    'transaction_id', v_transaction.id,
    'status', v_transaction.status,
    'request_status', v_request_status,
    'payer_balance_minor', v_payer_balance,
    'receiver_balance_minor', v_receiver_balance,
    'duplicate', false
  );
end;
$$;

revoke all on function public.confirm_payment_request(uuid, uuid) from public, anon;
grant execute on function public.confirm_payment_request(uuid, uuid) to authenticated;

create function public.set_payment_request_reuse(
  p_request_id uuid,
  p_additional_count integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_request public.payment_requests%rowtype;
  v_transaction_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;
  if p_additional_count is null or p_additional_count not between 0 and 100 then
    raise exception 'invalid_reuse_count';
  end if;

  select payment_requests.* into v_request
  from public.payment_requests
  join public.wallets on wallets.id = payment_requests.receiver_wallet_id
  where payment_requests.id = p_request_id
    and wallets.user_id = v_user_id
  for update of payment_requests;

  if not found or v_request.status <> 'awaiting_receiver_action' then
    raise exception 'payment_request_not_awaiting_action';
  end if;

  if p_additional_count = 0 then
    update public.payment_requests
    set status = 'closed', reuse_remaining = 0, closed_at = now(), updated_at = now()
    where id = v_request.id;
  else
    update public.payment_requests
    set status = 'open', reuse_remaining = p_additional_count, updated_at = now()
    where id = v_request.id;
  end if;

  select id into v_transaction_id
  from public.wallet_transactions
  where payment_request_id = v_request.id
  order by created_at desc
  limit 1;

  if v_transaction_id is not null then
    insert into public.transaction_audit_events (
      transaction_id,
      event_type,
      actor_user_id,
      details
    ) values (
      v_transaction_id,
      case when p_additional_count = 0 then 'request_completed' else 'request_reused' end,
      v_user_id,
      jsonb_build_object('additional_count', p_additional_count)
    );
  end if;

  return jsonb_build_object(
    'id', v_request.id,
    'status', case when p_additional_count = 0 then 'closed' else 'open' end,
    'reuse_remaining', p_additional_count
  );
end;
$$;

revoke all on function public.set_payment_request_reuse(uuid, integer) from public, anon;
grant execute on function public.set_payment_request_reuse(uuid, integer) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_notifications'
  ) then
    alter publication supabase_realtime add table public.user_notifications;
  end if;
end;
$$;
