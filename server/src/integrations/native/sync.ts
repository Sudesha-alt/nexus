import type { AgentName } from "@nexus/shared";
import { getSetting, getWorkflowById } from "../../db/queries";
import { getProvider } from "../registry";

export type NativeSyncWebhookPayload =
  | { ok: true; summary: string; url?: string }
  | { ok: false; error: string };

function settingOrEnv(settingKey: string, envKey: string): string {
  const s = getSetting(settingKey);
  if (s && s.length > 0) return s.trim();
  const e = process.env[envKey];
  return e?.trim() ?? "";
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 24)}\n…[truncated]`;
}

function linearConfigured(): boolean {
  return !!(
    settingOrEnv("linear_api_key", "LINEAR_API_KEY") &&
    settingOrEnv("linear_team_id", "LINEAR_TEAM_ID")
  );
}

function figmaConfigured(): boolean {
  return !!(
    settingOrEnv("figma_access_token", "FIGMA_ACCESS_TOKEN") &&
    settingOrEnv("figma_file_key", "FIGMA_FILE_KEY")
  );
}

function githubConfigured(): boolean {
  return !!(
    settingOrEnv("github_token", "GITHUB_TOKEN") &&
    settingOrEnv("github_repo", "GITHUB_REPO")
  );
}

function hubspotConfigured(): boolean {
  return !!settingOrEnv("hubspot_access_token", "HUBSPOT_ACCESS_TOKEN");
}

async function syncLinearIssue(
  title: string,
  description: string,
  workflowId: string
): Promise<NativeSyncWebhookPayload> {
  const apiKey = settingOrEnv("linear_api_key", "LINEAR_API_KEY");
  const teamId = settingOrEnv("linear_team_id", "LINEAR_TEAM_ID");

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query: `mutation ($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier url }
        }
      }`,
      variables: {
        input: {
          teamId,
          title: truncate(title, 255),
          description: `${description}\n\n— NEXUS workflow \`${workflowId}\``,
        },
      },
    }),
  });

  const json = (await res.json()) as {
    errors?: { message: string }[];
    data?: {
      issueCreate?: {
        success?: boolean;
        issue?: { identifier?: string; url?: string };
      };
    };
  };

  if (!res.ok) {
    return { ok: false, error: `Linear HTTP ${res.status}` };
  }
  if (json.errors?.length) {
    return { ok: false, error: json.errors.map((e) => e.message).join("; ") };
  }
  const issue = json.data?.issueCreate?.issue;
  if (!json.data?.issueCreate?.success || !issue?.url) {
    return { ok: false, error: "Linear issueCreate returned no issue URL" };
  }
  return {
    ok: true,
    summary: `Linear issue ${issue.identifier ?? ""}`.trim(),
    url: issue.url,
  };
}

async function syncFigmaComment(
  message: string,
  workflowId: string
): Promise<NativeSyncWebhookPayload> {
  const token = settingOrEnv("figma_access_token", "FIGMA_ACCESS_TOKEN");
  const fileKey = settingOrEnv("figma_file_key", "FIGMA_FILE_KEY");

  const body = `${truncate(message, 9500)}\n\n— NEXUS workflow \`${workflowId}\``;
  const res = await fetch(
    `https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Figma-Token": token,
      },
      body: JSON.stringify({ message: body }),
    }
  );

  const json = (await res.json()) as { err?: string; id?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: json.err ?? `Figma HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    summary: "Figma file comment created",
    url: `https://www.figma.com/file/${fileKey}`,
  };
}

