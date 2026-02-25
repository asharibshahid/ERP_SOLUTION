"use client";

import Modal from "@/components/erp/modals/Modal";
import { useErpStore } from "@/components/erp/ErpStoreProvider";

export default function TransactionModal() {
  const { closeModal, handleSaveTransaction, projects, modalPayload } = useErpStore();
  const prefill = modalPayload?.transaction;

  return (
    <Modal title="Log Ledger Transaction" onClose={closeModal}>
      <form onSubmit={(e) => void handleSaveTransaction(e)} className="space-y-4">
        <input type="hidden" name="id" value={prefill?.id ?? ""} />
        <input type="hidden" name="personId" value={prefill?.personId ?? ""} />
        <input type="hidden" name="category" value={prefill?.category ?? ""} />
        <div>
          <label className="text-xs text-white/50 mb-1 block">Transaction Type *</label>
          <select
            required
            name="type"
            defaultValue={prefill?.type ?? "Client Payment"}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none"
          >
            <option value="Client Payment">Client Payment (Income)</option>
            <option value="Remote Dev Payment">Remote Dev Payment (Expense)</option>
            <option value="Office Expense">Office Expense (Expense)</option>
            <option value="Salary Payment">Salary Payment (Expense)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Date *</label>
            <input
              required
              name="date"
              type="date"
              defaultValue={prefill?.date ?? new Date().toISOString().split("T")[0]}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Amount (PKR) *</label>
            <input
              required
              name="amount"
              type="number"
              defaultValue={prefill?.amount ?? ""}
              placeholder="0"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Link Project (Optional)</label>
            <select name="projectId" defaultValue={prefill?.projectId ?? ""} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none">
              <option value="">-- None --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Status *</label>
            <select required name="status" defaultValue={prefill?.status ?? "Paid"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Notes / Reference</label>
          <textarea name="note" defaultValue={prefill?.note ?? ""} placeholder="Any details..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white min-h-[80px]" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 mt-2 transition">
          Write to Ledger
        </button>
      </form>
    </Modal>
  );
}
