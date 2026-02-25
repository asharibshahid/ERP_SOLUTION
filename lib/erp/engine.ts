import type { Person, Project, Transaction } from "@/lib/erp/demo-data";

export type ProjectStats = Project & {
  received: number;
  paidToTeam: number;
  due: number;
  profit: number;
  progress: number;
};

export type DeptSales = {
  department: string;
  contracts: number;
  received: number;
};

export type PeopleStats = Person & {
  totalPaid: number;
  totalPending: number;
};

export type ErpEngineResult = {
  income: number;
  expenses: number;
  net: number;
  pendingPayables: number;
  totalClientDues: number;
  projectStats: ProjectStats[];
  deptSales: DeptSales[];
  peopleStats: PeopleStats[];
};

export const erpEngine = ({
  projects,
  transactions,
  people,
  departments,
}: {
  projects: Project[];
  transactions: Transaction[];
  people: Person[];
  departments: string[];
}): ErpEngineResult => {
  const income = transactions.filter((t) => t.type === "Client Payment" && t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type !== "Client Payment" && t.status === "Paid").reduce((s, t) => s + t.amount, 0);
  const pendingPayables = transactions.filter((t) => t.status === "Pending").reduce((s, t) => s + t.amount, 0);

  const projectStats = projects.map((p) => {
    const pTxns = transactions.filter((t) => t.projectId === p.id);
    const received = pTxns.filter((t) => t.type === "Client Payment" && t.status === "Paid").reduce((s, t) => s + t.amount, 0);
    const paidToTeam = pTxns.filter((t) => t.type === "Remote Dev Payment" && t.status === "Paid").reduce((s, t) => s + t.amount, 0);
    const due = p.contractAmount - received;
    const profit = p.contractAmount - paidToTeam;

    return {
      ...p,
      received,
      paidToTeam,
      due,
      profit,
      progress: p.contractAmount ? (received / p.contractAmount) * 100 : 0,
    };
  });

  const totalClientDues = projectStats.reduce((s, p) => s + p.due, 0);

  const deptSales = departments.map((dept) => {
    const deptProjs = projectStats.filter((p) => p.department === dept);
    const contractTotal = deptProjs.reduce((s, p) => s + p.contractAmount, 0);
    const receivedTotal = deptProjs.reduce((s, p) => s + p.received, 0);
    return { department: dept, contracts: contractTotal, received: receivedTotal };
  });

  const peopleStats = people.map((person) => {
    const pTxns = transactions.filter((t) => t.personId === person.id);
    const totalPaid = pTxns.filter((t) => t.status === "Paid").reduce((s, t) => s + t.amount, 0);
    const totalPending = pTxns.filter((t) => t.status === "Pending").reduce((s, t) => s + t.amount, 0);
    return { ...person, totalPaid, totalPending };
  });

  return {
    income,
    expenses,
    net: income - expenses,
    pendingPayables,
    totalClientDues,
    projectStats,
    deptSales,
    peopleStats,
  };
};
