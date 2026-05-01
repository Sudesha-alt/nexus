import type { AgentName } from "@nexus/shared";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Pencil, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { DepartmentTasksPanel } from "../components/departments/DepartmentTasksPanel";
import { IsoWorkspaceNav } from "../components/departments/IsoWorkspaceNav";
import { PipelineMini } from "../components/departments/PipelineMini";
import { SuitePlanDiagram } from "../components/departments/SuitePlanDiagram";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import {
  type DepartmentArtifact,
  DEPARTMENT_TAGLINES,
  INTEGRATION_TOGGLES,
  isAgentName,
  MOCK_ARTIFACTS_BY_DEPT,
} from "../data/departmentRoomMock";
import { ISO_DEPT_COLOR, ISO_DEPT_FILL } from "../data/isometricFloor";
import { OFFICE_SUITE } from "../data/officeTheme";
import { AGENT_META } from "../lib/agents";
import "../styles/isometric-floor.css";

function badgeTone(
  s: DepartmentArtifact["status"]
): "complete" | "pending" | "error" {
  if (s === "done") return "complete";
  if (s === "failed") return "error";
  return "pending";
}

function cloneArtifacts(agent: AgentName): DepartmentArtifact[] {
  return MOCK_ARTIFACTS_BY_DEPT[agent].map((a) => ({ ...a }));
}

