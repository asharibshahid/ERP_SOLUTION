-- Map Clerk user IDs (text) to internal UUIDs used in workspace tables
create table if not exists public.erp_clerk_map (
  clerk_user_id text primary key,
  user_uuid uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create unique index if not exists erp_clerk_map_user_uuid_idx on public.erp_clerk_map(user_uuid);
