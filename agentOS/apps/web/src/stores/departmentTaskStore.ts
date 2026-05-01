import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FLOOR_BAY_SLUGS } from "@/lib/floorLayout";

export type DeptTask = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

const KNOWN_SLUGS = [
  ...FLOOR_BAY_SLUGS,
  "finance",
  "legal",
  "customer-success",
] as const;

export function emptyByDept(): Record<string, DeptTask[]> {
  const o: Record<string, DeptTask[]> = {};
  for (const s of KNOWN_SLUGS) o[s] = [];
  return o;
}

export function mergeDeptTasks(
  persisted: Partial<Record<string, DeptTask[]>> | undefined
): Record<string, DeptTask[]> {
  const o = emptyByDept();
  if (!persisted) return o;
  for (const key of Object.keys(persisted)) {
    o[key] = persisted[key] ?? [];
  }
  return o;
}

type TaskState = {
  byDept: Record<string, DeptTask[]>;
  addTask: (slug: string, text: string) => void;
  toggleTaskDone: (slug: string, id: string) => void;
  removeTask: (slug: string, id: string) => void;
};

export const useDepartmentTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      byDept: emptyByDept(),
      addTask: (slug, text) => {
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
            [slug]: [...(s.byDept[slug] ?? []), task],
          },
        }));
      },
      toggleTaskDone: (slug, id) =>
        set((s) => ({
          byDept: {
            ...s.byDept,
            [slug]: (s.byDept[slug] ?? []).map((x) =>
              x.id === id ? { ...x, done: !x.done } : x
            ),
          },
        })),
      removeTask: (slug, id) =>
        set((s) => ({
          byDept: {
            ...s.byDept,
            [slug]: (s.byDept[slug] ?? []).filter((x) => x.id !== id),
          },
        })),
    }),
    {
      name: "agentos-department-tasks-v1",
      partialize: (s) => ({ byDept: s.byDept }),
    }
  )
);

export function openTaskCountFor(
  slug: string,
  byDept: Partial<Record<string, DeptTask[]>> | undefined
): number {
  return (byDept?.[slug] ?? []).filter((t) => !t.done).length;
}
