create index transaction_audit_events_actor_created_idx
  on public.transaction_audit_events(actor_user_id, created_at desc);
