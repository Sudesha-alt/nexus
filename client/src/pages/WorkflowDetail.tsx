import type { AgentName, AgentRunRow, AgentRunStatus } from "@nexus/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AgentGrid } from "../components/agents/AgentGrid";
import { AgentOutputPanel } from "../components/agents/AgentOutputPanel";
import { AgentConnector } from "../components/pipeline/AgentConnector";
import { PipelineStepper } from "../components/pipeline/PipelineStepper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfettiBurst } from "../components/ui/ConfettiBurst";
import { Spinner } from "../components/ui/Spinner";
import { useLogBuffer } from "../hooks/useLogBuffer";
import { useWorkflowSocket } from "../hooks/useSocket";
import { useWorkflowDetail } from "../hooks/useWorkflow";
import { useMergedAgentOutput } from "../hooks/useStreaming";
import {
  fetchMetrics,
  cancelWorkflow,
  patchAgentOutput,
  resumeWorkflow,
  retryAgent,
  skipAgent,
} from "../lib/api";
import { AGENT_ORDER } from "../lib/agents";
import { useAgentStore } from "../stores/agentStore";
import { useWorkflowStore } from "../stores/workflowStore";

function statusesFromRuns(runs: AgentRunRow[]): Record<AgentName, AgentRunStatus> {
  const m = {} as Record<AgentName, AgentRunStatus>;
  for (const a of AGENT_ORDER) {
    m[a] = "idle";
  }
  for (const r of runs) {
    m[r.agent_name as AgentName] = r.status;
  }
  return m;
}

function buildDiff(original: string, edited: string): string {
  const a = original.split("\n");
  const b = edited.split("\n");
  const max = Math.max(a.length, b.length);
  const lines: string[] = [];
  for (let i = 0; i < max; i++) {
    const left = a[i] ?? "";
    const right = b[i] ?? "";
    if (left === right) {
      lines.push(`  ${left}`);
      continue;
    }
    if (left.length > 0) lines.push(`- ${left}`);
    if (right.length > 0) lines.push(`+ ${right}`);
  }
  return lines.join("\n");
}

