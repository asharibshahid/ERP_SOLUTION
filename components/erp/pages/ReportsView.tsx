"use client";

import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

export default function ReportsView() {
  const { engine } = useErpStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Reports</h2>
        <p className="text-sm text-white/40">Auto-generated from the Master Ledger.</p>
      </div>

      <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
          <span className="w-3 h-3 bg-blue-500 rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          Project Profitability (Accrual & Cash)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-white/40 border-b border-white/10">
              <tr>
                <th className="pb-4 font-bold uppercase text-[10px] tracking-wider">Project Name</th>
                <th className="pb-4 font-bold uppercase text-[10px] tracking-wider text-right">Contract</th>
                <th className="pb-4 font-bold uppercase text-[10px] tracking-wider text-right">Dev Cost</th>
                <th className="pb-4 font-bold uppercase text-[10px] tracking-wider text-right text-emerald-400">Project Profit</th>
                <th className="pb-4 font-bold uppercase text-[10px] tracking-wider text-right text-blue-400">Cash Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {engine.projectStats.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition">
                  <td className="py-4 font-bold text-white">{p.name}</td>
                  <td className="py-4 text-right text-white/70">{money(p.contractAmount)}</td>
                  <td className="py-4 text-right text-white/70">{money(p.paidToTeam)}</td>
                  <td className="py-4 text-right font-bold text-emerald-400">{money(p.profit)}</td>
                  <td className="py-4 text-right font-bold text-blue-400">{money(p.received)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
