import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PersonRow = Database["public"]["Tables"]["people"]["Row"];
type PersonInsert = Database["public"]["Tables"]["people"]["Insert"];
type PersonUpdate = Database["public"]["Tables"]["people"]["Update"];

type CreatePersonInput = {
  name: string;
  role: string;
  type: string;
  monthlySalary?: number | null;
  status?: string;
};

type UpdatePersonInput = Partial<CreatePersonInput>;

export async function listPeople(workspaceId: string): Promise<PersonRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("people").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPersonById(workspaceId: string, id: string): Promise<PersonRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("people").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPerson(workspaceId: string, input: CreatePersonInput): Promise<PersonRow> {
  const supabase = await createSupabaseServerClient();
  const payload: PersonInsert = {
    workspace_id: workspaceId,
    name: input.name,
    role: input.role,
    type: input.type,
    monthly_salary: input.monthlySalary == null ? null : String(input.monthlySalary),
    status: input.status ?? "Active",
  };

  const { data, error } = await supabase.from("people").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updatePerson(workspaceId: string, id: string, updates: UpdatePersonInput): Promise<PersonRow> {
  const supabase = await createSupabaseServerClient();
  const payload: PersonUpdate = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.role !== undefined ? { role: updates.role } : {}),
    ...(updates.type !== undefined ? { type: updates.type } : {}),
    ...(updates.monthlySalary !== undefined ? { monthly_salary: updates.monthlySalary == null ? null : String(updates.monthlySalary) } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
  };

  const { data, error } = await supabase.from("people").update(payload).eq("workspace_id", workspaceId).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deletePerson(workspaceId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("people").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw error;
}


