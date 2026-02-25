"use client";

import Modal from "@/components/erp/modals/Modal";
import { useErpStore } from "@/components/erp/ErpStoreProvider";

export default function ProjectModal() {
  const { closeModal, handleSaveProject, departments, modalPayload, projects } = useErpStore();
  const editing = projects.find((p) => p.id === modalPayload?.projectId);

  return (
    <Modal title={editing ? "Edit Project" : "Create New Project"} onClose={closeModal}>
      <form onSubmit={(e) => void handleSaveProject(e)} className="space-y-4">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <input type="hidden" name="status" value={editing?.status ?? "Active"} />
        <div>
          <label className="text-xs text-white/50 mb-1 block">Project Name *</label>
          <input
            required
            name="name"
            type="text"
            defaultValue={editing?.name ?? ""}
            placeholder="e.g. E-Commerce App"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Client Name *</label>
            <input
              required
              name="client"
              type="text"
              defaultValue={editing?.client ?? ""}
              placeholder="e.g. Acme Corp"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Department *</label>
            <select required name="department" defaultValue={editing?.department ?? departments[0]} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white appearance-none">
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Contract Amount (PKR) *</label>
          <input
            required
            name="contractAmount"
            type="number"
            defaultValue={editing?.contractAmount ?? ""}
            placeholder="0"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 text-white"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 mt-4 transition">
          Save Project Portfolio
        </button>
      </form>
    </Modal>
  );
}
