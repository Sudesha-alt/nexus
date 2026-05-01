import { motion } from "framer-motion";
import type { WorkflowRow } from "@nexus/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { createWorkflow, fetchHistory } from "../lib/api";

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60000)}m`;
}

export function History() {
  const [rows, setRows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const qRef = useRef(q);
  qRef.current = q;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { workflows } = await fetchHistory({
        q: qRef.current.trim() || undefined,
        status: status === "all" ? undefined : status,
      });
      setRows(workflows);
    } catch {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <TopBar />
      <h1 className="mb-6 font-display text-2xl text-nexus-text">History</h1>

      <Card className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="font-mono text-[10px] uppercase text-nexus-muted">
              Search command
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load();
              }}
              className="mt-1 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              placeholder="Filter…"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase text-nexus-muted">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text md:w-40"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <Button type="button" onClick={() => void load()}>
            Search
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center gap-2 text-nexus-muted">
          <Spinner />
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <p className="font-mono text-sm text-nexus-muted">
            No workflows yet. Run a command from the Command Center to populate history.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block font-mono text-xs text-nexus-cyan hover:underline"
          >
            Go to Command Center
          </Link>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,212,255,0.12)]">
          <table className="min-w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.12)] bg-nexus-surface/60 text-left text-[10px] uppercase tracking-wider text-nexus-muted">
                <th className="p-3">Date</th>
                <th className="p-3">Command</th>
                <th className="p-3">Scope</th>
                <th className="p-3">Status</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[rgba(0,212,255,0.06)] hover:bg-nexus-cyan/5"
                >
                  <td className="whitespace-nowrap p-3 text-nexus-muted">
                    {new Date(w.created_at).toLocaleString()}
                  </td>
                  <td className="max-w-md truncate p-3 text-nexus-text">{w.command}</td>
                  <td className="p-3 text-nexus-muted">{w.scope}</td>
                  <td className="p-3 text-nexus-warning">{w.status}</td>
                  <td className="p-3 text-nexus-muted">
                    {formatDuration(w.total_duration_ms)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/workflow/${w.id}`}>
                        <Button type="button" variant="ghost" className="!py-1 !text-[10px]">
                          View
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        className="!py-1 !text-[10px]"
                        onClick={() => {
                          void createWorkflow(
                            w.command,
                            w.scope,
                            w.integration_profile ?? undefined
                          ).then((res) => {
                            toast.success("Re-run started");
                            window.location.href = `/workflow/${res.workflow.id}`;
                          }).catch(() => toast.error("Re-run failed"));
                        }}
                      >
                        Re-run
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
