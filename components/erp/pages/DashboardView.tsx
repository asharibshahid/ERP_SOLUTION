"use client";

import { AlertTriangle } from "lucide-react";
import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

export default function DashboardView() {
  const { engine } = useErpStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold tracking-tight">Business Overview</h2>
        <div className="text-sm text-white/40">
          Period: <span className="text-white font-medium ml-1 bg-[#0d1321] px-2 py-1 rounded border border-white/10">All Time ▾</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
          <p className="text-xs text-white/40 uppercase font-bold mb-2">Income (All Time)</p>
          <h3 className="text-3xl font-bold text-emerald-400">{money(engine.income)}</h3>
        </div>
        <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
          <p className="text-xs text-white/40 uppercase font-bold mb-2">Expenses (All Time)</p>
          <h3 className="text-3xl font-bold text-rose-400">{money(engine.expenses)}</h3>
        </div>
        <div className="bg-gradient-to-br from-[#0d1321] to-[#0a192f] border border-blue-500/20 p-6 rounded-2xl shadow-sm">
          <p className="text-xs text-blue-300/60 uppercase font-bold mb-2">Net Cash (All Time)</p>
          <h3 className="text-3xl font-bold text-white">{money(engine.net)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold mb-6 text-white/80 uppercase tracking-wider text-xs">Department Sales Performance (All Time)</h4>
          <div className="space-y-6">
            {engine.deptSales.map((dept) => (
              <div key={dept.department}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">{dept.department}</span>
                  <span className="font-bold">{money(dept.contracts)}</span>
                </div>
                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${dept.contracts ? (dept.received / dept.contracts) * 100 : 0}%` }} />
                </div>
                <div className="text-[10px] text-white/40 text-right mt-1">{money(dept.received)} received</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1321] border border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <AlertTriangle className="text-amber-400 w-12 h-12 mb-4" strokeWidth={2} />
          <h4 className="text-xl font-bold mb-2">Action Required (All Time)</h4>
          <p className="text-white/40 text-sm mb-8">You have pending payables or receivables that need attention in the ledger.</p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl">
              <p className="text-[10px] text-rose-300 uppercase font-bold mb-1">Pending Payables</p>
              <p className="text-lg font-bold text-rose-400">{money(engine.pendingPayables)}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
              <p className="text-[10px] text-amber-300 uppercase font-bold mb-1">Client Dues</p>
              <p className="text-lg font-bold text-amber-400">{money(engine.totalClientDues)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
