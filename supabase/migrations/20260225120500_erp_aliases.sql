-- Create simple updatable views to expose erp_* names while using existing tables

create view if not exists public.erp_projects as select * from public.projects;
create view if not exists public.erp_people as select * from public.people;
create view if not exists public.erp_team_costs as select * from public.team_costs;
create view if not exists public.erp_scope_changes as select * from public.scope_changes;
create view if not exists public.erp_transactions as select * from public.transactions;
create view if not exists public.erp_settings as select * from public.settings;

grant select, insert, update, delete on public.erp_projects to authenticated;
grant select, insert, update, delete on public.erp_people to authenticated;
grant select, insert, update, delete on public.erp_team_costs to authenticated;
grant select, insert, update, delete on public.erp_scope_changes to authenticated;
grant select, insert, update, delete on public.erp_transactions to authenticated;
grant select, insert, update, delete on public.erp_settings to authenticated;
