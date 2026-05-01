import { randomUUID } from "crypto";
import { EventEmitter } from "node:events";
import type { AgentName, WorkflowScope } from "@nexus/shared";
import { buildDesignUserMessage, DESIGN_MAX_TOKENS, DESIGN_SYSTEM } from "./designAgent";
import {
  buildEngineeringUserMessage,
  ENGINEERING_MAX_TOKENS,
  ENGINEERING_SYSTEM,
} from "./engineeringAgent";
import {
  buildMarketingUserMessage,
  MARKETING_MAX_TOKENS,
  MARKETING_SYSTEM,
} from "./marketingAgent";
import { buildProductUserMessage, PRODUCT_MAX_TOKENS, PRODUCT_SYSTEM } from "./productAgent";
import { buildQaUserMessage, QA_MAX_TOKENS, QA_SYSTEM } from "./qaAgent";
import { buildSalesUserMessage, SALES_MAX_TOKENS, SALES_SYSTEM } from "./salesAgent";
import { streamClaude } from "../lib/anthropic";
import { emitAgentCompletedWebhook } from "../lib/webhook";
import { runNativeSyncAfterAgent } from "../integrations/native/sync";
import {
  augmentSystemPrompt,
  mergeIntegrationProfile,
} from "../integrations/registry";
import {
  clearWorkflowPause,
  completeAgentRun,
  failAgentRun,
  findRunningWorkflowBySignature,
  getAgentRun,
  getDb,
  getEditedOutputs,
  getSetting,
  getWorkflowById,
  insertKnowledge,
  setWorkflowCancelled,
  setWorkflowCompleted,
  setWorkflowFailed,
  setWorkflowPaused,
  updateWorkflowStatus,
  upsertAgentRunStart,
} from "../db/queries";
import {
  emitAgentComplete,
  emitAgentError,
  emitAgentStart,
  emitAgentToken,
  emitNativeIntegration,
  emitWorkflowPaused,
  emitWorkflowStatus,
} from "../lib/socket";

const resumeEmitters = new Map<string, EventEmitter>();
const runningWorkflows = new Set<string>();
const cancelledWorkflows = new Set<string>();

const DOMAIN_FOR: Record<AgentName, string> = {
  product: "Product Context",
  design: "Design Decisions",
  engineering: "Engineering Patterns",
  qa: "Engineering Patterns",
  marketing: "GTM History",
  sales: "GTM History",
};

function getResumeEmitter(workflowId: string): EventEmitter {
  let ee = resumeEmitters.get(workflowId);
  if (!ee) {
    ee = new EventEmitter();
    resumeEmitters.set(workflowId, ee);
  }
  return ee;
}

export function resumeWorkflowExecution(workflowId: string): void {
  getResumeEmitter(workflowId).emit("resume");
}

export function cancelWorkflowExecution(workflowId: string): void {
  cancelledWorkflows.add(workflowId);
  getResumeEmitter(workflowId).emit("resume");
}

function ensureNotCancelled(workflowId: string): void {
  if (cancelledWorkflows.has(workflowId)) {
    throw new Error("WORKFLOW_CANCELLED");
  }
}

function waitForResume(workflowId: string): Promise<void> {
  return new Promise((resolve) => {
    getResumeEmitter(workflowId).once("resume", () => {
      resolve();
    });
  });
}

function resolveApiKey(): string {
  const fromSettings = getSetting("anthropic_api_key");
  if (fromSettings && fromSettings.length > 0) return fromSettings;
  return process.env.ANTHROPIC_API_KEY ?? "";
}

function agentIncluded(agent: AgentName, scope: WorkflowScope): boolean {
  switch (scope) {
    case "product":
      return ["product", "design", "engineering", "qa"].includes(agent);
    case "marketing":
      return [
        "product",
        "design",
        "engineering",
        "qa",
        "marketing",
      ].includes(agent);
    case "sales":
    case "all":
      return true;
    default:
      return true;
  }
}

function useParallelQm(scope: WorkflowScope): boolean {
  return scope === "all" || scope === "sales";
}

function includedList(scope: WorkflowScope): AgentName[] {
  const all: AgentName[] = [
    "product",
    "design",
    "engineering",
    "qa",
    "marketing",
    "sales",
  ];
  return all.filter((a) => agentIncluded(a, scope));
}

export function agentsToResetFrom(
  from: AgentName,
  scope: WorkflowScope
): AgentName[] {
  const list = includedList(scope);
  const idx = list.indexOf(from);
  if (idx < 0) return [];
  return list.slice(idx);
}

export function resetAgentRunsFrom(
  workflowId: string,
  agents: AgentName[]
): void {
  const db = getDb();
  for (const a of agents) {
    db.prepare(
      `DELETE FROM agent_runs WHERE workflow_id = ? AND agent_name = ?`
    ).run(workflowId, a);
  }
}

