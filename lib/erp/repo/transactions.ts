import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

type CreateTransactionInput = {
  date: string;
  type: string;
  projectId?: string | null;
  personId?: string | null;
  category?: string | null;
  amount: number;
  status: string;
  note?: string | null;
};

type UpdateTransactionInput = Partial<CreateTransactionInput>;

export async function listTransactions(workspaceId: string): Promise<TransactionRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("workspace_id", workspaceId).order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTransactionById(workspaceId: string, id: string): Promise<TransactionRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("workspace_id", workspaceId).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTransaction(workspaceId: string, input: CreateTransactionInput): Promise<TransactionRow> {
  const supabase = await createSupabaseServerClient();
  const payload: TransactionInsert = {
    workspace_id: workspaceId,
    date: input.date,
    type: input.type,
    project_id: input.projectId ?? null,
    person_id: input.personId ?? null,
    category: input.category ?? null,
    amount: String(input.amount),
    status: input.status,
    note: input.note ?? null,
  };

  const { data, error } = await supabase.from("transactions").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(workspaceId: string, id: string, updates: UpdateTransactionInput): Promise<TransactionRow> {
  const supabase = await createSupabaseServerClient();
  const payload: TransactionUpdate = {
    ...(updates.date !== undefined ? { date: updates.date } : {}),
    ...(updates.type !== undefined ? { type: updates.type } : {}),
    ...(updates.projectId !== undefined ? { project_id: updates.projectId } : {}),
    ...(updates.personId !== undefined ? { person_id: updates.personId } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.amount !== undefined ? { amount: String(updates.amount) } : {}),
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.note !== undefined ? { note: updates.note } : {}),
  };

  const { data, error } = await supabase.from("transactions").update(payload).eq("workspace_id", workspaceId).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteTransaction(workspaceId: string, id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("transactions").delete().eq("workspace_id", workspaceId).eq("id", id);
  if (error) throw error;
}


