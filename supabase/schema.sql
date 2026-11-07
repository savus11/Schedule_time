-- One private planner document per authenticated Supabase user.
-- Run this in the SQL Editor of your own Supabase project before enabling sync.

create table if not exists public.planner_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.planner_states enable row level security;

-- Do not rely on RLS alone: remove broad default grants, then grant only the
-- operations used by signed-in clients.
revoke all on table public.planner_states from anon, authenticated;
grant select, insert, update, delete on table public.planner_states to authenticated;

drop policy if exists "planner_states_select_own" on public.planner_states;
create policy "planner_states_select_own"
  on public.planner_states for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "planner_states_insert_own" on public.planner_states;
create policy "planner_states_insert_own"
  on public.planner_states for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "planner_states_update_own" on public.planner_states;
create policy "planner_states_update_own"
  on public.planner_states for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "planner_states_delete_own" on public.planner_states;
create policy "planner_states_delete_own"
  on public.planner_states for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists planner_states_updated_at_idx
  on public.planner_states (updated_at);
