"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLES = {
  projects: "erp_projects",
  people: "erp_people",
  teamCosts: "erp_team_costs",
  scopeChanges: "erp_scope_changes",
  transactions: "erp_transactions",
  settings: "erp_settings",
  workspaces: "workspaces",
  workspaceMembers: "workspace_members",
} as const;

const DEFAULT_DEPARTMENTS = ["Web Development", "SEO", "SaaS & CRM", "Mobile Apps", "General"];
const DEFAULT_EXPENSE_CATEGORIES = ["Office Rent", "Tools & Software", "Hosting & Domains", "Marketing", "Other"];

const FIXED_AUTH_USER_ID = "00000000-0000-0000-0000-000000000001";
const FIXED_AUTH_EMAIL = "ahsanzahid.devb@gmail.com";

type DbProject = {
  id: string;
  workspace_id: string;
  code: string | null;
  name: string;
  client: string;
  department: string;
  contract_amount: string | number;
  start_date: string | null;
  status: string;
};

type DbPerson = {
  id: string;
  workspace_id: string;
  name: string;
  role: string;
  type: string;
  monthly_salary: string | number | null;
  status: string;
};

type DbTransaction = {
  id: string;
  workspace_id: string;
  txn_date: string;
  type: string;
  project_id: string | null;
  person_id: string | null;
  category: string | null;
  amount: string | number;
  status: string;
  note: string | null;
};

type DbScopeChange = {
  id: string;
  workspace_id: string;
  project_id: string;
  change_date: string;
  added_contract_amount: string | number;
  added_dev_cost: string | number;
  note: string | null;
};

type DbTeamCost = {
  id: string;
  workspace_id: string;
  project_id: string;
  person_id: string | null;
  cost_type: string;
  fixed_amount: string | number;
};

type DbSettings = {
  workspace_id: string;
  departments: string[];
  expense_categories: string[];
};

const toNumber = (v: string | number | null | undefined) => {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function mapProject(row: DbProject) {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    department: row.department,
    contractAmount: toNumber(row.contract_amount),
    startDate: row.start_date,
    status: row.status,
  };
}

function mapPerson(row: DbPerson) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    type: row.type,
    monthlySalary: toNumber(row.monthly_salary),
    status: row.status,
  };
}

function mapTransaction(row: DbTransaction) {
  return {
    id: row.id,
    date: row.txn_date,
    type: row.type,
    projectId: row.project_id ?? "",
    personId: row.person_id ?? "",
    category: row.category ?? "",
    amount: toNumber(row.amount),
    status: row.status,
    note: row.note ?? "",
  };
}

function mapScopeChange(row: DbScopeChange) {
  return {
    id: row.id,
    projectId: row.project_id,
    date: row.change_date,
    addedContractAmount: toNumber(row.added_contract_amount),
    addedDevCost: toNumber(row.added_dev_cost),
    note: row.note ?? "",
  };
}

function mapTeamCost(row: DbTeamCost) {
  return {
    id: row.id,
    projectId: row.project_id,
    personId: row.person_id ?? "",
    costType: row.cost_type,
    fixedAmount: toNumber(row.fixed_amount),
  };
}

function mapSettings(row: DbSettings) {
  return {
    departments: row.departments ?? [],
    expenseCategories: row.expense_categories ?? [],
  };
}

async function ensureAuthUser() {
  const supabase = createSupabaseAdminClient();
  const listed = await supabase.auth.admin.listUsers({
    perPage: 100,
    page: 1,
    email: FIXED_AUTH_EMAIL,
  });

  const existing = listed.data?.users?.find((u) => u.email?.toLowerCase() === FIXED_AUTH_EMAIL.toLowerCase());
  if (existing) return existing.id;

  const created = await supabase.auth.admin.createUser({
    email: FIXED_AUTH_EMAIL,
    email_confirm: true,
    id: FIXED_AUTH_USER_ID,
  });
  if (!created.data.user) {
    throw new Error(created.error?.message ?? "Failed to create auth user");
  }
  return created.data.user.id;
}

