import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type {
  AgentName,
  WorkflowStatus,
} from "@nexus/shared";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("workflow:join", (workflowId: string) => {
      if (typeof workflowId === "string" && workflowId.length > 0) {
        void socket.join(workflowId);
      }
    });
    socket.on("workflow:leave", (workflowId: string) => {
      if (typeof workflowId === "string") {
        void socket.leave(workflowId);
      }
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

export function emitAgentStart(workflowId: string, agent: AgentName): void {
  getIo().to(workflowId).emit("agent:start", { workflowId, agent });
}

export function emitAgentToken(
  workflowId: string,
  agent: AgentName,
  token: string
): void {
  getIo().to(workflowId).emit("agent:token", { workflowId, agent, token });
}

export function emitAgentComplete(
  workflowId: string,
  agent: AgentName,
  output: string,
  tokensUsed: number
): void {
  getIo()
    .to(workflowId)
    .emit("agent:complete", { workflowId, agent, output, tokensUsed });
}

export function emitAgentError(
  workflowId: string,
  agent: AgentName,
  message: string
): void {
  getIo().to(workflowId).emit("agent:error", { workflowId, agent, message });
}

export function emitWorkflowStatus(
  workflowId: string,
  status: WorkflowStatus
): void {
  getIo().to(workflowId).emit("workflow:status", { workflowId, status });
}

export function emitWorkflowPaused(
  workflowId: string,
  afterAgent: AgentName,
  message: string
): void {
  getIo()
    .to(workflowId)
    .emit("workflow:paused", { workflowId, afterAgent, message });
}

/** Non-fatal native vendor sync result (Linear, Figma, GitHub, HubSpot). */
export function emitNativeIntegration(
  workflowId: string,
  agent: AgentName,
  payload: { ok: boolean; message: string; url?: string }
): void {
  getIo()
    .to(workflowId)
    .emit("integration:native", { workflowId, agent, ...payload });
}
