"use client";

import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

export default function OfficeView() {
  const { transactions, openTransactionModal, expenseCategories } = useErpStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Office & Operations</h2>
          <p className="text-sm text-white/40">Manage rent, software tools, and non-project expenses.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            openTransactionModal({
              type: "Office Expense",
              status: "Paid",
              category: expenseCategories[0] ?? "Other",
              note: "Office expense",
            })
          }
          className="bg-white/10 border border-white/5 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Log Office Expense
        </button>
      </div>

      <div className="bg-[#0d1321] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 text-white/40 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Date</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Category</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Note / Desc</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.filter((t) => t.type === "Office Expense").map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4 text-white/70">{t.date}</td>
                <td className="px-6 py-4 font-bold text-white">{t.category}</td>
                <td className="px-6 py-4 text-white/50">{t.note}</td>
                <td className="px-6 py-4 text-right font-bold text-rose-400">-{money(t.amount)}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      t.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {transactions.filter((t) => t.type === "Office Expense").length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/30">
                  No office expenses logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
