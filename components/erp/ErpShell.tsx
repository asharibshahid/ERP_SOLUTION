"use client";

import React from "react";
import { BarChart3, Briefcase, Building2, FolderKanban, Settings, Users, Wallet, X } from "lucide-react";
import { useErpStore } from "@/components/erp/ErpStoreProvider";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "projects", label: "Projects & Sales", icon: FolderKanban },
  { id: "team", label: "Team & Payroll", icon: Users },
  { id: "office", label: "Office & OpEx", icon: Building2 },
  { id: "ledger", label: "Master Ledger", icon: Wallet },
  { id: "reports", label: "Detailed Reports", icon: Briefcase },
  { id: "settings", label: "Settings / Config", icon: Settings },
] as const;

const FLAG_KEY = "erp_logged_in";

export default function ErpShell({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, openModal, errorMessage, clearError } = useErpStore();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(FLAG_KEY);
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060913]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-600/20">OS</div>
          <span className="text-lg font-bold tracking-tight">Agency ERP</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => openModal("project")}
            className="hidden md:block bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition"
          >
            New Project
          </button>
          <button
            type="button"
            onClick={() => openModal("transaction")}
            className="bg-blue-600 px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
          >
            Log Entry
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="px-6 py-2 border-b border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={clearError} className="text-rose-300/70 hover:text-rose-200 transition">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row max-w-[1800px] w-full mx-auto">
        <aside className="w-full md:w-64 p-4 md:border-r border-white/5 flex md:flex-col gap-1 overflow-x-auto bg-[#060913]">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === item.id
                  ? "bg-[#0d1321] text-blue-400 border border-white/10 shadow-sm"
                  : "text-white/50 hover:bg-white/5 border border-transparent hover:text-white"
              }`}
            >
              <item.icon size={18} className="shrink-0" /> {item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
