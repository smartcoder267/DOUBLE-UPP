-- Prototype wallet ledger and auditable P250 opening test funds.
-- Remove automatic opening funds before a real-money production launch.

create table public.wallet_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete restrict,
  amount_minor bigint not null check (
    amount_minor <> 0
    and amount_minor between -100000000000 and 100000000000
  ),
  entry_kind text not null check (
    entry_kind in (
      'prototype_funding',
      'transfer_debit',
      'transfer_credit',
      'deposit',
      'withdrawal',
      'adjustment'
    )
  ),
  idempotency_key text not null unique check (char_length(idempotency_key) between 1 and 160),
  description text not null check (char_length(description) between 1 and 160),
  created_at timestamptz not null default now()
);

create index wallet_ledger_entries_wallet_created_idx
  on public.wallet_ledger_entries(wallet_id, created_at desc);

alter table public.wallet_ledger_entries enable row level security;
revoke all on public.wallet_ledger_entries from public, anon, authenticated;
grant select on public.wallet_ledger_entries to authenticated;

create policy wallet_ledger_entries_select_own
  on public.wallet_ledger_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.wallets
      where wallets.id = wallet_ledger_entries.wallet_id
        and wallets.user_id = (select auth.uid())
    )
  );

create view public.wallet_balances
with (security_invoker = true)
as
select
  wallets.id as wallet_id,
  wallets.user_id,
  wallets.currency,
  coalesce(sum(wallet_ledger_entries.amount_minor), 0)::bigint as available_balance_minor,
  max(wallet_ledger_entries.created_at) as last_entry_at
from public.wallets
left join public.wallet_ledger_entries
  on wallet_ledger_entries.wallet_id = wallets.id
group by wallets.id, wallets.user_id, wallets.currency;

revoke all on public.wallet_balances from public, anon, authenticated;
grant select on public.wallet_balances to authenticated;

create function private.issue_prototype_opening_funds()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.wallet_ledger_entries (
    wallet_id,
    amount_minor,
    entry_kind,
    idempotency_key,
    description
  )
  values (
    new.id,
    25000,
    'prototype_funding',
    'prototype-opening-funds:' || new.id::text,
    'Prototype opening funds'
  )
  on conflict (idempotency_key) do nothing;

  return new;
end;
$$;

revoke all on function private.issue_prototype_opening_funds()
  from public, anon, authenticated;

create trigger on_wallet_created_issue_prototype_opening_funds
  after insert on public.wallets
  for each row execute function private.issue_prototype_opening_funds();

-- Backfill one idempotent P250 test-fund entry for wallets created before this migration.
insert into public.wallet_ledger_entries (
  wallet_id,
  amount_minor,
  entry_kind,
  idempotency_key,
  description
)
select
  wallets.id,
  25000,
  'prototype_funding',
  'prototype-opening-funds:' || wallets.id::text,
  'Prototype opening funds'
from public.wallets
on conflict (idempotency_key) do nothing;
