import type { WorkflowMetrics } from "@nexus/shared";
import { create } from "zustand";

interface AgentMetricsState {
  metrics: WorkflowMetrics | null;
  setMetrics: (m: WorkflowMetrics) => void;
}

export const useAgentStore = create<AgentMetricsState>((set) => ({
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
}));