export function WorkflowDetail() {
  const { id } = useParams();
  const workflowId = id ?? null;
  const { data, loading, refresh } = useWorkflowDetail(id);
  useWorkflowSocket(workflowId);
  const logChars = useLogBuffer(workflowId);

  const setMetrics = useAgentStore((s) => s.setMetrics);
  const workflowStatus = useWorkflowStore((s) => s.workflowStatus);
  const setWorkflowStatus = useWorkflowStore((s) => s.setWorkflowStatus);
  const setPauseAfter = useWorkflowStore((s) => s.setPauseAfter);
  const setStream = useWorkflowStore((s) => s.setStream);
  const pauseAfter = useWorkflowStore((s) => s.pauseAfterAgent);

  const [selected, setSelected] = useState<AgentName>("product");
  const [showDiff, setShowDiff] = useState(false);
  const [editBuf, setEditBuf] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const hydrated = useRef(false);
  const celebratedRef = useRef(false);

  useEffect(() => {
    hydrated.current = false;
    celebratedRef.current = false;
    const st = useWorkflowStore.getState();
    st.clearStreams();
    st.setActiveWorkflow(workflowId);
    st.setPauseAfter(null);
  }, [id, workflowId]);

  useEffect(() => {
    if (!data) return;
    setWorkflowStatus(data.workflow.status);
    setPauseAfter((data.pauseAfterAgent as AgentName | null) ?? null);
    if (!hydrated.current) {
      for (const r of data.agents) {
        if (
          r.status === "complete" &&
          r.output &&
          r.output.length > 0
        ) {
          setStream(r.agent_name as AgentName, r.output);
        }
      }
      hydrated.current = true;
    }
  }, [data, setPauseAfter, setStream, setWorkflowStatus]);

  useEffect(() => {
    if (!workflowId) return;
    if (data?.workflow.status !== "running" && data?.workflow.status !== "pending") {
      return;
    }
    const t = window.setInterval(() => {
      void refresh();
    }, 4000);
    return () => window.clearInterval(t);
  }, [workflowId, data?.workflow.status, refresh]);

  useEffect(() => {
    if (workflowStatus === "completed" && !celebratedRef.current) {
      celebratedRef.current = true;
      setCelebrate(true);
      void fetchMetrics().then(setMetrics).catch(() => {});
      void refresh();
    }
  }, [workflowStatus, refresh, setMetrics]);

  const runs = useMemo(() => data?.agents ?? [], [data]);
  const activeAgent: AgentName | null = useMemo(() => {
    const p = runs.find((r) => r.status === "processing");
    return (p?.agent_name as AgentName) ?? null;
  }, [runs]);

  useEffect(() => {
    if (activeAgent) setSelected(activeAgent);
  }, [activeAgent]);

  const selectedRun = runs.find((r) => r.agent_name === selected);
  const merged = useMergedAgentOutput(selected, selectedRun?.output);
  const editedForSelected = data?.editedOutputs?.[selected] ?? null;
  const baseForSelected = selectedRun?.output ?? "";

  useEffect(() => {
    if (pauseAfter && data?.pauseAfterAgent === pauseAfter) {
      const out = runs.find((r) => r.agent_name === pauseAfter)?.output ?? "";
      setEditBuf(out);
    }
  }, [pauseAfter, data?.pauseAfterAgent, runs]);

  const onApprove = useCallback(async () => {
    if (!workflowId || !pauseAfter) return;
    try {
      await patchAgentOutput(workflowId, pauseAfter, editBuf);
      await resumeWorkflow(workflowId);
      toast.success("Resuming pipeline");
      setPauseAfter(null);
      void refresh();
    } catch {
      toast.error("Could not resume");
    }
  }, [workflowId, pauseAfter, editBuf, refresh, setPauseAfter]);

  const onRetry = useCallback(
    async (agent: AgentName) => {
      if (!workflowId) return;
      try {
        await retryAgent(workflowId, agent);
        toast.success(`Retrying ${agent}`);
        void refresh();
      } catch {
        toast.error("Retry failed");
      }
    },
    [workflowId, refresh]
  );

  const onSkip = useCallback(async () => {
    if (!workflowId || !pauseAfter) return;
    const idx = AGENT_ORDER.indexOf(pauseAfter);
    const toSkip = idx >= 0 ? AGENT_ORDER[idx + 1] : undefined;
    if (!toSkip) {
      toast.error("Nothing to skip");
      return;
    }
    try {
      await skipAgent(workflowId, toSkip);
      await resumeWorkflow(workflowId);
      toast.success(`Skipped ${toSkip}`);
      setPauseAfter(null);
      void refresh();
    } catch {
      toast.error("Skip failed");
    }
  }, [workflowId, pauseAfter, refresh, setPauseAfter]);

  const onCancel = useCallback(async () => {
    if (!workflowId) return;
    try {
      await cancelWorkflow(workflowId);
      toast.success("Workflow cancelled");
      void refresh();
    } catch {
      toast.error("Cancel failed");
    }
  }, [workflowId, refresh]);

  const onCopySelected = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(merged);
      toast.success("Copied output");
    } catch {
      toast.error("Copy failed");
    }
  }, [merged]);

  const onExportSelected = useCallback(() => {
    const blob = new Blob([merged], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}-output.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported markdown");
  }, [merged, selected]);

  if (!workflowId) {
    return <p className="text-nexus-muted">Missing workflow id</p>;
  }

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-nexus-muted">
        <Spinner />
        Loading workflow…
      </div>
    );
  }

  if (!data) {
    return <p className="text-nexus-muted">Workflow not found.</p>;
  }

  const statuses = statusesFromRuns(runs);

  return (
    <div className="space-y-6">
      <ConfettiBurst fire={celebrate} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-wider text-nexus-cyan hover:underline"
          >
            ← Command center
          </Link>
          <h1 className="mt-2 font-display text-2xl text-nexus-text">Pipeline</h1>
          <p className="mt-1 max-w-3xl font-mono text-xs text-nexus-muted">
            {data.workflow.command}
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
          {data.workflow.status} · {data.workflow.scope}
        </div>
        {(data.workflow.status === "running" ||
          data.workflow.status === "paused" ||
          data.workflow.status === "pending") && (
          <Button type="button" variant="danger" onClick={() => void onCancel()}>
            Cancel run
          </Button>
        )}
      </div>

      {data.workflow.status === "paused" || pauseAfter ? (
        <Card className="border-nexus-warning/40 bg-nexus-warning/5">
          <div className="font-mono text-sm text-nexus-warning">
            Approval required after {pauseAfter ?? data.pauseAfterAgent}
          </div>
          <textarea
            className="mt-3 min-h-[160px] w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg p-3 font-mono text-xs text-nexus-text"
            value={editBuf}
            onChange={(e) => setEditBuf(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void onApprove()}>
              Approve &amp; continue
            </Button>
            <Button type="button" variant="ghost" onClick={() => void onSkip()}>
              Skip next agent
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
        <Card className="h-fit xl:sticky xl:top-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
            Stages
          </div>
          <PipelineStepper
            runs={runs}
            activeAgent={activeAgent}
            onSelect={(a) => setSelected(a)}
          />
        </Card>

        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            {AGENT_ORDER.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setSelected(a)}
                className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  selected === a
                    ? "border-nexus-cyan/50 bg-nexus-cyan/10 text-nexus-cyan"
                    : "border-[rgba(0,212,255,0.12)] text-nexus-muted hover:text-nexus-text"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => void onCopySelected()}>
              Copy output
            </Button>
            <Button type="button" variant="ghost" onClick={onExportSelected}>
              Export markdown
            </Button>
            {editedForSelected !== null && editedForSelected !== baseForSelected ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDiff((v) => !v)}
              >
                {showDiff ? "Hide diff" : "Show edited diff"}
              </Button>
            ) : null}
          </div>
          {showDiff && editedForSelected !== null ? (
            <pre className="mb-4 max-h-60 overflow-auto rounded-lg border border-[rgba(0,212,255,0.18)] bg-nexus-bg p-3 font-mono text-[11px] text-nexus-text">
              {buildDiff(baseForSelected, editedForSelected)}
            </pre>
          ) : null}
          <AgentOutputPanel markdown={merged || "_Waiting for output…_"} />
        </Card>

        <Card className="flex max-h-[70vh] flex-col xl:sticky xl:top-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
            Agent console (streaming)
          </div>
          <pre className="min-h-[200px] flex-1 overflow-auto rounded-lg border border-[rgba(0,212,255,0.12)] bg-nexus-bg p-3 font-mono text-[10px] leading-relaxed text-nexus-success">
            {logChars.join("")}
            <span className="inline-block h-3 w-2 animate-pulse bg-nexus-cyan align-middle" />
          </pre>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 font-display text-lg text-nexus-text">Live agents</h2>
        <AgentConnector statuses={statuses} />
        <AgentGrid runs={runs} workflowId={workflowId} onRetry={onRetry} />
      </div>

      <Card>
        <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
          Dependency graph
        </div>
        <p className="mt-2 font-mono text-xs text-nexus-muted">
          Product → Design → Engineering → (QA ∥ Marketing) → Sales — context is persisted to
          SQLite after each stage for History and Knowledge Base.
        </p>
      </Card>
    </div>
  );
}
