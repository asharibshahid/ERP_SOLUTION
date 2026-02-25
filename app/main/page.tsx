"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErpShell from "@/components/erp/ErpShell";
import { ErpStoreProvider, useErpStore } from "@/components/erp/ErpStoreProvider";
import PersonModal from "@/components/erp/modals/PersonModal";
import PersonProfileModal from "@/components/erp/modals/PersonProfileModal";
import ProjectModal from "@/components/erp/modals/ProjectModal";
import ScopeChangeModal from "@/components/erp/modals/ScopeChangeModal";
import TransactionModal from "@/components/erp/modals/TransactionModal";
import DashboardView from "@/components/erp/pages/DashboardView";
import LedgerView from "@/components/erp/pages/LedgerView";
import OfficeView from "@/components/erp/pages/OfficeView";
import ProjectsView from "@/components/erp/pages/ProjectsView";
import ReportsView from "@/components/erp/pages/ReportsView";
import SettingsView from "@/components/erp/pages/SettingsView";
import TeamView from "@/components/erp/pages/TeamView";

const FLAG_KEY = "erp_logged_in";

function ErpContent() {
  const { activeTab, isMounted, isLoading, modalType, errorMessage } = useErpStore();

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
        <div className="text-sm text-white/60">Loading workspace…</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#0d1321] border border-rose-500/30 rounded-xl p-6 text-center space-y-3">
          <div className="text-rose-300 font-bold">Error loading ERP</div>
          <div className="text-sm text-white/70">{errorMessage}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErpShell>
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "team" && <TeamView />}
        {activeTab === "office" && <OfficeView />}
        {activeTab === "ledger" && <LedgerView />}
        {activeTab === "reports" && <ReportsView />}
        {activeTab === "settings" && <SettingsView />}
      </ErpShell>

      {modalType === "project" && <ProjectModal />}
      {modalType === "person" && <PersonModal />}
      {modalType === "transaction" && <TransactionModal />}
      {modalType === "scope-change" && <ScopeChangeModal />}
      {modalType === "person-profile" && <PersonProfileModal />}
    </>
  );
}

export default function MainPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && localStorage.getItem(FLAG_KEY) === "true";
    if (!ok) {
      router.replace("/");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return <div className="min-h-screen bg-[#060913]" />;
  }

  return (
    <ErpStoreProvider>
      <ErpContent />
    </ErpStoreProvider>
  );
}
