import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

type CreateProjectInput = {
  name: string;
  client: string;
  department: string;
  contractAmount: number;
  startDate?: string | null;
  status?: string;
};

type UpdateProjectInput = Partial<CreateProjectInput>;

export async function listProjects(workspaceId: string): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectById(workspaceId: string, id: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProject(workspaceId: string, input: CreateProjectInput): Promise<ProjectRow> {
  const supabase = await createSupabaseServerClient();
  const payload: ProjectInsert = {
    workspace_id: workspaceId,
    name: input.name,
    client: input.client,
    department: input.department,
    contract_amount: String(input.contractAmount),
    start_date: input.startDate ?? null,
    status: input.status ?? "Active",
  };

  const { data, error } = await supabase.from("projects").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProject(workspaceId: string, id: string, updates: UpdateProjectInput): Promise<ProjectRow> {
  const supabase = await createSupabaseServerClient();
  const payload: ProjectUpdate = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.client !== undefined ? { client: updates.client } : {}),
    ...(updates.department !== undefined ? { department: updates.department } : {}),
    ...(updates.contractAmount !== undefined ? { contract_amount: String(updates.contractAmount) } : {}),
    ...(updates.startDate !== undefined ? { start_date: updates.startDate } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
  };

  const { data, error } = await supabase.from("projects").update(payload).eq("workspace_id", workspaceId).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteProject(workspaceId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw error;
}


