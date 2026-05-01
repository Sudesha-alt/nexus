export type WorkflowScope = "product" | "marketing" | "sales" | "all";

export type WorkflowStatus =
  | "pending"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentName =
  | "product"
  | "design"
  | "engineering"
  | "qa"
  | "marketing"
  | "sales";

/** Selected third-party methodology per pipeline segment (provider id from NEXUS registry). */
export type IntegrationProfile = Partial<Record<AgentName, string>>;

export type IntegrationMode = "nexus_claude_augmented" | "docs_reference_only";

export interface IntegrationProviderDTO {
  id: string;
  agent: AgentName;
  name: string;
  vendor: string;
  documentationUrl: string;
  mode: IntegrationMode;
  hasNativeApi: boolean;
}

export interface OrchestrationConnectorDTO {
  id: string;
  name: string;
  documentationUrl: string;
  note: string;
}

export type AgentRunStatus =
  | "idle"
  | "pending"
  | "processing"
  | "complete"
  | "error"
  | "skipped";

export interface WorkflowRow {
  id: string;
  command: string;
  scope: WorkflowScope;
  status: WorkflowStatus;
  created_at: string;
  completed_at: string | null;
  total_duration_ms: number | null;
  integration_profile: IntegrationProfile | null;
}

export interface AgentRunRow {
  id: string;
  workflow_id: string;
  agent_name: AgentName;
  status: AgentRunStatus;
  output: string | null;
  tokens_used: number | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  integration_provider: string | null;
}

export interface KnowledgeMemoryRow {
  id: string;
  domain: string;
  key: string;
  value: string;
  workflow_id: string;
  created_at: string;
}

export interface CreateWorkflowBody {
  command: string;
  scope: WorkflowScope;
  integrationProfile?: IntegrationProfile;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeAgents: number;
  avgCompletionMs: number | null;
  successRatePercent: number | null;
}

export interface SocketAgentStartPayload {
  workflowId: string;
  agent: AgentName;
}

export interface SocketAgentTokenPayload {
  workflowId: string;
  agent: AgentName;
  token: string;
}

export interface SocketAgentCompletePayload {
  workflowId: string;
  agent: AgentName;
  output: string;
  tokensUsed: number;
}

export interface SocketAgentErrorPayload {
  workflowId: string;
  agent: AgentName;
  message: string;
}

export interface SocketWorkflowStatusPayload {
  workflowId: string;
  status: WorkflowStatus;
}

export interface SocketWorkflowPausedPayload {
  workflowId: string;
  afterAgent: AgentName;
  message: string;
}

export interface NativeIntegrationStatus {
  linear: boolean;
  figma: boolean;
  github: boolean;
  hubspot: boolean;
}

export interface SettingsPayload {
  requireApproval: boolean;
  anthropicApiKeySet: boolean;
  notificationsEnabled: boolean;
  agentWebhookUrlSet?: boolean;
  nativeIntegrations?: NativeIntegrationStatus;
}
