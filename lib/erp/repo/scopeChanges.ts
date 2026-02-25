import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ScopeChangeRow = Database["public"]["Tables"]["scope_changes"]["Row"];
type ScopeChangeInsert = Database["public"]["Tables"]["scope_changes"]["Insert"];
type ScopeChangeUpdate = Database["public"]["Tables"]["scope_changes"]["Update"];

type CreateScopeChangeInput = {
  projectId: string;
  date: string;
  addedContractAmount: number;
  addedDevCost: number;
  note?: string | null;
};

type UpdateScopeChangeInput = Partial<CreateScopeChangeInput>;

export async function listScopeChanges(workspaceId: string): Promise<ScopeChangeRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("scope_changes").select("*").eq("workspace_id", workspaceId).order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getScopeChangeById(workspaceId: string, id: string): Promise<ScopeChangeRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("scope_changes").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createScopeChange(workspaceId: string, input: CreateScopeChangeInput): Promise<ScopeChangeRow> {
  const supabase = await createSupabaseServerClient();
  const payload: ScopeChangeInsert = {
    workspace_id: workspaceId,
    project_id: input.projectId,
    date: input.date,
    added_contract_amount: String(input.addedContractAmount),
    added_dev_cost: String(input.addedDevCost),
    note: input.note ?? null,
  };

  const { data, error } = await supabase.from("scope_changes").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateScopeChange(workspaceId: string, id: string, updates: UpdateScopeChangeInput): Promise<ScopeChangeRow> {
  const supabase = await createSupabaseServerClient();
  const payload: ScopeChangeUpdate = {
    ...(updates.projectId !== undefined ? { project_id: updates.projectId } : {}),
    ...(updates.date !== undefined ? { date: updates.date } : {}),
    ...(updates.addedContractAmount !== undefined ? { added_contract_amount: String(updates.addedContractAmount) } : {}),
    ...(updates.addedDevCost !== undefined ? { added_dev_cost: String(updates.addedDevCost) } : {}),
    ...(updates.note !== undefined ? { note: updates.note } : {}),
  };

  const { data, error } = await supabase.from("scope_changes").update(payload).eq("workspace_id", workspaceId).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteScopeChange(workspaceId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("scope_changes").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw error;
}


