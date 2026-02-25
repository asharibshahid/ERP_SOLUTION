import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type TeamCostRow = Database["public"]["Tables"]["team_costs"]["Row"];
type TeamCostInsert = Database["public"]["Tables"]["team_costs"]["Insert"];
type TeamCostUpdate = Database["public"]["Tables"]["team_costs"]["Update"];

type CreateTeamCostInput = {
  projectId: string;
  costType: string;
  personId?: string | null;
  fixedAmount: number;
};

type UpdateTeamCostInput = Partial<CreateTeamCostInput>;

export async function listTeamCosts(workspaceId: string): Promise<TeamCostRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("team_costs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTeamCostById(workspaceId: string, id: string): Promise<TeamCostRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("team_costs").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTeamCost(workspaceId: string, input: CreateTeamCostInput): Promise<TeamCostRow> {
  const supabase = await createSupabaseServerClient();
  const payload: TeamCostInsert = {
    workspace_id: workspaceId,
    project_id: input.projectId,
    cost_type: input.costType,
    person_id: input.personId ?? null,
    fixed_amount: String(input.fixedAmount),
  };

  const { data, error } = await supabase.from("team_costs").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateTeamCost(workspaceId: string, id: string, updates: UpdateTeamCostInput): Promise<TeamCostRow> {
  const supabase = await createSupabaseServerClient();
  const payload: TeamCostUpdate = {
    ...(updates.projectId !== undefined ? { project_id: updates.projectId } : {}),
    ...(updates.costType !== undefined ? { cost_type: updates.costType } : {}),
    ...(updates.personId !== undefined ? { person_id: updates.personId } : {}),
    ...(updates.fixedAmount !== undefined ? { fixed_amount: String(updates.fixedAmount) } : {}),
  };

  const { data, error } = await supabase.from("team_costs").update(payload).eq("workspace_id", workspaceId).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteTeamCost(workspaceId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_costs").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw error;
}