async function getWorkspaceId() {
  console.log("[ensureWorkspace] START");
  const supabase = createSupabaseAdminClient();
  const authUserId = await ensureAuthUser();

  const { data: workspaceRow, error: wsErr } = await supabase
    .from(TABLES.workspaces)
    .select("id")
    .eq("created_by", authUserId)
    .limit(1)
    .maybeSingle();
  if (wsErr) {
    console.error("[ensureWorkspace] workspace select error", wsErr);
    throw new Error(wsErr.message);
  }

  let workspaceId = workspaceRow?.id as string | undefined;

  if (!workspaceId) {
    const { data, error } = await supabase
      .from(TABLES.workspaces)
      .insert({ name: "Default Workspace", created_by: authUserId })
      .select("id")
      .single();
    if (error) {
      console.error("[ensureWorkspace] workspace insert error", error);
      throw new Error(error.message);
    }
    workspaceId = data.id;
  }

  const { error: memberErr } = await supabase.from(TABLES.workspaceMembers).upsert(
    {
      workspace_id: workspaceId,
      user_id: authUserId,
      role: "owner",
    },
    { onConflict: "workspace_id,user_id" },
  );
  if (memberErr) {
    console.error("[ensureWorkspace] member upsert error", memberErr);
    throw new Error(memberErr.message);
  }

  const { data: settingsRow, error: settingsErr } = await supabase
    .from(TABLES.settings)
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (settingsErr) {
    console.error("[ensureWorkspace] settings select error", settingsErr);
    throw new Error(settingsErr.message);
  }

  if (!settingsRow) {
    const { error: insertSettingsErr } = await supabase.from(TABLES.settings).insert({
      workspace_id: workspaceId,
      departments: DEFAULT_DEPARTMENTS,
      expense_categories: DEFAULT_EXPENSE_CATEGORIES,
    });
    if (insertSettingsErr) {
      console.error("[ensureWorkspace] settings insert error", insertSettingsErr);
      throw new Error(insertSettingsErr.message);
    }
  }

  console.log("[ensureWorkspace] workspaceId", workspaceId);
  return workspaceId;
}

export async function ensureWorkspace() {
  const workspaceId = await getWorkspaceId();
  return { workspaceId };
}

export async function loadWorkspaceData() {
  console.log("[loadWorkspaceData] START");
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[loadWorkspaceData] start workspaceId", workspaceId);

  const [projectsRes, peopleRes, teamCostsRes, scopeChangesRes, transactionsRes, settingsRes] = await Promise.all([
    supabase.from(TABLES.projects).select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from(TABLES.people).select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from(TABLES.teamCosts).select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from(TABLES.scopeChanges).select("*").eq("workspace_id", workspaceId).order("change_date", { ascending: false }),
    supabase.from(TABLES.transactions).select("*").eq("workspace_id", workspaceId).order("txn_date", { ascending: false }),
    supabase.from(TABLES.settings).select("*").eq("workspace_id", workspaceId).maybeSingle(),
  ]);

  if (projectsRes.error) {
    console.error("[loadWorkspaceData] projects error", projectsRes.error);
    throw new Error(projectsRes.error.message);
  }
  if (peopleRes.error) {
    console.error("[loadWorkspaceData] people error", peopleRes.error);
    throw new Error(peopleRes.error.message);
  }
  if (teamCostsRes.error) {
    console.error("[loadWorkspaceData] teamCosts error", teamCostsRes.error);
    throw new Error(teamCostsRes.error.message);
  }
  if (scopeChangesRes.error) {
    console.error("[loadWorkspaceData] scopeChanges error", scopeChangesRes.error);
    throw new Error(scopeChangesRes.error.message);
  }
  if (transactionsRes.error) {
    console.error("[loadWorkspaceData] transactions error", transactionsRes.error);
    throw new Error(transactionsRes.error.message);
  }
  if (settingsRes.error) {
    console.error("[loadWorkspaceData] settings error", settingsRes.error);
    throw new Error(settingsRes.error.message);
  }

  return {
    workspaceId,
    projects: (projectsRes.data as DbProject[]).map(mapProject),
    people: (peopleRes.data as DbPerson[]).map(mapPerson),
    teamCosts: (teamCostsRes.data as DbTeamCost[]).map(mapTeamCost),
    scopeChanges: (scopeChangesRes.data as DbScopeChange[]).map(mapScopeChange),
    transactions: (transactionsRes.data as DbTransaction[]).map(mapTransaction),
    settings: settingsRes.data ? mapSettings(settingsRes.data as DbSettings) : { departments: DEFAULT_DEPARTMENTS, expenseCategories: DEFAULT_EXPENSE_CATEGORIES },
  };
}

