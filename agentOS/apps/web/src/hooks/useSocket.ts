"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getTaskSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl, { path: "/socket.io", transports: ["websocket"] });
  }
  return socket;
}

export type TaskSocketHandlers = {
  onToken?: (p: { taskId: string; stepId: string; token: string }) => void;
  onStepComplete?: (p: {
    taskId: string;
    stepId: string;
    stepNumber: number;
    output: string;
  }) => void;
  onComplete?: (p: { taskId: string; finalOutput: string }) => void;
  onError?: (p: { taskId: string; error: string }) => void;
};

export function useTaskSocket(
  taskId: string | null,
  handlers: TaskSocketHandlers
) {
  const { data: session } = useSession();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!taskId || !session?.accessToken) return;
    const sock = getTaskSocket();
    sock.emit("task:join", taskId);

    const onToken = (p: { taskId: string; stepId: string; token: string }) => {
      if (p.taskId === taskId) handlersRef.current.onToken?.(p);
    };
    const onStep = (p: {
      taskId: string;
      stepId: string;
      stepNumber: number;
      output: string;
    }) => {
      if (p.taskId === taskId) handlersRef.current.onStepComplete?.(p);
    };
    const onDone = (p: { taskId: string; finalOutput: string }) => {
      if (p.taskId === taskId) handlersRef.current.onComplete?.(p);
    };
    const onErr = (p: { taskId: string; error: string }) => {
      if (p.taskId === taskId) handlersRef.current.onError?.(p);
    };

    sock.on("task:token", onToken);
    sock.on("task:step_complete", onStep);
    sock.on("task:complete", onDone);
    sock.on("task:error", onErr);

    return () => {
      sock.emit("task:leave", taskId);
      sock.off("task:token", onToken);
      sock.off("task:step_complete", onStep);
      sock.off("task:complete", onDone);
      sock.off("task:error", onErr);
    };
  }, [taskId, session?.accessToken]);
}
