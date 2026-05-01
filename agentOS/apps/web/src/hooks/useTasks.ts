"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useTasks(status?: string) {
  return useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      const { data } = await api.get("/api/tasks", {
        params: status && status !== "all" ? { status } : undefined,
      });
      return data as {
        id: string;
        title: string;
        status: string;
        createdAt: string;
        completedAt: string | null;
        firstAgent: {
          id: string;
          name: string;
          department: { name: string; slug: string };
        };
        _count: { steps: number };
      }[];
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: (q) =>
      q.state.data?.status === "running" ? 4000 : false,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      description: string;
      firstAgentId: string;
    }) => {
      const { data } = await api.post("/api/tasks", body);
      return data as { id: string };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/stats/summary");
      return data as {
        totalAgents: number;
        departments: number;
        tasksTotal: number;
        tasksCompleted: number;
        activeTasks: number;
      };
    },
  });
}
