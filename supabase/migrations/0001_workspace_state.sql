-- CMND persistence: per-user key/value workspace state.
-- One row per (user, key). The nine cmnd2-* keys (theme, layout, minimized,
-- railOpen, outlines, threads, events, activeOutline, activeThread) each map to a
-- row whose `value` holds the stringified JSON the app serializes.

create table if not exists public.workspace_state (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.workspace_state enable row level security;

-- A user can only see and mutate their own rows.
create policy "workspace_state_select_own"
  on public.workspace_state for select
  using (auth.uid() = user_id);

create policy "workspace_state_insert_own"
  on public.workspace_state for insert
  with check (auth.uid() = user_id);

create policy "workspace_state_update_own"
  on public.workspace_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workspace_state_delete_own"
  on public.workspace_state for delete
  using (auth.uid() = user_id);