async function syncGithubIssue(
  title: string,
  body: string,
  workflowId: string
): Promise<NativeSyncWebhookPayload> {
  const token = settingOrEnv("github_token", "GITHUB_TOKEN");
  const repo = settingOrEnv("github_repo", "GITHUB_REPO");

  const [owner, name] = repo.split("/").map((s) => s.trim());
  if (!owner || !name) {
    return { ok: false, error: "github_repo must be owner/repo" };
  }

  const issueBody = `${body}\n\n— NEXUS workflow \`${workflowId}\``;
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/issues`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: truncate(title, 240),
        body: truncate(issueBody, 60000),
      }),
    }
  );

  const json = (await res.json()) as {
    message?: string;
    html_url?: string;
    number?: number;
  };
  if (!res.ok) {
    return {
      ok: false,
      error: json.message ?? `GitHub HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    summary: `GitHub issue #${json.number ?? "?"}`,
    url: json.html_url,
  };
}

async function syncHubspotNote(
  title: string,
  body: string,
  workflowId: string
): Promise<NativeSyncWebhookPayload> {
  const token = settingOrEnv("hubspot_access_token", "HUBSPOT_ACCESS_TOKEN");

  const noteBody = `${title}\n\n${body}\n\n— NEXUS workflow \`${workflowId}\``;
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        hs_note_body: truncate(noteBody, 65000),
        hs_timestamp: String(Date.now()),
      },
    }),
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: json.message ?? `HubSpot HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    summary: `HubSpot note ${json.id ?? "created"}`,
    url: undefined,
  };
}

async function syncHubspotTask(
  subject: string,
  body: string,
  workflowId: string
): Promise<NativeSyncWebhookPayload> {
  const token = settingOrEnv("hubspot_access_token", "HUBSPOT_ACCESS_TOKEN");

  const taskBody = `${body}\n\n— NEXUS workflow \`${workflowId}\``;
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        hs_task_subject: truncate(subject, 500),
        hs_task_body: truncate(taskBody, 65000),
        hs_task_status: "NOT_STARTED",
        hs_timestamp: String(Date.now()),
      },
    }),
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    return {
      ok: false,
      error: json.message ?? `HubSpot HTTP ${res.status}`,
    };
  }
  return {
    ok: true,
    summary: `HubSpot task ${json.id ?? "created"}`,
    url: undefined,
  };
}

/**
 * When the selected provider has `hasNativeApi`, push stage output to the vendor if credentials exist.
 * Failures are non-fatal for the workflow (output is already persisted).
 */
export async function runNativeSyncAfterAgent(params: {
  agent: AgentName;
  providerId: string;
  workflowId: string;
  outputText: string;
}): Promise<NativeSyncWebhookPayload | null> {
  const p = getProvider(params.agent, params.providerId);
  if (!p?.hasNativeApi) return null;

  const command = getWorkflowById(params.workflowId).command;
  const titleBase = `NEXUS · ${params.agent} · ${truncate(command, 80)}`;
  const body = truncate(params.outputText, 12000);

  try {
    switch (params.agent) {
      case "product":
        if (params.providerId !== "linear_ai") return null;
        if (!linearConfigured()) return null;
        return await syncLinearIssue(titleBase, body, params.workflowId);
      case "design":
        if (params.providerId !== "figma_ai") return null;
        if (!figmaConfigured()) return null;
        return await syncFigmaComment(body, params.workflowId);
      case "engineering":
        if (params.providerId !== "copilot") return null;
        if (!githubConfigured()) return null;
        return await syncGithubIssue(
          `[Engineering] ${titleBase}`,
          body,
          params.workflowId
        );
      case "qa":
        if (params.providerId !== "github_issues") return null;
        if (!githubConfigured()) return null;
        return await syncGithubIssue(`[QA] ${titleBase}`, body, params.workflowId);
      case "marketing":
        if (params.providerId !== "hubspot_breeze") return null;
        if (!hubspotConfigured()) return null;
        return await syncHubspotNote(
          `Marketing — ${titleBase}`,
          body,
          params.workflowId
        );
      case "sales":
        if (params.providerId !== "hubspot_crm") return null;
        if (!hubspotConfigured()) return null;
        return await syncHubspotTask(
          `Sales — ${titleBase}`,
          body,
          params.workflowId
        );
      default:
        return null;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
