"use client";

import Modal from "@/components/erp/modals/Modal";
import { useErpStore } from "@/components/erp/ErpStoreProvider";

export default function ScopeChangeModal() {
  const { closeModal, handleSaveScopeChange, projects, modalPayload } = useErpStore();

  return (
    <Modal title="Scope Change" onClose={closeModal}>
      <form onSubmit={(e) => void handleSaveScopeChange(e)} className="space-y-4">
        <input type="hidden" name="date" value={new Date().toISOString().slice(0, 10)} />
        <input type="hidden" name="addedDevCost" value="0" />
        <div>
          <label className="text-xs text-white/50 mb-1 block">Project *</label>
          <select
            required
            name="projectId"
            defaultValue={modalPayload?.projectId ?? projects[0]?.id}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Title *</label>
          <input required name="title" type="text" placeholder="Describe change..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white" />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Amount (PKR) *</label>
          <input required name="amount" type="number" placeholder="0" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white" />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 mt-2 transition">
          Save Scope Change
        </button>
      </form>
    </Modal>
  );
}
