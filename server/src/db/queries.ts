import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  AgentName,
  AgentRunRow,
  IntegrationProfile,
  KnowledgeMemoryRow,
  WorkflowRow,
  WorkflowScope,
  WorkflowStatus,
} from "@nexus/shared";
import { runMigrations } from "./schema";

const DB_PATH = process.env.NEXUS_DB_PATH ?? "./data/nexus.db";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dir = path.dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    runMigrations(dbInstance);
  }
  return dbInstance;
}

function parseIntegrationProfileColumn(
  raw: string | null | undefined
): IntegrationProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as IntegrationProfile;
  } catch {
    return null;
  }
}

type WorkflowDbRow = {
  id: string;
  command: string;
  scope: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  total_duration_ms: number | null;
  integration_profile: string | null;
};

function mapWorkflowRow(r: WorkflowDbRow): WorkflowRow {
  return {
    id: r.id,
    command: r.command,
    scope: r.scope as WorkflowScope,
    status: r.status as WorkflowStatus,
    created_at: r.created_at,
    completed_at: r.completed_at,
    total_duration_ms: r.total_duration_ms,
    integration_profile: parseIntegrationProfileColumn(r.integration_profile),
  };
}

export function createWorkflow(
  command: string,
  scope: WorkflowScope,
  integrationProfile?: IntegrationProfile | null
): WorkflowRow {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const profileJson =
    integrationProfile && Object.keys(integrationProfile).length > 0
      ? JSON.stringify(integrationProfile)
      : null;
  db.prepare(
    `INSERT INTO workflows (id, command, scope, status, created_at, completed_at, total_duration_ms, pause_after_agent, edited_outputs, integration_profile)
     VALUES (?, ?, ?, 'pending', ?, NULL, NULL, NULL, NULL, ?)`
  ).run(id, command, scope, now, profileJson);
  return getWorkflowById(id);
}

export function getWorkflowById(id: string): WorkflowRow {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, command, scope, status, created_at, completed_at, total_duration_ms, integration_profile FROM workflows WHERE id = ?`
    )
    .get(id) as WorkflowDbRow | undefined;
  if (!row) throw new Error("Workflow not found");
  return mapWorkflowRow(row);
}

export function updateWorkflowStatus(id: string, status: WorkflowStatus): void {
  getDb().prepare(`UPDATE workflows SET status = ? WHERE id = ?`).run(status, id);
}

export function setWorkflowCompleted(id: string, durationMs: number): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE workflows SET status = 'completed', completed_at = ?, total_duration_ms = ?, pause_after_agent = NULL WHERE id = ?`
    )
    .run(now, durationMs, id);
}

export function setWorkflowFailed(id: string): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE workflows SET status = 'failed', completed_at = ? WHERE id = ?`
    )
    .run(now, id);
}

export function setWorkflowCancelled(id: string): void {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `UPDATE workflows SET status = 'cancelled', completed_at = ?, pause_after_agent = NULL WHERE id = ?`
    )
    .run(now, id);
}

export function setWorkflowPaused(id: string, afterAgent: AgentName): void {
  getDb()
    .prepare(
      `UPDATE workflows SET status = 'paused', pause_after_agent = ? WHERE id = ?`
    )
    .run(afterAgent, id);
}

export function clearWorkflowPause(id: string): void {
  getDb()
    .prepare(`UPDATE workflows SET pause_after_agent = NULL WHERE id = ?`)
    .run(id);
}

export function getEditedOutputs(workflowId: string): Partial<Record<AgentName, string>> {
  const db = getDb();
  const row = db
    .prepare(`SELECT edited_outputs FROM workflows WHERE id = ?`)
    .get(workflowId) as { edited_outputs: string | null } | undefined;
  if (!row?.edited_outputs) return {};
  try {
    const parsed = JSON.parse(row.edited_outputs) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Partial<Record<AgentName, string>>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function setEditedOutput(
  workflowId: string,
  agent: AgentName,
  output: string
): void {
  const db = getDb();
  const current = getEditedOutputs(workflowId);
  current[agent] = output;
  db.prepare(`UPDATE workflows SET edited_outputs = ? WHERE id = ?`).run(
    JSON.stringify(current),
    workflowId
  );
}

export function listWorkflows(search?: string): WorkflowRow[] {
  const db = getDb();
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    const rows = db
      .prepare(
        `SELECT id, command, scope, status, created_at, completed_at, total_duration_ms, integration_profile FROM workflows WHERE command LIKE ? ORDER BY created_at DESC`
      )
      .all(q) as WorkflowDbRow[];
    return rows.map(mapWorkflowRow);
  }
  const rows = db
    .prepare(
      `SELECT id, command, scope, status, created_at, completed_at, total_duration_ms, integration_profile FROM workflows ORDER BY created_at DESC`
    )
    .all() as WorkflowDbRow[];
  return rows.map(mapWorkflowRow);
}

export function findRunningWorkflowBySignature(
  command: string,
  scope: WorkflowScope
): WorkflowRow | null {
  const row = getDb()
    .prepare(
      `SELECT id, command, scope, status, created_at, completed_at, total_duration_ms, integration_profile
       FROM workflows
       WHERE command = ? AND scope = ? AND status IN ('pending','running','paused')
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .get(command, scope) as WorkflowDbRow | undefined;
  return row ? mapWorkflowRow(row) : null;
}

