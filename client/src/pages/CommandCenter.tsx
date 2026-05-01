import type { WorkflowScope } from "@nexus/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createWorkflow } from "../lib/api";

type DepartmentKey = "all" | "product" | "marketing" | "sales";

const QUICK_TASKS: Record<DepartmentKey, string[]> = {
  all: [
    "Launch AI search across our product, with GTM and outbound plan.",
    "Build an enterprise onboarding flow and rollout campaign.",
  ],
  product: [
    "Create a PRD for role-based workspace permissions.",
    "Define roadmap priorities from customer feedback for next sprint.",
  ],
  marketing: [
    "Create a GTM package for our new referral program.",
    "Draft launch campaign copy for an AI onboarding assistant.",
  ],
  sales: [
    "Generate outbound sequence for mid-market SaaS ICP.",
    "Prepare discovery script and objection handling for CTO buyers.",
  ],
};

export function CommandCenter() {
  const navigate = useNavigate();
  const [departmentTask, setDepartmentTask] = useState(
    "Build a referral program with tiered rewards for our B2B product."
  );
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey>("all");
  const [running, setRunning] = useState(false);

  const scopeByDept: Record<DepartmentKey, WorkflowScope> = {
    all: "all",
    product: "product",
    marketing: "marketing",
    sales: "sales",
  };

  async function onExecuteDepartmentTask() {
    const trimmed = departmentTask.trim();
    if (!trimmed) {
      toast.error("Enter a department task");
      return;
    }
    setRunning(true);
    try {
      const deptScope = scopeByDept[selectedDepartment];
      const { workflow } = await createWorkflow(
        trimmed,
        deptScope
      );
      toast.success(`Started ${selectedDepartment} mission`);
      navigate(`/workflow/${workflow.id}`);
    } catch {
      toast.error("Could not start department mission");
    } finally {
      setRunning(false);
    }
  }

  const taskLength = departmentTask.trim().length;
  const selectedScope = scopeByDept[selectedDepartment];

  return (
    <div className="space-y-6">
      <TopBar />
      <Card>
        <div className="mb-3 font-mono text-[11px] text-nexus-muted">
          Command Center
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-nexus-text">
          Run a department mission
        </h1>
        <p className="mb-4 text-sm text-nexus-muted">
          Select scope, enter a task, and start the workflow. Everything here is
          fully functional.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {(["all", "product", "marketing", "sales"] as DepartmentKey[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDepartment(d)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase ${
                selectedDepartment === d
                  ? "border-nexus-cyan bg-nexus-cyan text-white"
                  : "border-black/15 bg-white text-nexus-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs text-nexus-muted">
          Department: <strong>{selectedDepartment}</strong> · Pipeline scope:{" "}
          <strong>{selectedScope}</strong>
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_TASKS[selectedDepartment].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDepartmentTask(t)}
              className="rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] text-nexus-muted hover:text-nexus-text"
            >
              {t}
            </button>
          ))}
        </div>

        <textarea
          value={departmentTask}
          onChange={(e) => setDepartmentTask(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void onExecuteDepartmentTask();
            }
          }}
          rows={4}
          aria-label="Department task prompt"
          placeholder="Describe the mission..."
          className="w-full rounded-xl border border-black/15 bg-white p-3 text-sm text-nexus-text outline-none focus:border-nexus-cyan"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-nexus-muted">
          <span>Tip: Ctrl/Cmd + Enter to run</span>
          <span>{taskLength} chars</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void onExecuteDepartmentTask()} disabled={running || taskLength === 0}>
            {running ? "Running..." : "Run Task"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/departments")}>
            Department rooms
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/history")}>
            View History
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/settings")}>
            Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
