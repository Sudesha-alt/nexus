import { motion } from "framer-motion";
import type { AgentName, AgentRunRow, AgentRunStatus } from "@nexus/shared";
import { Check, Circle, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { AGENT_META, AGENT_ORDER } from "../../lib/agents";

function iconFor(status: AgentRunStatus): ReactNode {
  switch (status) {
    case "complete":
    case "skipped":
      return <Check className="h-4 w-4 text-nexus-success" />;
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-nexus-warning" />;
    case "error":
      return <XCircle className="h-4 w-4 text-nexus-danger" />;
    default:
      return <Circle className="h-4 w-4 text-nexus-muted" />;
  }
}

export function PipelineStepper({
  runs,
  activeAgent,
  onSelect,
}: {
  runs: AgentRunRow[];
  activeAgent: AgentName | null;
  onSelect?: (agent: AgentName) => void;
}) {
  const map = new Map<AgentName, AgentRunRow>(
    runs.map((r) => [r.agent_name as AgentName, r])
  );

  return (
    <nav aria-label="Pipeline" className="space-y-2">
      {AGENT_ORDER.map((agent) => {
        const row = map.get(agent);
        const status: AgentRunStatus = row?.status ?? "idle";
        const meta = AGENT_META[agent];
        const isActive = activeAgent === agent || status === "processing";
        return (
          <motion.button
            key={agent}
            type="button"
            onClick={() => onSelect?.(agent)}
            layout
            className={`flex items-center gap-3 rounded-lg border px-2 py-2 font-mono text-[11px] ${
              isActive
                ? "border-nexus-cyan/40 bg-nexus-cyan/5 shadow-glowSoft"
                : "border-[rgba(0,212,255,0.1)] bg-nexus-bg/40"
            } ${onSelect ? "w-full text-left hover:border-nexus-cyan/40" : "w-full text-left"}`}
            animate={isActive ? { y: [0, -2, 0] } : {}}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2.2 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(0,212,255,0.15)] bg-nexus-surface/80">
              {iconFor(status)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-nexus-text">{meta.label}</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-nexus-muted">
                {meta.dept}
              </div>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
