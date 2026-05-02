"use client";

import { Topbar } from "@/components/layout/Topbar";
import { AgentPromptsStudio } from "@/components/agents/AgentPromptsStudio";
import { useAgents } from "@/hooks/useAgents";

export default function AgentPromptsPage() {
  const { data: agents, isLoading, isError, refetch } = useAgents();

  return (
    <>
      <Topbar title="System prompts" />
      <main className="p-4 lg:p-8">
        <p className="mb-6 max-w-2xl text-sm text-white/55">
          Review and edit the system prompt for every active agent. Changes apply on save and are used for the next task
          run. Filter by department or search across prompt text.
        </p>
        {isLoading ? (
          <p className="text-sm text-white/50">Loading agents…</p>
        ) : isError ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
            <p>Could not load agents.</p>
            <button
              type="button"
              className="mt-2 text-xs underline"
              onClick={() => void refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <AgentPromptsStudio agents={agents} />
        )}
      </main>
    </>
  );
}
