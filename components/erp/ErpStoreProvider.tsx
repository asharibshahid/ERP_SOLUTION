"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  deletePersonAction,
  deleteProjectAction,
  deleteScopeChangeAction,
  deleteTeamCostAction,
  deleteTransactionAction,
  loadWorkspaceData,
  savePersonAction,
  saveProjectAction,
  saveScopeChangeAction,
  saveSettingsAction,
  saveTeamCostAction,
  saveTransactionAction,
  toggleProjectStatus,
} from "@/app/main/actions";
import {
  type ActiveTab,
  type ModalType,
  type Person,
  type Project,
  type ScopeChange,
  type TeamCost,
  type Transaction,
  initialDepartments,
  initialExpenseCategories,
  initialPeople,
  initialProjects,
  initialScopeChanges,
  initialTeamCosts,
  initialTransactions,
} from "@/lib/erp/demo-data";
import { erpEngine, type ErpEngineResult } from "@/lib/erp/engine";

type TransactionPrefill = {
  id?: string;
  type?: string;
  projectId?: string;
  personId?: string;
  category?: string;
  status?: string;
  amount?: number;
  note?: string;
  date?: string;
};

type ErpModalPayload = {
  personId?: string;
  projectId?: string;
  transaction?: TransactionPrefill;
};

type ErpStoreValue = {
  activeTab: ActiveTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  isMounted: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  workspaceId: string | null;
  projects: Project[];
  people: Person[];
  scopeChanges: ScopeChange[];
  teamCosts: TeamCost[];
  transactions: Transaction[];
  departments: string[];
  expenseCategories: string[];
  newDept: string;
  setNewDept: React.Dispatch<React.SetStateAction<string>>;
  newCat: string;
  setNewCat: React.Dispatch<React.SetStateAction<string>>;
  modalType: ModalType;
  modalPayload: ErpModalPayload | null;
  openModal: (type: Exclude<ModalType, null>, payload?: ErpModalPayload) => void;
  closeModal: () => void;
  openTransactionModal: (prefill?: TransactionPrefill) => void;
  openPersonProfile: (personId: string) => void;
  engine: ErpEngineResult;
  loadData: () => Promise<void>;
  handleSaveProject: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteProject: (projectId: string) => Promise<void>;
  handleToggleProjectStatus: (projectId: string) => Promise<void>;
  handleSaveTransaction: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteTransaction: (transactionId: string) => Promise<void>;
  handleSavePerson: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeletePerson: (personId: string) => Promise<void>;
  handleSaveScopeChange: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleDeleteScopeChange: (scopeChangeId: string) => Promise<void>;
  handleSaveTeamCost: (payload: { id?: string; projectId: string; costType: string; personId?: string; fixedAmount: number }) => Promise<void>;
  handleDeleteTeamCost: (teamCostId: string) => Promise<void>;
  handleAddDepartment: () => Promise<void>;
  handleRemoveDepartment: (department: string) => Promise<void>;
  handleAddExpenseCategory: () => Promise<void>;
  handleRemoveExpenseCategory: (category: string) => Promise<void>;
  clearError: () => void;
};

const ErpStoreContext = createContext<ErpStoreValue | null>(null);

