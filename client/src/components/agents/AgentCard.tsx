import { motion } from "framer-motion";
import type { AgentName, AgentRunStatus } from "@nexus/shared";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAgentPreview, useMergedAgentOutput } from "../../hooks/useStreaming";
import { AGENT_META } from "../../lib/agents";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { Modal } from "../ui/Modal";

function toneForStatus(s: AgentRunStatus): "idle" | "processing" | "complete" | "error" | "skipped" | "pending" {
  switch (s) {
    case "processing":
      return "processing";
    case "complete":
      return "complete";
    case "error":
      return "error";
    case "skipped":
      return "skipped";
    case "pending":
      return "pending";
    default:
      return "idle";
  }
}

export function AgentCard({
  agent,
  status,
  output,
  workflowId,
  onRetry,
}: {
  agent: AgentName;
  status: AgentRunStatus;
  output: string | null | undefined;
  workflowId?: string;
  onRetry?: (a: AgentName) => void;
}) {
  const meta = AGENT_META[agent];
  const Icon = meta.icon;
  const merged = useMergedAgentOutput(agent, output ?? null);
  const preview = useAgentPreview(agent, output ?? null);
  const [open, setOpen] = useState(false);
  const active = status === "processing";

  const progress =
    status === "complete"
      ? 100
      : status === "processing"
        ? 66
        : status === "error"
          ? 100
          : status === "skipped"
            ? 100
            : 0;

  return (
    <ErrorBoundary label={`Agent card: ${agent}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: active ? 1 : 0.99 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <Card active={active} className="relative h-full overflow-hidden">
          {active ? (
            <span className="pointer-events-none absolute left-1/2 top-3 h-16 w-16 -translate-x-1/2 rounded-full border border-nexus-cyan/30 animate-pulseRing" />
          ) : null}
          <div className="relative flex items-start gap-3">
            <div
              className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,212,255,0.2)] bg-nexus-bg/60 ${
                active ? "shadow-glow" : ""
              }`}
            >
              <Icon
                className={`h-6 w-6 ${active ? "text-nexus-cyan" : "text-nexus-violet"}`}
              />
              {active ? (
                <span className="absolute inset-0 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.35)] animate-breathe" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-mono text-sm font-semibold text-nexus-text">
                  {meta.label}
                </h3>
                <Badge tone={toneForStatus(status)}>{status}</Badge>
              </div>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
                {meta.dept}
              </p>
            </div>
          </div>

          <p className="mt-3 line-clamp-3 min-h-[3.5rem] font-mono text-[11px] leading-relaxed text-nexus-muted">
            {preview || "Awaiting task assignment…"}
            {active ? (
              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-nexus-cyan align-middle" />
            ) : null}
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-nexus-bg">
            <motion.div
              className={`h-full rounded-full ${
                status === "error"
                  ? "bg-nexus-danger"
                  : status === "complete" || status === "skipped"
                    ? "bg-nexus-success"
                    : "bg-gradient-to-r from-nexus-cyan to-nexus-violet"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.6 }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              className="!py-1 !text-[11px]"
              onClick={() => setOpen(true)}
              disabled={merged.length === 0 && status === "idle"}
            >
              Expand output
            </Button>
            {workflowId && status === "error" && onRetry ? (
              <Button
                type="button"
                variant="ghost"
                className="!py-1 !text-[11px]"
                onClick={() => onRetry(agent)}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            ) : null}
          </div>

          <Modal
            open={open}
            title={meta.label}
            onClose={() => setOpen(false)}
          >
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-nexus-text">
              {merged || "No output yet."}
            </pre>
          </Modal>
        </Card>
      </motion.div>
    </ErrorBoundary>
  );
}
