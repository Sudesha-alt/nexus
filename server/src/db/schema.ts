import type Database from "better-sqlite3";

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      command TEXT NOT NULL,
      scope TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      total_duration_ms INTEGER,
      pause_after_agent TEXT,
      edited_outputs TEXT,
      integration_profile TEXT
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      status TEXT NOT NULL,
      output TEXT,
      tokens_used INTEGER,
      started_at TEXT,
      completed_at TEXT,
      error_message TEXT,
      integration_provider TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id)
    );

    CREATE TABLE IF NOT EXISTS knowledge_memory (
      id TEXT PRIMARY KEY,
      domain TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      workflow_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_agent_runs_workflow ON agent_runs(workflow_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_workflow ON knowledge_memory(workflow_id);
  `);

  const cols = db
    .prepare(`PRAGMA table_info(workflows)`)
    .all() as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("pause_after_agent")) {
    db.exec(`ALTER TABLE workflows ADD COLUMN pause_after_agent TEXT`);
  }
  if (!names.has("edited_outputs")) {
    db.exec(`ALTER TABLE workflows ADD COLUMN edited_outputs TEXT`);
  }
  if (!names.has("integration_profile")) {
    db.exec(`ALTER TABLE workflows ADD COLUMN integration_profile TEXT`);
  }

  const arCols = db
    .prepare(`PRAGMA table_info(agent_runs)`)
    .all() as { name: string }[];
  const arNames = new Set(arCols.map((c) => c.name));
  if (!arNames.has("integration_provider")) {
    db.exec(`ALTER TABLE agent_runs ADD COLUMN integration_provider TEXT`);
  }
}
