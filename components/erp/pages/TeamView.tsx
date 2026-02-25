"use client";

import { useMemo, useState } from "react";
import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

type TeamFilter = "All" | "In-House" | "Remote";

export default function TeamView() {
  const { engine, openModal, openPersonProfile, openTransactionModal, handleDeletePerson } = useErpStore();
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("All");

  const filteredPeople = useMemo(() => {
    if (teamFilter === "All") return engine.peopleStats;
    return engine.peopleStats.filter((p) => p.type === teamFilter);
  }, [engine.peopleStats, teamFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team & HR</h2>
          <p className="text-sm text-white/40">Manage your people, view history, and process payroll.</p>
        </div>
        <button type="button" onClick={() => openModal("person")} className="bg-white/10 border border-white/5 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
          Add Person
        </button>
      </div>

      <div className="flex gap-2 mb-4 border-b border-white/5 pb-4">
        <button
          type="button"
          onClick={() => setTeamFilter("All")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-md transition ${teamFilter === "All" ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setTeamFilter("In-House")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${teamFilter === "In-House" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          In-House
        </button>
        <button
          type="button"
          onClick={() => setTeamFilter("Remote")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${teamFilter === "Remote" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
        >
          Remote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPeople.map((person) => (
          <div key={person.id} className="bg-[#0d1321] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{person.name}</h3>
                  <p className="text-sm text-white/50">{person.role}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded border ${
                    person.type === "In-House"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : person.type === "Remote"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-white/5 text-white/60 border-white/10"
                  }`}
                >
                  {person.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-black/30 border border-white/5 rounded-xl p-4">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Lifetime Paid</p>
                  <p className="text-lg font-bold text-emerald-400">{money(person.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Pending</p>
                  <p className="text-lg font-bold text-amber-400">{money(person.totalPending)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center mt-auto">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => openPersonProfile(person.id)} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition">
                  View Log/History →
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openModal("person", {
                      personId: person.id,
                    })
                  }
                  className="text-xs text-white/60 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeletePerson(person.id)}
                  className="text-xs text-rose-300 hover:text-rose-200 transition"
                >
                  Delete
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  openTransactionModal({
                    personId: person.id,
                    type: person.type === "In-House" ? "Salary Payment" : "Remote Dev Payment",
                    status: "Paid",
                    note: `Quick pay for ${person.name}`,
                  })
                }
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition border border-white/5"
              >
                Quick Pay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
