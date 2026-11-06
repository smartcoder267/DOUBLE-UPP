-- Double Up auth, profile, wallet, and prototype phone verification foundation
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.phone_simulation_challenges (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  verified_at timestamptz,
  claimed_by uuid references auth.users(id) on delete set null
);
create index phone_simulation_challenges_phone_created_idx
  on private.phone_simulation_challenges(phone, created_at desc);
alter table private.phone_simulation_challenges enable row level security;
revoke all on private.phone_simulation_challenges from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  phone text unique check (phone is null or phone ~ '^\+267[237][0-9]{7}$'),
  phone_verification_mode text not null default 'none'
    check (phone_verification_mode in ('none', 'prototype_fcm', 'sms')),
  phone_verification_status text not null default 'pending'
    check (phone_verification_status in ('pending', 'simulated_verified', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  currency text not null default 'BWP' check (currency = 'BWP'),
  status text not null default 'active' check (status in ('active', 'frozen', 'closed')),
  created_at timestamptz not null default now()
);
alter table public.wallets enable row level security;
revoke all on public.wallets from anon, authenticated;
grant select on public.wallets to authenticated;
create policy wallets_select_own on public.wallets
  for select to authenticated using ((select auth.uid()) = user_id);

create function public.create_phone_simulation_challenge(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_code text;
  v_id uuid;
  v_expires_at timestamptz;
begin
  if v_phone ~ '^[237][0-9]{7}$' then
    v_phone := '+267' || v_phone;
  end if;
  if v_phone !~ '^\+267[237][0-9]{7}$' then
    raise exception 'invalid_phone';
  end if;
  if exists (
    select 1 from private.phone_simulation_challenges c
    where c.phone = v_phone and c.created_at > now() - interval '30 seconds'
  ) then
    raise exception 'otp_resend_too_soon';
  end if;

  update private.phone_simulation_challenges
     set expires_at = now()
   where phone = v_phone and verified_at is null and expires_at > now();

  v_code := lpad(floor(random() * 1000000)::bigint::text, 6, '0');
  v_id := gen_random_uuid();
  v_expires_at := now() + interval '5 minutes';
  insert into private.phone_simulation_challenges(id, phone, code_hash, expires_at)
  values (v_id, v_phone, encode(extensions.digest(v_code, 'sha256'), 'hex'), v_expires_at);

  -- Prototype-only delivery: return the code for app autofill. Replace with FCM delivery
  -- and omit the code from this response before treating phone verification as a proof channel.
  return jsonb_build_object('challenge_id', v_id, 'code', v_code, 'expires_at', v_expires_at);
end;
$$;
revoke all on function public.create_phone_simulation_challenge(text) from public;
grant execute on function public.create_phone_simulation_challenge(text) to anon;

create function public.verify_phone_simulation_challenge(p_challenge_id uuid, p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge private.phone_simulation_challenges%rowtype;
begin
  select * into v_challenge
  from private.phone_simulation_challenges
  where id = p_challenge_id
  for update;

  if not found or v_challenge.verified_at is not null
     or v_challenge.expires_at <= now() or v_challenge.attempts >= 5 then
    return false;
  end if;

  if p_code !~ '^[0-9]{6}$'
     or encode(extensions.digest(p_code, 'sha256'), 'hex') <> v_challenge.code_hash then
    update private.phone_simulation_challenges
       set attempts = least(attempts + 1, 5)
     where id = p_challenge_id;
    return false;
  end if;

  update private.phone_simulation_challenges
     set verified_at = now()
   where id = p_challenge_id;
  return true;
end;
$$;
revoke all on function public.verify_phone_simulation_challenge(uuid, text) from public;
grant execute on function public.verify_phone_simulation_challenge(uuid, text) to anon;

create function private.handle_new_double_up_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_first text := nullif(btrim(new.raw_user_meta_data ->> 'first_name'), '');
  v_last text := nullif(btrim(new.raw_user_meta_data ->> 'last_name'), '');
  v_challenge_id uuid;
  v_phone text;
  v_phone_verified boolean := false;
begin
  if coalesce(new.raw_user_meta_data ->> 'phone_challenge_id', '') ~*
     '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_challenge_id := (new.raw_user_meta_data ->> 'phone_challenge_id')::uuid;
    select c.phone into v_phone
      from private.phone_simulation_challenges c
     where c.id = v_challenge_id and c.verified_at is not null
       and c.expires_at > now() and c.claimed_by is null
     for update;
    v_phone_verified := found;
    if v_phone_verified then
      update private.phone_simulation_challenges
         set claimed_by = new.id
       where id = v_challenge_id;
    else
      v_phone := null;
    end if;
  end if;

  insert into public.profiles(id, first_name, last_name, phone,
    phone_verification_mode, phone_verification_status)
  values (
    new.id,
    left(coalesce(v_first, 'User'), 80),
    left(coalesce(v_last, 'Account'), 80),
    v_phone,
    case when v_phone_verified then 'prototype_fcm' else 'none' end,
    case when v_phone_verified then 'simulated_verified' else 'pending' end
  );

  insert into public.wallets(user_id, currency) values (new.id, 'BWP');
  return new;
end;
$$;
revoke all on function private.handle_new_double_up_user() from public, anon, authenticated;

create trigger on_auth_user_created_double_up
  after insert on auth.users
  for each row execute function private.handle_new_double_up_user();
