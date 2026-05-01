import type { AgentName, WorkflowStatus } from "@nexus/shared";
import { create } from "zustand";

type StreamMap = Partial<Record<AgentName, string>>;

interface WorkflowState {
  activeWorkflowId: string | null;
  workflowStatus: WorkflowStatus | null;
  streams: StreamMap;
  pauseAfterAgent: AgentName | null;
  setActiveWorkflow: (id: string | null) => void;
  setWorkflowStatus: (s: WorkflowStatus | null) => void;
  setPauseAfter: (a: AgentName | null) => void;
  appendToken: (agent: AgentName, token: string) => void;
  setStream: (agent: AgentName, text: string) => void;
  clearStreams: () => void;
  resetForWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  activeWorkflowId: null,
  workflowStatus: null,
  streams: {},
  pauseAfterAgent: null,
  setActiveWorkflow: (id) => set({ activeWorkflowId: id }),
  setWorkflowStatus: (workflowStatus) => set({ workflowStatus }),
  setPauseAfter: (pauseAfterAgent) => set({ pauseAfterAgent }),
  appendToken: (agent, token) =>
    set((s) => ({
      streams: { ...s.streams, [agent]: (s.streams[agent] ?? "") + token },
    })),
  setStream: (agent, text) =>
    set((s) => ({ streams: { ...s.streams, [agent]: text } })),
  clearStreams: () => set({ streams: {} }),
  resetForWorkflow: (id) =>
    set({
      activeWorkflowId: id,
      streams: {},
      workflowStatus: "running",
      pauseAfterAgent: null,
    }),
}));
