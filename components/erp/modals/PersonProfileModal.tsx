"use client";

import Modal from "@/components/erp/modals/Modal";
import { useErpStore } from "@/components/erp/ErpStoreProvider";
import { money } from "@/lib/erp/helpers";

export default function PersonProfileModal() {
  const { closeModal, modalPayload, people, transactions } = useErpStore();
  const person = people.find((p) => p.id === modalPayload?.personId);
  const history = transactions.filter((t) => t.personId === modalPayload?.personId);

  return (
    <Modal title="Person Profile" onClose={closeModal}>
      <div className="space-y-4">
        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/50 mb-1">Name</p>
          <p className="font-bold text-white">{person?.name || "Unknown"}</p>
          <p className="text-sm text-white/50">{person?.role || "-"}</p>
        </div>
        <div className="space-y-2 max-h-[260px] overflow-auto pr-2">
          {history.map((t) => (
            <div key={t.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40">{t.date}</p>
                <p className="text-sm text-white">{t.note || t.type}</p>
              </div>
              <p className="font-bold text-white">{money(t.amount)}</p>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-white/40">No transaction history.</p>}
        </div>
      </div>
    </Modal>
  );
}