export function upsertAgentRunStart(
  workflowId: string,
  agent: AgentName,
  runId: string,
  integrationProviderId: string
): void {
  const db = getDb();
  const existing = db
    .prepare(
      `SELECT id FROM agent_runs WHERE workflow_id = ? AND agent_name = ?`
    )
    .get(workflowId, agent) as { id: string } | undefined;
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(
      `UPDATE agent_runs SET status = 'processing', output = '', error_message = NULL, started_at = ?, completed_at = NULL, tokens_used = NULL, integration_provider = ? WHERE id = ?`
    ).run(now, integrationProviderId, existing.id);
  } else {
    db.prepare(
      `INSERT INTO agent_runs (id, workflow_id, agent_name, status, output, tokens_used, started_at, completed_at, error_message, integration_provider)
       VALUES (?, ?, ?, 'processing', '', NULL, ?, NULL, NULL, ?)`
    ).run(runId, workflowId, agent, now, integrationProviderId);
  }
}

export function completeAgentRun(
  workflowId: string,
  agent: AgentName,
  output: string,
  tokensUsed: number
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE agent_runs SET status = 'complete', output = ?, tokens_used = ?, completed_at = ? WHERE workflow_id = ? AND agent_name = ?`
  ).run(output, tokensUsed, now, workflowId, agent);
}

export function failAgentRun(
  workflowId: string,
  agent: AgentName,
  message: string,
  partialOutput: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE agent_runs SET status = 'error', error_message = ?, output = ?, completed_at = ? WHERE workflow_id = ? AND agent_name = ?`
  ).run(message, partialOutput, now, workflowId, agent);
}

export function skipAgentRun(workflowId: string, agent: AgentName): void {
  const db = getDb();
  const now = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT id FROM agent_runs WHERE workflow_id = ? AND agent_name = ?`
    )
    .get(workflowId, agent) as { id: string } | undefined;
  if (row) {
    db.prepare(
      `UPDATE agent_runs SET status = 'skipped', output = '', completed_at = ? WHERE id = ?`
    ).run(now, row.id);
  } else {
    db.prepare(
      `INSERT INTO agent_runs (id, workflow_id, agent_name, status, output, tokens_used, started_at, completed_at, error_message, integration_provider)
       VALUES (?, ?, ?, 'skipped', '', NULL, ?, ?, NULL, NULL)`
    ).run(randomUUID(), workflowId, agent, now, now);
  }
}

export function getAgentRuns(workflowId: string): AgentRunRow[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, workflow_id, agent_name, status, output, tokens_used, started_at, completed_at, error_message, integration_provider FROM agent_runs WHERE workflow_id = ? ORDER BY started_at ASC`
    )
    .all(workflowId) as AgentRunRow[];
}

export function getAgentRun(
  workflowId: string,
  agent: AgentName
): AgentRunRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, workflow_id, agent_name, status, output, tokens_used, started_at, completed_at, error_message, integration_provider FROM agent_runs WHERE workflow_id = ? AND agent_name = ?`
    )
    .get(workflowId, agent) as AgentRunRow | undefined;
  return row ?? null;
}

export function insertKnowledge(
  domain: string,
  key: string,
  value: string,
  workflowId: string
): void {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO knowledge_memory (id, domain, key, value, workflow_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, domain, key, value, workflowId, now);
}

export function listKnowledgeByDomain(): Record<string, KnowledgeMemoryRow[]> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, domain, key, value, workflow_id, created_at FROM knowledge_memory ORDER BY created_at DESC`
    )
    .all() as KnowledgeMemoryRow[];
  const by: Record<string, KnowledgeMemoryRow[]> = {};
  for (const r of rows) {
    by[r.domain] = by[r.domain] ?? [];
    by[r.domain].push(r);
  }
  return by;
}

export function clearKnowledgeDomain(domain: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM knowledge_memory WHERE domain = ?`).run(domain);
}

export function getMetrics(): {
  totalWorkflows: number;
  activeAgents: number;
  avgCompletionMs: number | null;
  successRatePercent: number | null;
} {
  const db = getDb();
  const total = (
    db.prepare(`SELECT COUNT(*) as c FROM workflows`).get() as { c: number }
  ).c;
  const completed = (
    db
      .prepare(`SELECT COUNT(*) as c FROM workflows WHERE status = 'completed'`)
      .get() as { c: number }
  ).c;
  const failed = (
    db
      .prepare(`SELECT COUNT(*) as c FROM workflows WHERE status = 'failed'`)
      .get() as { c: number }
  ).c;
  const running = (
    db
      .prepare(`SELECT COUNT(*) as c FROM workflows WHERE status = 'running'`)
      .get() as { c: number }
  ).c;
  const activeAgents = running > 0
    ? (
        db
          .prepare(
            `SELECT COUNT(*) as c FROM agent_runs WHERE status = 'processing'`
          )
          .get() as { c: number }
      ).c
    : 0;
  const avgRow = db
    .prepare(
      `SELECT AVG(total_duration_ms) as a FROM workflows WHERE total_duration_ms IS NOT NULL AND status = 'completed'`
    )
    .get() as { a: number | null };
  const terminal = completed + failed;
  const successRate =
    terminal > 0 ? Math.round((completed / terminal) * 1000) / 10 : null;
  return {
    totalWorkflows: total,
    activeAgents,
    avgCompletionMs: avgRow.a !== null ? Math.round(avgRow.a) : null,
    successRatePercent: successRate,
  };
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM app_settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value);
}

export function initDefaultSettings(): void {
  if (getSetting("require_approval") === null) {
    setSetting("require_approval", "false");
  }
  if (getSetting("notifications_enabled") === null) {
    setSetting("notifications_enabled", "true");
  }
}

/** For tests / admin */
export function _resetDbConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
