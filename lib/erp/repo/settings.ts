import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SettingsRow = Database["public"]["Tables"]["settings"]["Row"];
type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];

type UpdateSettingsInput = {
  departments?: string[];
  expenseCategories?: string[];
};

export async function getSettings(workspaceId: string): Promise<SettingsRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("settings").select("*").eq("workspace_id", workspaceId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSettings(workspaceId: string, input: UpdateSettingsInput): Promise<SettingsRow> {
  const supabase = await createSupabaseServerClient();
  const payload: SettingsInsert = {
    workspace_id: workspaceId,
    departments: input.departments ?? [],
    expense_categories: input.expenseCategories ?? [],
  };

  const { data, error } = await supabase.from("settings").upsert(payload, { onConflict: "workspace_id" }).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSettings(workspaceId: string, input: UpdateSettingsInput): Promise<SettingsRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("settings")
    .update({
      ...(input.departments !== undefined ? { departments: input.departments } : {}),
      ...(input.expenseCategories !== undefined ? { expense_categories: input.expenseCategories } : {}),
    })
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSettings(workspaceId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("settings").delete().eq("workspace_id", workspaceId);
  if (error) throw error;
}