export function ErpStoreProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [scopeChanges, setScopeChanges] = useState<ScopeChange[]>(initialScopeChanges);
  const [teamCosts, setTeamCosts] = useState<TeamCost[]>(initialTeamCosts);
  const [departments, setDepartments] = useState<string[]>(initialDepartments);
  const [expenseCategories, setExpenseCategories] = useState<string[]>(initialExpenseCategories);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalPayload, setModalPayload] = useState<ErpModalPayload | null>(null);
  const [newDept, setNewDept] = useState("");
  const [newCat, setNewCat] = useState("");

  const engine = useMemo(
    () =>
      erpEngine({
        projects,
        transactions,
        people,
        departments,
      }),
    [projects, transactions, people, departments],
  );

  const clearError = () => setErrorMessage(null);

  const openModal = (type: Exclude<ModalType, null>, payload?: ErpModalPayload) => {
    setModalPayload(payload ?? null);
    setModalType(type);
  };

  const openTransactionModal = (prefill?: TransactionPrefill) => {
    openModal("transaction", { transaction: prefill });
  };

  const openPersonProfile = (personId: string) => {
    openModal("person-profile", { personId });
  };

  const closeModal = () => {
    setModalType(null);
    setModalPayload(null);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    clearError();

    try {
      const data = await loadWorkspaceData();
      setWorkspaceId(data.workspaceId);
      setProjects(data.projects);
      setPeople(data.people);
      setTransactions(data.transactions);
      setScopeChanges(data.scopeChanges);
      setTeamCosts(data.teamCosts);
      setDepartments(data.settings.departments.length ? data.settings.departments : initialDepartments);
      setExpenseCategories(data.settings.expenseCategories.length ? data.settings.expenseCategories : initialExpenseCategories);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load ERP data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fd = new FormData(form);
    const projectId = (fd.get("id") as string) || undefined;

    const payload = {
      id: projectId,
      name: (fd.get("name") as string) || "",
      client: (fd.get("client") as string) || "",
      department: (fd.get("department") as string) || "",
      contractAmount: Number(fd.get("contractAmount") || 0),
      startDate: ((fd.get("startDate") as string) || null) as string | null,
      status: ((fd.get("status") as string) || "Active") as string,
    };

    try {
      const savedProject = await saveProjectAction({ ...payload });

      setProjects((prev) => {
        if (projectId) {
          return prev.map((item) => (item.id === savedProject.id ? savedProject : item));
        }
        return [savedProject, ...prev];
      });

      closeModal();
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save project.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const prevProjects = projects;
    const prevTeamCosts = teamCosts;
    const prevScopeChanges = scopeChanges;
    const prevTransactions = transactions;

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTeamCosts((prev) => prev.filter((c) => c.projectId !== projectId));
    setScopeChanges((prev) => prev.filter((s) => s.projectId !== projectId));
    setTransactions((prev) => prev.map((t) => (t.projectId === projectId ? { ...t, projectId: "" } : t)));

    try {
      await deleteProjectAction({ id: projectId });
    } catch (error) {
      setProjects(prevProjects);
      setTeamCosts(prevTeamCosts);
      setScopeChanges(prevScopeChanges);
      setTransactions(prevTransactions);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete project.");
    }
  };

  const handleToggleProjectStatus = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const nextStatus = project.status === "Active" ? "Completed" : "Active";

    try {
      const updated = await toggleProjectStatus({ id: project.id });

      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update project status.");
    }
  };

  const handleSavePerson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const personId = (fd.get("id") as string) || undefined;

    const payload = {
      id: personId,
      name: (fd.get("name") as string) || "",
      role: (fd.get("role") as string) || "",
      type: (fd.get("type") as string) || "In-House",
      monthlySalary: Number(fd.get("monthlySalary") || 0),
      status: ((fd.get("status") as string) || "Active") as string,
    };

    try {
      const savedPerson = await savePersonAction({ ...payload });

      setPeople((prev) => {
        if (personId) {
          return prev.map((item) => (item.id === savedPerson.id ? savedPerson : item));
        }
        return [savedPerson, ...prev];
      });

      closeModal();
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save person.");
    }
  };

  const handleDeletePerson = async (personId: string) => {
    const prevPeople = people;
    const prevTransactions = transactions;
    const prevTeamCosts = teamCosts;

    setPeople((prev) => prev.filter((person) => person.id !== personId));
    setTransactions((prev) => prev.map((txn) => (txn.personId === personId ? { ...txn, personId: "" } : txn)));
    setTeamCosts((prev) => prev.map((cost) => (cost.personId === personId ? { ...cost, personId: "" } : cost)));

    try {
      await deletePersonAction({ id: personId });
    } catch (error) {
      setPeople(prevPeople);
      setTransactions(prevTransactions);
      setTeamCosts(prevTeamCosts);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete person.");
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const prefill = modalPayload?.transaction;
    const transactionId = (fd.get("id") as string) || prefill?.id;

    const payload = {
      id: transactionId,
      date: ((fd.get("date") as string) || prefill?.date || new Date().toISOString().slice(0, 10)) as string,
      type: ((fd.get("type") as string) || prefill?.type || "Office Expense") as string,
      projectId: ((fd.get("projectId") as string) || prefill?.projectId || "") || null,
      personId: ((fd.get("personId") as string) || prefill?.personId || "") || null,
      category: ((fd.get("category") as string) || prefill?.category || "") || null,
      amount: Number(fd.get("amount") || prefill?.amount || 0),
      status: ((fd.get("status") as string) || prefill?.status || "Paid") as string,
      note: ((fd.get("note") as string) || prefill?.note || "") || null,
    };

    const optimisticId = transactionId ? null : `temp-${Date.now()}`;

    if (optimisticId) {
      setTransactions((prev) => [
        {
          id: optimisticId,
          date: payload.date,
          type: payload.type,
          projectId: payload.projectId ?? "",
          personId: payload.personId ?? "",
          category: payload.category ?? "",
          amount: payload.amount,
          status: payload.status,
          note: payload.note ?? "",
        },
        ...prev,
      ]);
    }

    try {
      const saved = await saveTransactionAction({ ...payload });

      setTransactions((prev) => {
        if (optimisticId) {
          return prev.map((txn) => (txn.id === optimisticId ? saved : txn));
        }
        if (transactionId) {
          return prev.map((txn) => (txn.id === saved.id ? saved : txn));
        }
        return [saved, ...prev];
      });

      closeModal();
      form.reset();
    } catch (error) {
      if (optimisticId) {
        setTransactions((prev) => prev.filter((txn) => txn.id !== optimisticId));
      }
      setErrorMessage(error instanceof Error ? error.message : "Unable to save transaction.");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const prevTransactions = transactions;
    setTransactions((prev) => prev.filter((txn) => txn.id !== transactionId));

    try {
      await deleteTransactionAction({ id: transactionId });
    } catch (error) {
      setTransactions(prevTransactions);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete transaction.");
    }
  };

  const handleSaveScopeChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const scopeId = (fd.get("id") as string) || undefined;

    const payload = {
      id: scopeId,
      projectId: (fd.get("projectId") as string) || "",
      date: ((fd.get("date") as string) || new Date().toISOString().slice(0, 10)) as string,
      addedContractAmount: Number(fd.get("amount") || 0),
      addedDevCost: Number(fd.get("addedDevCost") || 0),
      note: ((fd.get("note") as string) || (fd.get("title") as string) || "") as string,
    };

    try {
      const saved = await saveScopeChangeAction({ ...payload });

      setScopeChanges((prev) => {
        if (scopeId) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });

      closeModal();
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save scope change.");
    }
  };

  const handleDeleteScopeChange = async (scopeChangeId: string) => {
    const prev = scopeChanges;
    setScopeChanges((items) => items.filter((item) => item.id !== scopeChangeId));
    try {
      await deleteScopeChangeAction({ id: scopeChangeId });
    } catch (error) {
      setScopeChanges(prev);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete scope change.");
    }
  };

  const handleSaveTeamCost = async (payload: { id?: string; projectId: string; costType: string; personId?: string; fixedAmount: number }) => {
    try {
      const saved = await saveTeamCostAction({
        id: payload.id,
        projectId: payload.projectId,
        costType: payload.costType,
        personId: payload.personId ?? null,
        fixedAmount: payload.fixedAmount,
      });

      setTeamCosts((prev) => {
        if (payload.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save team cost.");
    }
  };

  const handleDeleteTeamCost = async (teamCostId: string) => {
    const prev = teamCosts;
    setTeamCosts((items) => items.filter((item) => item.id !== teamCostId));
    try {
      await deleteTeamCostAction({ id: teamCostId });
    } catch (error) {
      setTeamCosts(prev);
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete team cost.");
    }
  };

  const persistSettings = async (nextDepartments: string[], nextExpenseCategories: string[]) => {
    const prevDepartments = departments;
    const prevExpenseCategories = expenseCategories;

    setDepartments(nextDepartments);
    setExpenseCategories(nextExpenseCategories);

    try {
      await saveSettingsAction({
        departments: nextDepartments,
        expenseCategories: nextExpenseCategories,
      });
    } catch (error) {
      setDepartments(prevDepartments);
      setExpenseCategories(prevExpenseCategories);
      setErrorMessage(error instanceof Error ? error.message : "Unable to save settings.");
    }
  };

  const handleAddDepartment = async () => {
    const name = newDept.trim();
    if (!name) return;
    if (departments.includes(name)) {
      setNewDept("");
      return;
    }
    await persistSettings([...departments, name], expenseCategories);
    setNewDept("");
  };

  const handleRemoveDepartment = async (department: string) => {
    await persistSettings(
      departments.filter((item) => item !== department),
      expenseCategories,
    );
  };

  const handleAddExpenseCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    if (expenseCategories.includes(name)) {
      setNewCat("");
      return;
    }
    await persistSettings(departments, [...expenseCategories, name]);
    setNewCat("");
  };

  const handleRemoveExpenseCategory = async (category: string) => {
    await persistSettings(
      departments,
      expenseCategories.filter((item) => item !== category),
    );
  };

  const value: ErpStoreValue = {
    activeTab,
    setActiveTab,
    isMounted,
    isLoading,
    errorMessage,
    workspaceId,
    projects,
    people,
    scopeChanges,
    teamCosts,
    transactions,
    departments,
    expenseCategories,
    newDept,
    setNewDept,
    newCat,
    setNewCat,
    modalType,
    modalPayload,
    openModal,
    closeModal,
    openTransactionModal,
    openPersonProfile,
    engine,
    loadData,
    handleSaveProject,
    handleDeleteProject,
    handleToggleProjectStatus,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleSavePerson,
    handleDeletePerson,
    handleSaveScopeChange,
    handleDeleteScopeChange,
    handleSaveTeamCost,
    handleDeleteTeamCost,
    handleAddDepartment,
    handleRemoveDepartment,
    handleAddExpenseCategory,
    handleRemoveExpenseCategory,
    clearError,
  };

  return <ErpStoreContext.Provider value={value}>{children}</ErpStoreContext.Provider>;
}

export function useErpStore() {
  const context = useContext(ErpStoreContext);
  if (!context) {
    throw new Error("useErpStore must be used inside ErpStoreProvider");
  }
  return context;
}
