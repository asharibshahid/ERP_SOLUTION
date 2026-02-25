-- 20260224123000_erp_schema.sql
-- ERP schema, indexes, triggers, and RLS for workspace-scoped access.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  client text not null,
  department text not null,
  contract_amount numeric(14,2) not null default 0,
  start_date date,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scope_changes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null default current_date,
  added_contract_amount numeric(14,2) not null default 0,
  added_dev_cost numeric(14,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  role text not null,
  type text not null,
  monthly_salary numeric(14,2),
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_costs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  cost_type text not null,
  person_id uuid references public.people(id) on delete set null,
  fixed_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  date date not null default current_date,
  type text not null,
  project_id uuid references public.projects(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  category text,
  amount numeric(14,2) not null,
  status text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  departments text[] not null default '{}',
  expense_categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_workspace_id on public.projects(workspace_id);
create index if not exists idx_projects_status on public.projects(status);

create index if not exists idx_scope_changes_workspace_id on public.scope_changes(workspace_id);
create index if not exists idx_scope_changes_project_id on public.scope_changes(project_id);
create index if not exists idx_scope_changes_date on public.scope_changes(date);

create index if not exists idx_people_workspace_id on public.people(workspace_id);
create index if not exists idx_people_type on public.people(type);
create index if not exists idx_people_status on public.people(status);

create index if not exists idx_team_costs_workspace_id on public.team_costs(workspace_id);
create index if not exists idx_team_costs_project_id on public.team_costs(project_id);
create index if not exists idx_team_costs_person_id on public.team_costs(person_id);
create index if not exists idx_team_costs_cost_type on public.team_costs(cost_type);

create index if not exists idx_transactions_workspace_id on public.transactions(workspace_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_project_id on public.transactions(project_id);
create index if not exists idx_transactions_person_id on public.transactions(person_id);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_transactions_status on public.transactions(status);

create index if not exists idx_settings_workspace_id on public.settings(workspace_id);

create trigger trg_workspaces_updated_at
before update on public.workspaces
for each row
execute procedure public.set_updated_at();

create trigger trg_workspace_members_updated_at
before update on public.workspace_members
for each row
execute procedure public.set_updated_at();

create trigger trg_projects_updated_at
before update on public.projects
for each row
execute procedure public.set_updated_at();

create trigger trg_scope_changes_updated_at
before update on public.scope_changes
for each row
execute procedure public.set_updated_at();

create trigger trg_people_updated_at
before update on public.people
for each row
execute procedure public.set_updated_at();

create trigger trg_team_costs_updated_at
before update on public.team_costs
for each row
execute procedure public.set_updated_at();

create trigger trg_transactions_updated_at
before update on public.transactions
for each row
execute procedure public.set_updated_at();

create trigger trg_settings_updated_at
before update on public.settings
for each row
execute procedure public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.scope_changes enable row level security;
alter table public.people enable row level security;
alter table public.team_costs enable row level security;
alter table public.transactions enable row level security;
alter table public.settings enable row level security;

create policy "workspaces_select_if_member"
on public.workspaces
for select
to authenticated
using (public.is_workspace_member(id));

create policy "workspaces_insert_if_creator"
on public.workspaces
for insert
to authenticated
with check (created_by = auth.uid());

create policy "workspaces_update_if_member"
on public.workspaces
for update
to authenticated
using (public.is_workspace_member(id))
with check (public.is_workspace_member(id));

create policy "workspaces_delete_if_member"
on public.workspaces
for delete
to authenticated
using (public.is_workspace_member(id));

create policy "workspace_members_select_if_same_workspace"
on public.workspace_members
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_if_self_or_member"
on public.workspace_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id
        and w.created_by = auth.uid()
    )
    or public.is_workspace_member(workspace_id)
  )
);

create policy "workspace_members_update_if_member"
on public.workspace_members
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace_members_delete_if_member"
on public.workspace_members
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "projects_select_if_member"
on public.projects
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "projects_insert_if_member"
on public.projects
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "projects_update_if_member"
on public.projects
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "projects_delete_if_member"
on public.projects
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "scope_changes_select_if_member"
on public.scope_changes
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "scope_changes_insert_if_member"
on public.scope_changes
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "scope_changes_update_if_member"
on public.scope_changes
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "scope_changes_delete_if_member"
on public.scope_changes
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "people_select_if_member"
on public.people
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "people_insert_if_member"
on public.people
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "people_update_if_member"
on public.people
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "people_delete_if_member"
on public.people
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "team_costs_select_if_member"
on public.team_costs
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "team_costs_insert_if_member"
on public.team_costs
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "team_costs_update_if_member"
on public.team_costs
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "team_costs_delete_if_member"
on public.team_costs
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "transactions_select_if_member"
on public.transactions
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "transactions_insert_if_member"
on public.transactions
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "transactions_update_if_member"
on public.transactions
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "transactions_delete_if_member"
on public.transactions
for delete
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "settings_select_if_member"
on public.settings
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "settings_insert_if_member"
on public.settings
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "settings_update_if_member"
on public.settings
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "settings_delete_if_member"
on public.settings
for delete
to authenticated
using (public.is_workspace_member(workspace_id));
