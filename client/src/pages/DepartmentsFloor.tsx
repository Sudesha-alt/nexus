import type { AgentName } from "@nexus/shared";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IsoWorkspaceNav } from "../components/departments/IsoWorkspaceNav";
import { TopDownFloorPlan } from "../components/departments/TopDownFloorPlan";
import { AGENT_META, AGENT_ORDER } from "../lib/agents";
import { ISO_DEPT_FILL } from "../data/isometricFloor";
import { mergeDeptTasks, useDepartmentTaskStore } from "../stores/departmentTaskStore";
import "../styles/isometric-floor.css";

export function DepartmentsFloor() {
  const navigate = useNavigate();
  const rawByDept = useDepartmentTaskStore((s) => s.byDept);
  const tasksByDept = useMemo(() => mergeDeptTasks(rawByDept), [rawByDept]);

  return (
    <motion.div
      className="iso-page iso-page-dots"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <IsoWorkspaceNav active="floor" />

      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="mb-1 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]" aria-hidden />
            Orchestration wing · Level 02
          </p>
          <h1 className="iso-hero-title">Office floor plan</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <strong className="font-semibold text-slate-800">Top-down view</strong> — each bay is a
            department. The hub is shared circulation. Click a room to open its suite;{" "}
            <span className="whitespace-nowrap font-mono text-[11px] text-slate-700">open tasks</span>{" "}
            appear as a badge on that bay.
          </p>
        </div>
        <aside className="iso-legend w-full shrink-0 lg:max-w-[230px]" aria-label="Department color legend">
          <h3>Department key</h3>
          {AGENT_ORDER.map((agent) => (
            <div key={agent} className="iso-legend-row">
              <span className="iso-swatch" style={{ background: ISO_DEPT_FILL[agent] }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">
                {AGENT_META[agent].dept}
              </span>
            </div>
          ))}
        </aside>
      </div>

      <nav aria-label="Breadcrumb" className="iso-breadcrumb mb-5">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <button type="button" onClick={() => navigate("/")}>
              Home
            </button>
          </li>
          <li aria-hidden className="text-slate-400">
            /
          </li>
          <li className="font-semibold text-slate-800">Floor map</li>
        </ol>
      </nav>

      <div className="mx-auto w-full max-w-5xl">
        <TopDownFloorPlan
          onRoom={(a: AgentName) => navigate(`/departments/${a}`)}
          tasksByDept={tasksByDept}
        />
      </div>
    </motion.div>
  );
}
