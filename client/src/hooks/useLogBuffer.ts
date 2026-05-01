import type { AgentName } from "@nexus/shared";
import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

export function useLogBuffer(workflowId: string | null): string[] {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!workflowId) return;
    setLines([]);
    const sock = getSocket();
    const onTok = (p: { workflowId: string; agent: AgentName; token: string }) => {
      if (p.workflowId !== workflowId) return;
      setLines((prev) => {
        const next = [...prev, p.token];
        return next.length > 500 ? next.slice(-500) : next;
      });
    };
    const onStart = (p: { workflowId: string; agent: AgentName }) => {
      if (p.workflowId !== workflowId) return;
      setLines((prev) => [...prev, `\n--- ${p.agent} start ---\n`]);
    };
    sock.on("agent:token", onTok);
    sock.on("agent:start", onStart);
    return () => {
      sock.off("agent:token", onTok);
      sock.off("agent:start", onStart);
    };
  }, [workflowId]);

  return lines;
}
