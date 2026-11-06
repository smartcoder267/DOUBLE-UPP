create index phone_simulation_challenges_claimed_by_idx
  on private.phone_simulation_challenges(claimed_by);

create or replace function public.create_phone_simulation_challenge(p_phone text)
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
  v_random bytea;
  v_number bigint;
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

  v_random := extensions.gen_random_bytes(4);
  v_number := get_byte(v_random, 0)::bigint * 16777216
    + get_byte(v_random, 1)::bigint * 65536
    + get_byte(v_random, 2)::bigint * 256
    + get_byte(v_random, 3)::bigint;
  v_code := lpad((v_number % 1000000)::text, 6, '0');
  v_id := gen_random_uuid();
  v_expires_at := now() + interval '5 minutes';
  insert into private.phone_simulation_challenges(id, phone, code_hash, expires_at)
  values (v_id, v_phone, encode(extensions.digest(v_code, 'sha256'), 'hex'), v_expires_at);

  -- Prototype-only delivery: return the code for app autofill. Replace with FCM delivery
  -- and omit the code from this response before treating phone verification as a proof channel.
  return jsonb_build_object('challenge_id', v_id, 'code', v_code, 'expires_at', v_expires_at);
end;
$$;

create or replace function public.verify_phone_simulation_challenge(p_challenge_id uuid, p_code text)
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

  if p_code is null or p_code !~ '^[0-9]{6}$'
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
