import type {
  AgentName,
  AgentRunRow,
  IntegrationProfile,
  IntegrationProviderDTO,
  OrchestrationConnectorDTO,
  WorkflowMetrics,
  WorkflowRow,
  WorkflowScope,
} from "@nexus/shared";

const jsonHeaders = { "Content-Type": "application/json" };

export async function createWorkflow(
  command: string,
  scope: WorkflowScope,
  integrationProfile?: IntegrationProfile
): Promise<{ workflow: WorkflowRow }> {
  const body: Record<string, unknown> = { command, scope };
  if (integrationProfile && Object.keys(integrationProfile).length > 0) {
    body.integrationProfile = integrationProfile;
  }
  const res = await fetch("/api/workflows", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create workflow");
  return (await res.json()) as { workflow: WorkflowRow };
}

export async function fetchIntegrationCatalog(): Promise<{
  byAgent: Record<string, IntegrationProviderDTO[]>;
  orchestration: OrchestrationConnectorDTO[];
  defaultProviderIds: Record<string, string>;
}> {
  const res = await fetch("/api/integrations/providers");
  if (!res.ok) throw new Error("Failed to load integrations");
  return (await res.json()) as {
    byAgent: Record<string, IntegrationProviderDTO[]>;
    orchestration: OrchestrationConnectorDTO[];
    defaultProviderIds: Record<string, string>;
  };
}

export async function fetchWorkflowDetail(id: string): Promise<{
  workflow: WorkflowRow;
  pauseAfterAgent: string | null;
  agents: AgentRunRow[];
  editedOutputs: Partial<Record<AgentName, string>>;
}> {
  const res = await fetch(`/api/workflows/${id}`);
  if (!res.ok) throw new Error("Not found");
  return (await res.json()) as {
    workflow: WorkflowRow;
    pauseAfterAgent: string | null;
    agents: AgentRunRow[];
    editedOutputs: Partial<Record<AgentName, string>>;
  };
}

export async function fetchMetrics(): Promise<WorkflowMetrics> {
  const res = await fetch("/api/workflows/metrics");
  if (!res.ok) throw new Error("Metrics failed");
  const data = (await res.json()) as WorkflowMetrics;
  return data;
}

export async function fetchHistory(params?: {
  q?: string;
  status?: string;
}): Promise<{ workflows: WorkflowRow[] }> {
  const u = new URL("/api/history", window.location.origin);
  if (params?.q) u.searchParams.set("q", params.q);
  if (params?.status) u.searchParams.set("status", params.status);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error("History failed");
  return (await res.json()) as { workflows: WorkflowRow[] };
}

export async function resumeWorkflow(id: string): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/resume`, { method: "POST" });
  if (!res.ok) throw new Error("Resume failed");
}

export async function cancelWorkflow(id: string): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error("Cancel failed");
}

export async function retryAgent(id: string, agent: AgentName): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/agents/${agent}/retry`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Retry failed");
}

export async function skipAgent(id: string, agent: AgentName): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/agents/${agent}/skip`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Skip failed");
}

export async function patchAgentOutput(
  id: string,
  agent: AgentName,
  output: string
): Promise<void> {
  const res = await fetch(`/api/workflows/${id}/agents/${agent}/output`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ output }),
  });
  if (!res.ok) throw new Error("Save failed");
}

export async function fetchKnowledge(): Promise<{
  byDomain: Record<
    string,
    { id: string; domain: string; key: string; value: string; workflow_id: string; created_at: string }[]
  >;
}> {
  const res = await fetch("/api/knowledge");
  if (!res.ok) throw new Error("Knowledge failed");
  return (await res.json()) as {
    byDomain: Record<
      string,
      {
        id: string;
        domain: string;
        key: string;
        value: string;
        workflow_id: string;
        created_at: string;
      }[]
    >;
  };
}

export async function clearKnowledgeDomain(domain: string): Promise<void> {
  const res = await fetch(
    `/api/knowledge/${encodeURIComponent(domain)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Clear failed");
}

export type SettingsResponse = {
  requireApproval: boolean;
  notificationsEnabled: boolean;
  anthropicApiKeySet: boolean;
  agentWebhookUrlSet: boolean;
  nativeIntegrations: {
    linear: boolean;
    figma: boolean;
    github: boolean;
    hubspot: boolean;
  };
  nativeIntegrationHints: {
    linearTeamId: string;
    figmaFileKey: string;
    githubRepo: string;
  };
};

export async function fetchSettings(): Promise<SettingsResponse> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Settings failed");
  return (await res.json()) as SettingsResponse;
}

export async function updateSettings(body: {
  requireApproval?: boolean;
  notificationsEnabled?: boolean;
  anthropicApiKey?: string;
  agentWebhookUrl?: string;
  linearApiKey?: string;
  linearTeamId?: string;
  figmaAccessToken?: string;
  figmaFileKey?: string;
  githubToken?: string;
  githubRepo?: string;
  hubspotAccessToken?: string;
}): Promise<SettingsResponse> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Update failed");
  return (await res.json()) as SettingsResponse;
}
