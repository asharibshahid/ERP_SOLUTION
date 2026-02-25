"use client";

import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

export default function LedgerView() {
  const { transactions, projects, people, openTransactionModal, handleDeleteTransaction } = useErpStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Master Ledger</h2>
        <p className="text-sm text-white/40">Every single transaction flowing through the ERP. Full edit/delete capabilities.</p>
      </div>

      <div className="bg-[#0d1321] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 text-white/40 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">ID & Date</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Type</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Linked Entity / Category</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((t) => {
              const entityName = projects.find((p) => p.id === t.projectId)?.name || people.find((p) => p.id === t.personId)?.name || t.category;
              const isIncome = t.type === "Client Payment";

              return (
                <tr key={t.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-white/30 mb-0.5">{t.id}</div>
                    <div className="font-medium text-white/80">{t.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                        isIncome ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{entityName || "General"}</div>
                    <div className="text-xs text-white/40 mt-0.5">{t.note}</div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                    {isIncome ? "+" : "-"}
                    {money(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold ${t.status === "Paid" ? "text-white/50" : "text-amber-500"}`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        openTransactionModal({
                          id: t.id,
                          date: t.date,
                          type: t.type,
                          projectId: t.projectId || "",
                          personId: t.personId || "",
                          category: t.category || "",
                          amount: t.amount,
                          status: t.status,
                          note: t.note,
                        })
                      }
                      className="text-[11px] text-blue-300 hover:text-blue-200"
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => void handleDeleteTransaction(t.id)} className="text-[11px] text-rose-300 hover:text-rose-200">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
