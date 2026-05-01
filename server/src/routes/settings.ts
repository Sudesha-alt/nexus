import { Router } from "express";
import { z } from "zod";
import { getSetting, setSetting, initDefaultSettings } from "../db/queries";

const router = Router();

function nativeIntegrationFlags() {
  const linear =
    Boolean(getSetting("linear_api_key")?.length) &&
    Boolean(getSetting("linear_team_id")?.length);
  const figma =
    Boolean(getSetting("figma_access_token")?.length) &&
    Boolean(getSetting("figma_file_key")?.length);
  const github =
    Boolean(getSetting("github_token")?.length) &&
    Boolean(getSetting("github_repo")?.length);
  const hubspot = Boolean(getSetting("hubspot_access_token")?.length);
  return { linear, figma, github, hubspot };
}

function settingsResponse() {
  const requireApproval = getSetting("require_approval") === "true";
  const notificationsEnabled = getSetting("notifications_enabled") === "true";
  const key = getSetting("anthropic_api_key");
  const agentWebhookUrl = getSetting("agent_webhook_url");
  return {
    requireApproval,
    notificationsEnabled,
    anthropicApiKeySet: Boolean(key && key.length > 0),
    agentWebhookUrlSet: Boolean(agentWebhookUrl && agentWebhookUrl.length > 0),
    nativeIntegrations: nativeIntegrationFlags(),
    nativeIntegrationHints: {
      linearTeamId: getSetting("linear_team_id") ?? "",
      figmaFileKey: getSetting("figma_file_key") ?? "",
      githubRepo: getSetting("github_repo") ?? "",
    },
  };
}

router.get("/", (_req, res) => {
  initDefaultSettings();
  res.json(settingsResponse());
});

const PutBody = z.object({
  requireApproval: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  anthropicApiKey: z.string().optional(),
  agentWebhookUrl: z.string().optional(),
  linearApiKey: z.string().optional(),
  linearTeamId: z.string().optional(),
  figmaAccessToken: z.string().optional(),
  figmaFileKey: z.string().optional(),
  githubToken: z.string().optional(),
  githubRepo: z.string().optional(),
  hubspotAccessToken: z.string().optional(),
});

router.put("/", (req, res) => {
  initDefaultSettings();
  const parsed = PutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const b = parsed.data;
  if (b.requireApproval !== undefined) {
    setSetting("require_approval", b.requireApproval ? "true" : "false");
  }
  if (b.notificationsEnabled !== undefined) {
    setSetting(
      "notifications_enabled",
      b.notificationsEnabled ? "true" : "false"
    );
  }
  if (b.anthropicApiKey !== undefined) {
    setSetting("anthropic_api_key", b.anthropicApiKey);
  }
  if (b.agentWebhookUrl !== undefined) {
    const u = b.agentWebhookUrl.trim();
    setSetting("agent_webhook_url", u);
  }
  if (b.linearApiKey !== undefined) {
    setSetting("linear_api_key", b.linearApiKey.trim());
  }
  if (b.linearTeamId !== undefined) {
    setSetting("linear_team_id", b.linearTeamId.trim());
  }
  if (b.figmaAccessToken !== undefined) {
    setSetting("figma_access_token", b.figmaAccessToken.trim());
  }
  if (b.figmaFileKey !== undefined) {
    setSetting("figma_file_key", b.figmaFileKey.trim());
  }
  if (b.githubToken !== undefined) {
    setSetting("github_token", b.githubToken.trim());
  }
  if (b.githubRepo !== undefined) {
    setSetting("github_repo", b.githubRepo.trim());
  }
  if (b.hubspotAccessToken !== undefined) {
    setSetting("hubspot_access_token", b.hubspotAccessToken.trim());
  }
  res.json(settingsResponse());
});

export default router;
