import type { AgentRunRow, WorkflowRow } from "@nexus/shared";
import { useCallback, useEffect, useState } from "react";
import { fetchWorkflowDetail } from "../lib/api";

export function useWorkflowDetail(id: string | undefined): {
  data: {
    workflow: WorkflowRow;
    pauseAfterAgent: string | null;
    agents: AgentRunRow[];
    editedOutputs: Partial<Record<import("@nexus/shared").AgentName, string>>;
  } | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<{
    workflow: WorkflowRow;
    pauseAfterAgent: string | null;
    agents: AgentRunRow[];
    editedOutputs: Partial<Record<import("@nexus/shared").AgentName, string>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await fetchWorkflowDetail(id);
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
