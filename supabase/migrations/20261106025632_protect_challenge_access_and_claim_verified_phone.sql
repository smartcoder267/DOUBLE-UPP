create policy phone_challenges_deny_direct_access
  on private.phone_simulation_challenges
  for all to anon, authenticated
  using (false)
  with check (false);

create or replace function private.handle_new_double_up_user()
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
       and c.claimed_by is null
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
