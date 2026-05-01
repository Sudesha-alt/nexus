import type { AgentName, WorkflowStatus } from "@nexus/shared";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { fetchSettings } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useWorkflowStore } from "../stores/workflowStore";

export function useWorkflowSocket(workflowId: string | null): void {
  const appendToken = useWorkflowStore((s) => s.appendToken);
  const setStream = useWorkflowStore((s) => s.setStream);
  const setWorkflowStatus = useWorkflowStore((s) => s.setWorkflowStatus);
  const setPauseAfter = useWorkflowStore((s) => s.setPauseAfter);
  useEffect(() => {
    if (!workflowId) return;
    const sock = getSocket();
    sock.emit("workflow:join", workflowId);

    const onStart = (p: { workflowId: string; agent: AgentName }) => {
      if (p.workflowId !== workflowId) return;
      setStream(p.agent, "");
    };
    const onToken = (p: { workflowId: string; agent: AgentName; token: string }) => {
      if (p.workflowId !== workflowId) return;
      appendToken(p.agent, p.token);
    };
    const onComplete = (p: {
      workflowId: string;
      agent: AgentName;
      output: string;
    }) => {
      if (p.workflowId !== workflowId) return;
      setStream(p.agent, p.output);
    };
    const onError = (p: { workflowId: string; agent: AgentName; message: string }) => {
      if (p.workflowId !== workflowId) return;
      void toast.error(`${p.agent}: ${p.message}`);
    };
    const onStatus = (p: { workflowId: string; status: WorkflowStatus }) => {
      if (p.workflowId !== workflowId) return;
      setWorkflowStatus(p.status);
      if (p.status === "completed") {
        void (async () => {
          const s = await fetchSettings().catch(() => null);
          if (s?.notificationsEnabled !== false) {
            toast.success("Pipeline complete");
          }
        })();
      }
      if (p.status === "failed") {
        void toast.error("Pipeline failed");
      }
    };
    const onPaused = (p: {
      workflowId: string;
      afterAgent: AgentName;
      message: string;
    }) => {
      if (p.workflowId !== workflowId) return;
      setPauseAfter(p.afterAgent);
      void toast(p.message, { icon: "⏸" });
    };

    sock.on("agent:start", onStart);
    sock.on("agent:token", onToken);
    sock.on("agent:complete", onComplete);
    sock.on("agent:error", onError);
    sock.on("workflow:status", onStatus);
    sock.on("workflow:paused", onPaused);

    const onNative = (p: {
      workflowId: string;
      agent: AgentName;
      ok: boolean;
      message: string;
      url?: string;
    }) => {
      if (p.workflowId !== workflowId) return;
      void (async () => {
        const s = await fetchSettings().catch(() => null);
        if (s?.notificationsEnabled === false) return;
        if (p.ok) {
          toast.success(`${p.agent}: ${p.message}${p.url ? ` · ${p.url}` : ""}`, {
            duration: 6000,
          });
        } else {
          toast.error(`${p.agent} sync: ${p.message}`);
        }
      })();
    };
    sock.on("integration:native", onNative);

    return () => {
      sock.emit("workflow:leave", workflowId);
      sock.off("agent:start", onStart);
      sock.off("agent:token", onToken);
      sock.off("agent:complete", onComplete);
      sock.off("agent:error", onError);
      sock.off("workflow:status", onStatus);
      sock.off("workflow:paused", onPaused);
      sock.off("integration:native", onNative);
    };
  }, [workflowId, appendToken, setStream, setWorkflowStatus, setPauseAfter]);
}
