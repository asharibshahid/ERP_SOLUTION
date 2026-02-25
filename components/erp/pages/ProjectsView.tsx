"use client";

import { useMemo, useState } from "react";
import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

type ProjectFilter = "Active" | "Completed" | "All";

export default function ProjectsView() {
  const { engine, openModal, openTransactionModal, handleDeleteProject, handleToggleProjectStatus, handleDeleteScopeChange, scopeChanges } = useErpStore();
  const [projFilter, setProjFilter] = useState<ProjectFilter>("Active");

  const filteredProjects = useMemo(() => {
    if (projFilter === "All") return engine.projectStats;
    return engine.projectStats.filter((p) => p.status === projFilter);
  }, [engine.projectStats, projFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects & Client Sales</h2>
          <p className="text-sm text-white/40">Manage active work, tracking changes in scope, and client/dev payments.</p>
        </div>
        <button type="button" onClick={() => openModal("project")} className="bg-white/10 border border-white/5 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
          Add Project
        </button>
      </div>

      <div className="flex gap-2 mb-4 border-b border-white/5 pb-4">
        <button
          type="button"
          onClick={() => setProjFilter("Active")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md transition ${projFilter === "Active" ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setProjFilter("Completed")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${projFilter === "Completed" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => setProjFilter("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${projFilter === "All" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          All
        </button>
      </div>

      <div className="space-y-4">
        {filteredProjects.map((p) => {
          const projectScope = scopeChanges.filter((s) => s.projectId === p.id);
          return (
            <div key={p.id} className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl flex flex-col xl:flex-row justify-between gap-6 shadow-sm hover:border-white/20 transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold text-white/30">{p.id.slice(0, 8)}</span>
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">{p.department}</span>
                  <button
                    type="button"
                    onClick={() => void handleToggleProjectStatus(p.id)}
                    className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
                  >
                    {p.status === "Active" ? "Mark Completed" : "Mark Active"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal("project", { projectId: p.id })}
                    className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-blue-300 hover:text-blue-200 hover:border-blue-300/40 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteProject(p.id)}
                    className="text-[10px] px-2 py-0.5 rounded border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-white/40 mb-5">
                  Client: <span className="text-white/80">{p.client}</span> &nbsp;•&nbsp; Contract: <span className="text-white font-bold">{money(p.contractAmount)}</span>
                </p>

                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/40 uppercase font-bold w-12">Client</span>
                    <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 w-24 text-right">{money(p.received)} Paid</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-white/40 uppercase font-bold w-12">Team</span>
                    <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: p.contractAmount ? `${(p.paidToTeam / p.contractAmount) * 100}%` : "0%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 w-24 text-right">{money(p.paidToTeam)} Paid</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-6 border-t xl:border-t-0 xl:border-l border-white/10 pt-6 xl:pt-0 xl:pl-8">
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Client Due</p>
                  <p className="text-xl font-bold text-amber-400">{money(p.due)}</p>
                  <button
                    type="button"
                    onClick={() =>
                      openTransactionModal({
                        type: "Client Payment",
                        projectId: p.id,
                        status: "Paid",
                        note: `Client due received for ${p.name}`,
                      })
                    }
                    className="mt-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-lg font-bold transition"
                  >
                    Receive
                  </button>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block" />
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Dev Payable</p>
                  <button
                    type="button"
                    onClick={() => openModal("scope-change", { projectId: p.id })}
                    className="text-xl font-bold text-rose-400"
                  >
                    Manage ▾
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openTransactionModal({
                        type: "Remote Dev Payment",
                        projectId: p.id,
                        status: "Paid",
                        note: `Team payment for ${p.name}`,
                      })
                    }
                    className="mt-3 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-1.5 rounded-lg font-bold transition"
                  >
                    Pay Team
                  </button>
                </div>
              </div>

              {projectScope.length > 0 && (
                <div className="w-full xl:w-64 bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="text-[11px] uppercase text-white/40 font-bold">Scope Changes</div>
                  {projectScope.map((s) => (
                    <div key={s.id} className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                      <div className="text-xs text-white/60">{s.date}</div>
                      <div className="text-sm text-white font-semibold">{money(s.addedContractAmount)}</div>
                      <button type="button" onClick={() => void handleDeleteScopeChange(s.id)} className="text-[11px] text-rose-300 hover:text-rose-200 mt-2">
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
