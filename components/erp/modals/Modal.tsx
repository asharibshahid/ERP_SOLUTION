"use client";

import React from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
