import type { AgentName } from "@nexus/shared";
import { getSetting } from "../db/queries";
import type { NativeSyncWebhookPayload } from "../integrations/native/sync";

export async function emitAgentCompletedWebhook(payload: {
  event: "agent:complete";
  workflowId: string;
  agent: AgentName;
  integrationProviderId: string;
  outputPreview: string;
  tokensUsed: number;
  nativeSync?: NativeSyncWebhookPayload | null;
}): Promise<void> {
  const url = getSetting("agent_webhook_url");
  if (!url || url.length === 0) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        source: "nexus",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    /* non-fatal */
  }
}