export async function saveProjectAction(input: {
  id?: string;
  name: string;
  client: string;
  department: string;
  contractAmount: number;
  startDate?: string | null;
  status?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[saveProject]", { workspaceId, id: input.id, name: input.name });

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLES.projects)
      .update({
        name: input.name,
        client: input.client,
        department: input.department,
        contract_amount: input.contractAmount,
        start_date: input.startDate ?? null,
        status: input.status ?? "Active",
      })
      .eq("workspace_id", workspaceId)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    revalidatePath("/main");
    return mapProject(data as DbProject);
  }

  const { data, error } = await supabase
    .from(TABLES.projects)
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      client: input.client,
      department: input.department,
      contract_amount: input.contractAmount,
      start_date: input.startDate ?? null,
      status: input.status ?? "Active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapProject(data as DbProject);
}

export async function deleteProjectAction(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[deleteProject]", { workspaceId, id: input.id });

  const { error: deleteTeamCostsError } = await supabase
    .from(TABLES.teamCosts)
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("project_id", input.id);
  if (deleteTeamCostsError) throw new Error(deleteTeamCostsError.message);

  const { error: deleteScopeError } = await supabase
    .from(TABLES.scopeChanges)
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("project_id", input.id);
  if (deleteScopeError) throw new Error(deleteScopeError.message);

  const { error: clearTxError } = await supabase
    .from(TABLES.transactions)
    .update({ project_id: null })
    .eq("workspace_id", workspaceId)
    .eq("project_id", input.id);
  if (clearTxError) throw new Error(clearTxError.message);

  const { error } = await supabase.from(TABLES.projects).delete().eq("workspace_id", workspaceId).eq("id", input.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/main");
  return { id: input.id };
}

export async function toggleProjectStatus(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[toggleProjectStatus]", { workspaceId, id: input.id });
  const { data, error } = await supabase
    .from(TABLES.projects)
    .select("status")
    .eq("workspace_id", workspaceId)
    .eq("id", input.id)
    .single();
  if (error) throw new Error(error.message);
  const nextStatus = data.status === "Active" ? "Completed" : "Active";
  const { data: updated, error: updateErr } = await supabase
    .from(TABLES.projects)
    .update({ status: nextStatus })
    .eq("workspace_id", workspaceId)
    .eq("id", input.id)
    .select("*")
    .single();
  if (updateErr) throw new Error(updateErr.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapProject(updated as DbProject);
}

export async function savePersonAction(input: {
  id?: string;
  name: string;
  role: string;
  type: string;
  monthlySalary?: number | null;
  status?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[savePerson]", { workspaceId, id: input.id, name: input.name });
  const salary = toNumber(input.monthlySalary);

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLES.people)
      .update({
        name: input.name,
        role: input.role,
        type: input.type,
        monthly_salary: salary,
        status: input.status ?? "Active",
      })
      .eq("workspace_id", workspaceId)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    revalidatePath("/main");
    return mapPerson(data as DbPerson);
  }

  const { data, error } = await supabase
    .from(TABLES.people)
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      role: input.role,
      type: input.type,
      monthly_salary: salary,
      status: input.status ?? "Active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapPerson(data as DbPerson);
}

export async function deletePersonAction(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[deletePerson]", { workspaceId, id: input.id });

  const { error: clearTxError } = await supabase
    .from(TABLES.transactions)
    .update({ person_id: null })
    .eq("workspace_id", workspaceId)
    .eq("person_id", input.id);
  if (clearTxError) throw new Error(clearTxError.message);

  const { error: clearTeamCostsError } = await supabase
    .from(TABLES.teamCosts)
    .update({ person_id: null })
    .eq("workspace_id", workspaceId)
    .eq("person_id", input.id);
  if (clearTeamCostsError) throw new Error(clearTeamCostsError.message);

  const { error } = await supabase.from(TABLES.people).delete().eq("workspace_id", workspaceId).eq("id", input.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/main");
  return { id: input.id };
}

export async function saveTransactionAction(input: {
  id?: string;
  date: string;
  type: string;
  projectId?: string | null;
  personId?: string | null;
  category?: string | null;
  amount: number;
  status: string;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[saveTransaction]", { workspaceId, id: input.id, type: input.type });

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLES.transactions)
      .update({
        txn_date: input.date,
        type: input.type,
        project_id: input.projectId ?? null,
        person_id: input.personId ?? null,
        category: input.category ?? null,
        amount: input.amount,
        status: input.status,
        note: input.note ?? null,
      })
      .eq("workspace_id", workspaceId)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    revalidatePath("/main");
    return mapTransaction(data as DbTransaction);
  }

  const { data, error } = await supabase
    .from(TABLES.transactions)
    .insert({
      workspace_id: workspaceId,
      txn_date: input.date,
      type: input.type,
      project_id: input.projectId ?? null,
      person_id: input.personId ?? null,
      category: input.category ?? null,
      amount: input.amount,
      status: input.status,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapTransaction(data as DbTransaction);
}

export async function deleteTransactionAction(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[deleteTransaction]", { workspaceId, id: input.id });

  const { error } = await supabase.from(TABLES.transactions).delete().eq("workspace_id", workspaceId).eq("id", input.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/main");
  return { id: input.id };
}

export async function saveScopeChangeAction(input: {
  id?: string;
  projectId: string;
  date: string;
  addedContractAmount: number;
  addedDevCost: number;
  note?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[saveScopeChange]", { workspaceId, id: input.id, projectId: input.projectId });

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLES.scopeChanges)
      .update({
        project_id: input.projectId,
        change_date: input.date,
        added_contract_amount: input.addedContractAmount,
        added_dev_cost: input.addedDevCost,
        note: input.note ?? null,
      })
      .eq("workspace_id", workspaceId)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    revalidatePath("/main");
    return mapScopeChange(data as DbScopeChange);
  }

  const { data, error } = await supabase
    .from(TABLES.scopeChanges)
    .insert({
      workspace_id: workspaceId,
      project_id: input.projectId,
      change_date: input.date,
      added_contract_amount: input.addedContractAmount,
      added_dev_cost: input.addedDevCost,
      note: input.note ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapScopeChange(data as DbScopeChange);
}

export async function deleteScopeChangeAction(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[deleteScopeChange]", { workspaceId, id: input.id });
  const { error } = await supabase.from(TABLES.scopeChanges).delete().eq("workspace_id", workspaceId).eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return { id: input.id };
}

export async function saveTeamCostAction(input: {
  id?: string;
  projectId: string;
  costType: string;
  personId?: string | null;
  fixedAmount: number;
}) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[saveTeamCost]", { workspaceId, id: input.id, projectId: input.projectId });

  if (input.id) {
    const { data, error } = await supabase
      .from(TABLES.teamCosts)
      .update({
        project_id: input.projectId,
        cost_type: input.costType,
        person_id: input.personId ?? null,
        fixed_amount: input.fixedAmount,
      })
      .eq("workspace_id", workspaceId)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard");
    revalidatePath("/main");
    return mapTeamCost(data as DbTeamCost);
  }

  const { data, error } = await supabase
    .from(TABLES.teamCosts)
    .insert({
      workspace_id: workspaceId,
      project_id: input.projectId,
      cost_type: input.costType,
      person_id: input.personId ?? null,
      fixed_amount: input.fixedAmount,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapTeamCost(data as DbTeamCost);
}

export async function deleteTeamCostAction(input: { id: string }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[deleteTeamCost]", { workspaceId, id: input.id });
  const { error } = await supabase.from(TABLES.teamCosts).delete().eq("workspace_id", workspaceId).eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return { id: input.id };
}

export async function saveSettingsAction(input: { departments: string[]; expenseCategories: string[] }) {
  const supabase = createSupabaseAdminClient();
  const workspaceId = await getWorkspaceId();
  console.log("[saveSettings]", { workspaceId, departments: input.departments.length, expenseCategories: input.expenseCategories.length });

  const { data, error } = await supabase
    .from(TABLES.settings)
    .upsert(
      {
        workspace_id: workspaceId,
        departments: input.departments,
        expense_categories: input.expenseCategories,
      },
      { onConflict: "workspace_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/main");
  return mapSettings(data as DbSettings);
}
