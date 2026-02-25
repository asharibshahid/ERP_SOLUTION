"use client";

import Modal from "@/components/erp/modals/Modal";
import { useErpStore } from "@/components/erp/ErpStoreProvider";

export default function PersonModal() {
  const { closeModal, handleSavePerson, modalPayload, people } = useErpStore();
  const editing = people.find((p) => p.id === modalPayload?.personId);

  return (
    <Modal title={editing ? "Edit Team Member" : "Add Team Member"} onClose={closeModal}>
      <form onSubmit={(e) => void handleSavePerson(e)} className="space-y-4">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <input type="hidden" name="status" value={editing?.status ?? "Active"} />
        <div>
          <label className="text-xs text-white/50 mb-1 block">Full Name *</label>
          <input
            required
            name="name"
            type="text"
            defaultValue={editing?.name ?? ""}
            placeholder="e.g. Alex Doe"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Role *</label>
            <input
              required
              name="role"
              type="text"
              defaultValue={editing?.role ?? ""}
              placeholder="e.g. Frontend Dev"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Type *</label>
            <select required name="type" defaultValue={editing?.type ?? "In-House"} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none">
              <option value="In-House">In-House</option>
              <option value="Remote">Remote</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Monthly Salary</label>
          <input
            name="monthlySalary"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editing?.monthlySalary ?? 0}
            placeholder="0"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 mt-2 transition">
          Save Person
        </button>
      </form>
    </Modal>
  );
}
