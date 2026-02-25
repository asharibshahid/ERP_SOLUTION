-- Ensure ERP tables with required columns exist

create extension if not exists pgcrypto;

create table if not exists public.erp_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text,
  name text not null,
  client text not null,
  department text not null,
  contract_amount numeric(14,2) not null default 0,
  start_date date,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_people (
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

create table if not exists public.erp_team_costs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.erp_projects(id) on delete cascade,
  cost_type text not null,
  person_id uuid references public.erp_people(id) on delete set null,
  fixed_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_scope_changes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.erp_projects(id) on delete cascade,
  change_date date not null default current_date,
  added_contract_amount numeric(14,2) not null default 0,
  added_dev_cost numeric(14,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  txn_date date not null default current_date,
  type text not null,
  project_id uuid references public.erp_projects(id) on delete set null,
  person_id uuid references public.erp_people(id) on delete set null,
  category text,
  amount numeric(14,2) not null,
  status text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  departments text[] not null default '{}',
  expense_categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_erp_projects_workspace on public.erp_projects(workspace_id);
create index if not exists idx_erp_people_workspace on public.erp_people(workspace_id);
create index if not exists idx_erp_team_costs_workspace on public.erp_team_costs(workspace_id);
create index if not exists idx_erp_team_costs_project on public.erp_team_costs(project_id);
create index if not exists idx_erp_scope_changes_workspace on public.erp_scope_changes(workspace_id);
create index if not exists idx_erp_scope_changes_project on public.erp_scope_changes(project_id);
create index if not exists idx_erp_transactions_workspace on public.erp_transactions(workspace_id);
create index if not exists idx_erp_transactions_project on public.erp_transactions(project_id);
create index if not exists idx_erp_transactions_person on public.erp_transactions(person_id);

