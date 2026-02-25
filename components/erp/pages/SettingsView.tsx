"use client";

import { useErpStore } from "@/components/erp/ErpStoreProvider";

export default function SettingsView() {
  const {
    newDept,
    setNewDept,
    departments,
    newCat,
    setNewCat,
    expenseCategories,
    handleAddDepartment,
    handleRemoveDepartment,
    handleAddExpenseCategory,
    handleRemoveExpenseCategory,
  } = useErpStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ERP Settings & Configuration</h2>
        <p className="text-sm text-white/40">Manage dynamic dropdowns and categories globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-white">Project Departments</h3>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="Add new department..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => void handleAddDepartment()}
              className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg text-sm font-bold border border-white/5 transition"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {departments.map((dept) => (
              <div key={dept} className="flex justify-between items-center bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl text-sm group hover:bg-white/[0.06] transition">
                <span className="text-white/80 font-medium">{dept}</span>
                <button type="button" onClick={() => void handleRemoveDepartment(dept)} className="text-rose-400/50 hover:text-rose-400 transition">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1321] border border-white/10 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-white">Expense Categories</h3>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Add new category..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => void handleAddExpenseCategory()}
              className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg text-sm font-bold border border-white/5 transition"
            >
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {expenseCategories.map((cat) => (
              <div key={cat} className="flex justify-between items-center bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl text-sm group hover:bg-white/[0.06] transition">
                <span className="text-white/80 font-medium">{cat}</span>
                <button type="button" onClick={() => void handleRemoveExpenseCategory(cat)} className="text-rose-400/50 hover:text-rose-400 transition">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
