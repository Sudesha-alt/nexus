"use client";

import { Topbar } from "@/components/layout/Topbar";
import { AgentCreationWizard } from "@/components/agents/AgentCreationWizard";

export default function NewAgentPage() {
  return (
    <>
      <Topbar title="New Agent" />
      <main className="max-w-3xl p-4 lg:p-8">
        <AgentCreationWizard />
      </main>
    </>
  );
}