function truncateForContext(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[...truncated for context...]`;
}

function getStoredOutput(workflowId: string, agent: AgentName): string {
  const edited = getEditedOutputs(workflowId)[agent];
  if (edited !== undefined) return edited;
  const row = getAgentRun(workflowId, agent);
  if (row?.status === "skipped") return "";
  return row?.output ?? "";
}

async function maybePauseAfter(
  workflowId: string,
  afterAgent: AgentName
): Promise<void> {
  if (getSetting("require_approval") !== "true") return;
  setWorkflowPaused(workflowId, afterAgent);
  emitWorkflowPaused(
    workflowId,
    afterAgent,
    "Approval required. Review output, edit if needed, then approve to continue."
  );
  emitWorkflowStatus(workflowId, "paused");
  await waitForResume(workflowId);
  clearWorkflowPause(workflowId);
  updateWorkflowStatus(workflowId, "running");
  emitWorkflowStatus(workflowId, "running");
}

async function runAgent(
  workflowId: string,
  agent: AgentName,
  integrationProviderId: string,
  exec: (onToken: (t: string) => void) => Promise<{
    fullText: string;
    tokensUsed: number;
  }>
): Promise<string> {
  ensureNotCancelled(workflowId);
  const existing = getAgentRun(workflowId, agent);
  if (existing?.status === "skipped") {
    return "";
  }
  if (existing?.status === "complete") {
    return getStoredOutput(workflowId, agent);
  }

  const runId = randomUUID();
  upsertAgentRunStart(workflowId, agent, runId, integrationProviderId);
  emitAgentStart(workflowId, agent);
  let buffer = "";
  const maxAttempts = 2;
  const timeoutMs = 240_000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timer = setTimeout(() => {
      /* soft timeout guard */
    }, timeoutMs);
    try {
      ensureNotCancelled(workflowId);
      const op = exec((t) => {
        ensureNotCancelled(workflowId);
        buffer += t;
        emitAgentToken(workflowId, agent, t);
      });
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), timeoutMs);
      });
      const { fullText, tokensUsed } = await Promise.race([op, timeout]);
      const edited = getEditedOutputs(workflowId)[agent];
      const finalOut = edited !== undefined ? edited : fullText;
      completeAgentRun(workflowId, agent, finalOut, tokensUsed);
      emitAgentComplete(workflowId, agent, finalOut, tokensUsed);
      const nativeSync = await runNativeSyncAfterAgent({
        workflowId,
        agent,
        providerId: integrationProviderId,
        outputText: finalOut,
      });
      if (nativeSync) {
        if (nativeSync.ok) {
          emitNativeIntegration(workflowId, agent, {
            ok: true,
            message: nativeSync.summary,
            url: nativeSync.url,
          });
        } else {
          emitNativeIntegration(workflowId, agent, {
            ok: false,
            message: nativeSync.error,
          });
        }
      }
      void emitAgentCompletedWebhook({
        event: "agent:complete",
        workflowId,
        agent,
        integrationProviderId,
        outputPreview: truncateForContext(finalOut, 4000),
        tokensUsed,
        nativeSync,
      });
      insertKnowledge(
        DOMAIN_FOR[agent],
        `${agent}-${workflowId}`,
        truncateForContext(finalOut, 8000),
        workflowId
      );
      clearTimeout(timer);
      return finalOut;
    } catch (err) {
      clearTimeout(timer);
      const message = err instanceof Error ? err.message : String(err);
      const transient =
        message.includes("ECONN") ||
        message.includes("network") ||
        message.includes("timeout") ||
        message.includes("aborted") ||
        message.includes("429");
      if (cancelledWorkflows.has(workflowId)) {
        throw new Error("WORKFLOW_CANCELLED");
      }
      if (attempt < maxAttempts && transient) {
        emitAgentError(
          workflowId,
          agent,
          `Transient error. Retrying (${attempt}/${maxAttempts - 1})...`
        );
        continue;
      }
      failAgentRun(workflowId, agent, message, buffer);
      emitAgentError(workflowId, agent, message);
      throw err;
    }
  }
  throw new Error("Unknown agent execution failure");
}

export async function executeWorkflow(workflowId: string): Promise<void> {
  if (runningWorkflows.has(workflowId)) return;
  runningWorkflows.add(workflowId);
  cancelledWorkflows.delete(workflowId);
  const started = Date.now();

  try {
    const wf = getWorkflowById(workflowId);
    const scope = wf.scope as WorkflowScope;
    const apiKey = resolveApiKey();
    if (!apiKey) {
      updateWorkflowStatus(workflowId, "failed");
      emitWorkflowStatus(workflowId, "failed");
      emitAgentError(
        workflowId,
        "product",
        "Missing Anthropic API key. Set ANTHROPIC_API_KEY or configure in Settings."
      );
      return;
    }

    updateWorkflowStatus(workflowId, "running");
    emitWorkflowStatus(workflowId, "running");
    ensureNotCancelled(workflowId);

    const profile = mergeIntegrationProfile(wf.integration_profile);

    if (agentIncluded("product", scope)) {
      ensureNotCancelled(workflowId);
      const cmd = wf.command;
      const prov = profile.product;
      await runAgent(workflowId, "product", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(PRODUCT_SYSTEM, "product", prov),
          userMessage: buildProductUserMessage(cmd),
          maxTokens: PRODUCT_MAX_TOKENS,
          onToken,
        })
      );
      await maybePauseAfter(workflowId, "product");
    }

    if (agentIncluded("design", scope)) {
      ensureNotCancelled(workflowId);
      const prov = profile.design;
      await runAgent(workflowId, "design", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(DESIGN_SYSTEM, "design", prov),
          userMessage: buildDesignUserMessage(getStoredOutput(workflowId, "product")),
          maxTokens: DESIGN_MAX_TOKENS,
          onToken,
        })
      );
      await maybePauseAfter(workflowId, "design");
    }

    if (agentIncluded("engineering", scope)) {
      ensureNotCancelled(workflowId);
      const prov = profile.engineering;
      await runAgent(workflowId, "engineering", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(ENGINEERING_SYSTEM, "engineering", prov),
          userMessage: buildEngineeringUserMessage(
            getStoredOutput(workflowId, "product"),
            getStoredOutput(workflowId, "design")
          ),
          maxTokens: ENGINEERING_MAX_TOKENS,
          onToken,
        })
      );
      await maybePauseAfter(workflowId, "engineering");
    }

    const engineering = getStoredOutput(workflowId, "engineering");
    const engSummary = truncateForContext(engineering, 6000);
    const prdText = getStoredOutput(workflowId, "product");

    const runQa = (): Promise<string> => {
      const prov = profile.qa;
      return runAgent(workflowId, "qa", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(QA_SYSTEM, "qa", prov),
          userMessage: buildQaUserMessage(
            getStoredOutput(workflowId, "product"),
            getStoredOutput(workflowId, "design"),
            getStoredOutput(workflowId, "engineering")
          ),
          maxTokens: QA_MAX_TOKENS,
          onToken,
        })
      );
    };

    const runMkt = (): Promise<string> => {
      const prov = profile.marketing;
      return runAgent(workflowId, "marketing", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(MARKETING_SYSTEM, "marketing", prov),
          userMessage: buildMarketingUserMessage(prdText, engSummary),
          maxTokens: MARKETING_MAX_TOKENS,
          onToken,
        })
      );
    };

    if (agentIncluded("qa", scope) && agentIncluded("marketing", scope)) {
      ensureNotCancelled(workflowId);
      if (useParallelQm(scope)) {
        await Promise.all([runQa(), runMkt()]);
        await maybePauseAfter(workflowId, "marketing");
      } else {
        await runQa();
        await maybePauseAfter(workflowId, "qa");
        await runMkt();
        await maybePauseAfter(workflowId, "marketing");
      }
    } else {
      if (agentIncluded("qa", scope)) {
        await runQa();
        await maybePauseAfter(workflowId, "qa");
      }
      if (agentIncluded("marketing", scope)) {
        await runMkt();
        await maybePauseAfter(workflowId, "marketing");
      }
    }

    if (agentIncluded("sales", scope)) {
      ensureNotCancelled(workflowId);
      const mktOut = getStoredOutput(workflowId, "marketing");
      const mktSummary = truncateForContext(mktOut, 6000);
      const prov = profile.sales;
      await runAgent(workflowId, "sales", prov, (onToken) =>
        streamClaude({
          apiKey,
          system: augmentSystemPrompt(SALES_SYSTEM, "sales", prov),
          userMessage: buildSalesUserMessage(prdText, mktSummary),
          maxTokens: SALES_MAX_TOKENS,
          onToken,
        })
      );
      await maybePauseAfter(workflowId, "sales");
    }

    const duration = Date.now() - started;
    setWorkflowCompleted(workflowId, duration);
    emitWorkflowStatus(workflowId, "completed");
  } catch (err) {
    if (err instanceof Error && err.message === "WORKFLOW_CANCELLED") {
      setWorkflowCancelled(workflowId);
      emitWorkflowStatus(workflowId, "cancelled");
    } else {
      setWorkflowFailed(workflowId);
      emitWorkflowStatus(workflowId, "failed");
    }
  } finally {
    runningWorkflows.delete(workflowId);
    cancelledWorkflows.delete(workflowId);
  }
}

export function findExistingActiveWorkflow(
  command: string,
  scope: WorkflowScope
): string | null {
  const existing = findRunningWorkflowBySignature(command, scope);
  return existing?.id ?? null;
}

export async function retryFromAgent(
  workflowId: string,
  agent: AgentName
): Promise<void> {
  const wf = getWorkflowById(workflowId);
  const scope = wf.scope as WorkflowScope;
  const toReset = agentsToResetFrom(agent, scope);
  resetAgentRunsFrom(workflowId, toReset);
  await executeWorkflow(workflowId);
}
