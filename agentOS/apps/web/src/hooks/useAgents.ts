"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type AgentListRow = {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  departmentId: string;
  nextAgentId: string | null;
  department: { name: string; slug: string };
  nextAgent: { id: string; name: string } | null;
  skill?: { id: string; title: string; slug: string } | null;
};

export function useAgents(departmentId?: string) {
  return useQuery({
    queryKey: ["agents", departmentId],
    queryFn: async () => {
      const { data } = await api.get("/api/agents", {
        params: departmentId ? { departmentId } : undefined,
      });
      return data as AgentListRow[];
    },
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/agents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateChain(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nextAgentId: string | null) => {
      const { data } = await api.put(`/api/agents/${agentId}/chain`, {
        nextAgentId,
      });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent", agentId] });
      void qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
