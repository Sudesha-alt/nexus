import type { AgentName } from "@nexus/shared";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { useDepartmentTaskStore } from "../../stores/departmentTaskStore";

export function DepartmentTasksPanel({ dept }: { dept: AgentName }) {
  const [draft, setDraft] = useState("");
  const tasks = useDepartmentTaskStore((s) => s.byDept[dept] ?? []);
  const addTask = useDepartmentTaskStore((s) => s.addTask);
  const toggleTaskDone = useDepartmentTaskStore((s) => s.toggleTaskDone);
  const removeTask = useDepartmentTaskStore((s) => s.removeTask);

  function submit() {
    addTask(dept, draft);
    setDraft("");
  }

  return (
    <div className="iso-card overflow-hidden">
      <div className="iso-card-head">Department tasks</div>
      <div className="space-y-3 p-3">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Tasks stay in this browser (saved locally). They show as open-task badges on the floor map.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Add a task for this department…"
            className="min-w-0 flex-1 rounded-md border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500"
            aria-label="New task"
          />
          <Button type="button" className="shrink-0 sm:!px-4" onClick={submit} disabled={!draft.trim()}>
            Add
          </Button>
        </div>
        {tasks.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 py-4 text-center text-xs text-slate-500">
            No tasks yet. Add one above.
          </p>
        ) : (
          <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-2 py-2"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTaskDone(dept, t.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-400 text-sky-600 focus:ring-sky-500"
                  aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                />
                <span
                  className={`min-w-0 flex-1 text-sm ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}
                >
                  {t.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeTask(dept, t.id)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
