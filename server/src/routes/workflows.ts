import { Router } from "express";
import { z } from "zod";
import type { AgentName, IntegrationProfile, WorkflowScope } from "@nexus/shared";
import {
  cancelWorkflowExecution,
  executeWorkflow,
  findExistingActiveWorkflow,
  resumeWorkflowExecution,
  retryFromAgent,
} from "../agents/orchestrator";
import {
  createWorkflow,
  getEditedOutputs,
  getAgentRuns,
  getMetrics,
  getWorkflowById,
  listWorkflows,
  setEditedOutput,
  skipAgentRun,
  getDb,
} from "../db/queries";

const CreateBody = z.object({
  command: z.string().min(1),
  scope: z.enum(["product", "marketing", "sales", "all"]),
  integrationProfile: z.record(z.string(), z.string()).optional(),
});

const router = Router();

router.post("/", (req, res) => {
  const parsed = CreateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const { command, scope, integrationProfile } = parsed.data;
  const profile =
    integrationProfile !== undefined
      ? (integrationProfile as IntegrationProfile)
      : undefined;
  const existingId = findExistingActiveWorkflow(command, scope as WorkflowScope);
  if (existingId) {
    const existing = getWorkflowById(existingId);
    res.status(200).json({ workflow: existing, deduped: true });
    return;
  }
  const wf = createWorkflow(command, scope as WorkflowScope, profile);
  void executeWorkflow(wf.id);
  res.status(201).json({ workflow: wf });
});

router.get("/metrics", (_req, res) => {
  res.json(getMetrics());
});

router.get("/", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const rows = listWorkflows(q);
  res.json({ workflows: rows });
});

router.get("/:id", (req, res) => {
  try {
    const wf = getWorkflowById(req.params.id);
    const db = getDb();
    const full = db
      .prepare(
        `SELECT pause_after_agent FROM workflows WHERE id = ?`
      )
      .get(req.params.id) as { pause_after_agent: string | null };
    const agents = getAgentRuns(req.params.id);
    const editedOutputs = getEditedOutputs(req.params.id);
    res.json({
      workflow: wf,
      pauseAfterAgent: full?.pause_after_agent ?? null,
      agents,
      editedOutputs,
    });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.post("/:id/resume", (req, res) => {
  try {
    getWorkflowById(req.params.id);
    resumeWorkflowExecution(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.post("/:id/cancel", (req, res) => {
  try {
    getWorkflowById(req.params.id);
    cancelWorkflowExecution(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

const AgentParam = z.enum([
  "product",
  "design",
  "engineering",
  "qa",
  "marketing",
  "sales",
]);

router.post("/:id/agents/:agent/retry", (req, res) => {
  const agentParsed = AgentParam.safeParse(req.params.agent);
  if (!agentParsed.success) {
    res.status(400).json({ error: "Invalid agent" });
    return;
  }
  try {
    getWorkflowById(req.params.id);
    void retryFromAgent(req.params.id, agentParsed.data as AgentName).catch(
      () => {
        /* orchestrator emits errors */
      }
    );
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.post("/:id/agents/:agent/skip", (req, res) => {
  const agentParsed = AgentParam.safeParse(req.params.agent);
  if (!agentParsed.success) {
    res.status(400).json({ error: "Invalid agent" });
    return;
  }
  try {
    getWorkflowById(req.params.id);
    skipAgentRun(req.params.id, agentParsed.data as AgentName);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.patch("/:id/agents/:agent/output", (req, res) => {
  const agentParsed = AgentParam.safeParse(req.params.agent);
  if (!agentParsed.success) {
    res.status(400).json({ error: "Invalid agent" });
    return;
  }
  const body = z.object({ output: z.string() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  try {
    getWorkflowById(req.params.id);
    setEditedOutput(req.params.id, agentParsed.data as AgentName, body.data.output);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