export function DepartmentRoom() {
  const { departmentId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emptyDemo = searchParams.get("empty") === "1";

  const dept = isAgentName(departmentId) ? departmentId : null;

  const [loadError, setLoadError] = useState(false);
  const [artifacts, setArtifacts] = useState<DepartmentArtifact[]>([]);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const t of INTEGRATION_TOGGLES) o[t.id] = t.defaultOn;
    return o;
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const detailTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!dept) return;
    if (loadError) return;
    if (emptyDemo) {
      setArtifacts([]);
      return;
    }
    setArtifacts(cloneArtifacts(dept));
  }, [dept, emptyDemo, loadError]);

  const meta = dept ? AGENT_META[dept] : null;
  const Icon = meta?.icon;
  const suite = dept ? OFFICE_SUITE[dept] : null;
  const detailArtifact = useMemo(
    () => artifacts.find((a) => a.id === detailId) ?? null,
    [artifacts, detailId]
  );

  const openDetail = useCallback(
    (id: string) => {
      setDetailId(id);
      const fromState = artifacts.find((x) => x.id === id);
      const fromMock = dept ? MOCK_ARTIFACTS_BY_DEPT[dept].find((x) => x.id === id) : undefined;
      setDraftBody(fromState?.fullContent ?? fromMock?.fullContent ?? "");
    },
    [artifacts, dept]
  );

  useEffect(() => {
    if (!detailId) return;
    const t = window.setTimeout(() => detailTextareaRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [detailId]);

  useEffect(() => {
    if (!detailId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailId]);

  useEffect(() => {
    if (!dept) navigate("/departments", { replace: true });
  }, [dept, navigate]);

  if (!dept || !meta || !Icon || !suite) {
    return null;
  }

  function updateArtifact(id: string, patch: Partial<DepartmentArtifact>) {
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function onApprove(id: string) {
    updateArtifact(id, { status: "done", timestamp: "Just now" });
    toast.success("Approved (demo)");
    if (detailId === id) setDetailId(null);
  }

  function onReject(id: string) {
    updateArtifact(id, { status: "failed", timestamp: "Just now" });
    toast.error("Rejected (demo)");
    if (detailId === id) setDetailId(null);
  }

  function onRetry(id: string) {
    updateArtifact(id, { status: "pending", timestamp: "Retrying…" });
    toast("Retrying…", { icon: "↻" });
    window.setTimeout(() => {
      setArtifacts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "done" as const,
                timestamp: "Just now",
                summary: `${a.summary.replace(/\s*\(re-run\)$/, "")} (re-run)`,
              }
            : a
        )
      );
      toast.success("Completed (demo)");
    }, 900);
  }

  function onSaveEdit() {
    if (!detailArtifact) return;
    const lines = draftBody.trim().split("\n");
    const summary =
      lines[0]?.replace(/^#+\s*/, "").slice(0, 120) || detailArtifact.summary;
    updateArtifact(detailArtifact.id, {
      fullContent: draftBody,
      summary,
      timestamp: "Just now",
    });
    toast.success("Saved edits (demo)");
    setDetailId(null);
  }

  function resetRoom() {
    setLoadError(false);
    if (emptyDemo) setArtifacts([]);
    else if (dept) setArtifacts(cloneArtifacts(dept));
    toast.success("Reset");
  }

  return (
    <motion.div
      className="iso-page iso-page-dots"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
    >
      <IsoWorkspaceNav active="none" suiteHint={`${suite.suite} · ${meta.dept}`} />

      <nav aria-label="Breadcrumb" className="iso-breadcrumb mb-4">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <button type="button" onClick={() => navigate("/")}>
              Command
            </button>
          </li>
          <li aria-hidden className="text-slate-400">
            /
          </li>
          <li>
            <button type="button" onClick={() => navigate("/departments")}>
              Floor map
            </button>
          </li>
          <li aria-hidden className="text-slate-400">
            /
          </li>
          <li className="font-semibold text-slate-800">{meta.dept}</li>
        </ol>
      </nav>

      {emptyDemo ? (
        <div className="mb-4 inline-block rounded border border-amber-500/40 bg-amber-50 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-900">
          Empty state demo (?empty=1)
        </div>
      ) : null}

      <div
        className="iso-suite-hero relative mb-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderLeftWidth: 6,
          borderLeftColor: ISO_DEPT_COLOR[dept],
          background: `linear-gradient(105deg, ${ISO_DEPT_FILL[dept]} 0%, #ffffff 58%, #f8fafc 100%)`,
        }}
      >
        <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#0f172a] bg-white shadow-[4px_4px_0_#0f172a]"
            style={{ color: ISO_DEPT_COLOR[dept] }}
          >
            <Icon className="h-8 w-8" aria-hidden />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {suite.suite} · zoomed suite
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {meta.dept}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              {DEPARTMENT_TAGLINES[dept]}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/departments")}
          className="shrink-0 self-start rounded-md border-2 border-[#0f172a] bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-0.5 sm:self-center"
        >
          ← Back to floor
        </button>
      </div>

      {loadError ? (
        <div className="iso-card mb-6 border-red-400 bg-red-50">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="h-8 w-8 shrink-0 text-red-600" />
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-red-900">
                  Load fault (demo)
                </h2>
                <p className="mt-1 text-sm text-red-800/90">Retry restores mock data.</p>
              </div>
            </div>
            <Button type="button" onClick={resetRoom}>
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {!loadError ? (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            <DepartmentTasksPanel dept={dept} />
            <div>
              <p className="iso-section-kicker">Zone A — output surface</p>
              {artifacts.length === 0 ? (
                <div className="iso-card border-dashed border-slate-400 bg-slate-50/80 p-6">
                  <p className="text-sm text-slate-600">
                    Nothing on the desk yet. Run a mission from Command, or remove{" "}
                    <code className="rounded bg-white px-1 text-xs">?empty=1</code> for demo cards.
                  </p>
                </div>
              ) : (
                <ul className="grid min-w-0 gap-4 sm:grid-cols-2">
                  {artifacts.map((a) => (
                    <li key={a.id}>
                      <div
                        className="iso-card iso-artifact-card overflow-hidden"
                        data-selected={detailId === a.id ? "true" : "false"}
                        style={{ borderLeftWidth: 4, borderLeftColor: ISO_DEPT_COLOR[dept] }}
                      >
                        <button
                          type="button"
                          className="w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
                          onClick={() => openDetail(a.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openDetail(a.id);
                            }
                          }}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge tone={badgeTone(a.status)}>{a.status}</Badge>
                            <span className="font-mono text-[10px] text-slate-500">{a.timestamp}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{a.summary}</p>
                          <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                            {(() => {
                              const flat = a.fullContent.replace(/\n/g, " ").trim();
                              return flat.length > 140 ? `${flat.slice(0, 140)}…` : flat;
                            })()}
                          </p>
                        </button>
                        <div className="flex flex-wrap gap-2 border-t-2 border-slate-100 bg-slate-50/90 px-3 py-2">
                          {a.status === "pending" ? (
                            <Button
                              type="button"
                              className="!px-3 !py-1.5 text-xs"
                              onClick={() => onApprove(a.id)}
                              aria-label={`Approve ${a.summary}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onReject(a.id)}
                            aria-label={`Reject ${a.summary}`}
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => openDetail(a.id)}
                            aria-label={`Edit ${a.summary}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onRetry(a.id)}
                            aria-label={`Retry ${a.summary}`}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside
            className="flex w-full min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:w-[300px] lg:shrink-0"
            aria-label="Suite diagram and service core"
          >
            <div>
              <p className="iso-section-kicker">Suite key</p>
              <div className="aspect-[440/300] w-full max-w-full overflow-hidden">
                <SuitePlanDiagram dept={dept} />
              </div>
            </div>
            <div className="iso-card">
              <div className="iso-card-head">Workflow spine</div>
              <div className="p-3">
                <PipelineMini current={dept} variant="iso" />
              </div>
            </div>
            <div className="iso-card" aria-label="Integrations">
              <div className="iso-card-head">Zone B — integrations</div>
              <div className="p-3">
                <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
                  Local toggles for the demo session only.
                </p>
                <ul className="space-y-3">
                  {INTEGRATION_TOGGLES.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{t.label}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{t.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={integrations[t.id]}
                        onClick={() =>
                          setIntegrations((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                        }
                        className={`relative h-7 w-11 shrink-0 rounded-full border-2 transition ${
                          integrations[t.id]
                            ? "border-sky-600 bg-sky-500/20"
                            : "border-slate-300 bg-slate-100"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                            integrations[t.id] ? "left-5" : "left-0.5"
                          }`}
                        />
                        <span className="sr-only">Toggle {t.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 w-full rounded border-2 border-dashed border-slate-300 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:border-red-400 hover:text-red-700"
                  onClick={() => {
                    setLoadError(true);
                    toast.error("Simulated failure");
                  }}
                >
                  Demo: simulate error
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <Modal
        open={detailId !== null && detailArtifact !== null}
        title={detailArtifact?.summary ?? "Artifact"}
        onClose={() => setDetailId(null)}
        surface="iso"
      >
        {detailArtifact ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={badgeTone(detailArtifact.status)}>{detailArtifact.status}</Badge>
              <span className="font-mono text-[10px] text-slate-500">{detailArtifact.timestamp}</span>
            </div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600" htmlFor="artifact-body">
              Body
            </label>
            <textarea
              ref={detailTextareaRef}
              id="artifact-body"
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={14}
              className="w-full rounded-md border-2 border-slate-200 bg-slate-50/50 p-3 font-mono text-sm text-slate-900 outline-none focus:border-sky-500"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={onSaveEdit}>
                Save
              </Button>
              {detailArtifact.status === "pending" ? (
                <Button type="button" onClick={() => onApprove(detailArtifact.id)}>
                  Approve
                </Button>
              ) : null}
              <Button type="button" variant="danger" onClick={() => onReject(detailArtifact.id)}>
                Reject
              </Button>
              <Button type="button" variant="ghost" onClick={() => onRetry(detailArtifact.id)}>
                Retry
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDetailId(null)}>
                Close
              </Button>
            </div>
            <p className="text-[10px] text-slate-500">
              <kbd className="rounded border border-slate-300 bg-white px-1">Esc</kbd> to close
            </p>
          </div>
        ) : null}
      </Modal>
    </motion.div>
  );
}
