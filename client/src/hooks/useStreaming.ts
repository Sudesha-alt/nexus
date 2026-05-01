import type { AgentName } from "@nexus/shared";
import { useWorkflowStore } from "../stores/workflowStore";

export function useMergedAgentOutput(
  agent: AgentName,
  completedOutput: string | null | undefined
): string {
  const stream = useWorkflowStore((s) => s.streams[agent]);
  if (stream !== undefined) return stream;
  return completedOutput ?? "";
}

/** Live preview: stream buffer or completed output, truncated */
export function useAgentPreview(
  agent: AgentName,
  completedOutput: string | null | undefined,
  maxLen = 200
): string {
  const text = useMergedAgentOutput(agent, completedOutput);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}
