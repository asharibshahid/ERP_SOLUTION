export type ActiveTab = "dashboard" | "projects" | "team" | "office" | "ledger" | "reports" | "settings";

export type ModalType =
  | "project"
  | "person"
  | "transaction"
  | "scope-change"
  | "person-profile"
  | null;

export type Project = {
  id: string;
  name: string;
  client: string;
  department: string;
  contractAmount: number;
  startDate?: string | null;
  status: string;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  type: string;
  monthlySalary?: number | null;
  status?: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: string;
  projectId: string;
  personId: string;
  category: string;
  amount: number;
  status: string;
  note: string;
};

export type ScopeChange = {
  id: string;
  projectId: string;
  date: string;
  addedContractAmount: number;
  addedDevCost: number;
  note: string;
};

export type TeamCost = {
  id: string;
  personId: string;
  projectId: string;
  costType: string;
  fixedAmount: number;
};

export const initialProjects: Project[] = [];

export const initialPeople: Person[] = [];

export const initialTransactions: Transaction[] = [];

export const initialScopeChanges: ScopeChange[] = [];

export const initialTeamCosts: TeamCost[] = [];

export const initialDepartments = ["Web Development", "SEO", "SaaS & CRM", "Mobile Apps", "General"];

export const initialExpenseCategories = ["Office Rent", "Tools & Software", "Hosting & Domains", "Marketing", "Other"];
