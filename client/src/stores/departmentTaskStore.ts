import type { AgentName } from "@nexus/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AGENT_ORDER } from "../lib/agents";

export type DeptTask = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export function emptyByDept(): Record<AgentName, DeptTask[]> {
  const o = {} as Record<AgentName, DeptTask[]>;
  for (const a of AGENT_ORDER) o[a] = [];
  return o;
}

export function mergeDeptTasks(
  persisted: Partial<Record<AgentName, DeptTask[]>> | undefined
): Record<AgentName, DeptTask[]> {
  const o = emptyByDept();
  if (!persisted) return o;
  for (const a of AGENT_ORDER) o[a] = persisted[a] ?? [];
  return o;
}

type TaskState = {
  byDept: Record<AgentName, DeptTask[]>;
  addTask: (agent: AgentName, text: string) => void;
  toggleTaskDone: (agent: AgentName, id: string) => void;
  removeTask: (agent: AgentName, id: string) => void;
};

export const useDepartmentTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      byDept: emptyByDept(),
      addTask: (agent, text) => {
        const t = text.trim();
        if (!t) return;
        const task: DeptTask = {
          id: crypto.randomUUID(),
          text: t,
          done: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          byDept: {
            ...s.byDept,
            [agent]: [...(s.byDept[agent] ?? []), task],
          },
        }));
      },
      toggleTaskDone: (agent, id) =>
        set((s) => ({
          byDept: {
            ...s.byDept,
            [agent]: (s.byDept[agent] ?? []).map((x) =>
              x.id === id ? { ...x, done: !x.done } : x
            ),
          },
        })),
      removeTask: (agent, id) =>
        set((s) => ({
          byDept: {
            ...s.byDept,
            [agent]: (s.byDept[agent] ?? []).filter((x) => x.id !== id),
          },
        })),
    }),
    {
      name: "nexus-department-tasks-v1",
      partialize: (s) => ({ byDept: s.byDept }),
    }
  )
);

export function openTaskCountFor(
  agent: AgentName,
  byDept: Partial<Record<AgentName, DeptTask[]>> | undefined
): number {
  return (byDept?.[agent] ?? []).filter((t) => !t.done).length;
}
