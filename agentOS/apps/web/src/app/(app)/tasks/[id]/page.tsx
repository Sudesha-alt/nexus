"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { OutputPanel } from "@/components/tasks/OutputPanel";
import { PipelineTracker } from "@/components/tasks/PipelineTracker";
import { Badge } from "@/components/ui/badge";
import { useTask } from "@/hooks/useTasks";
import { useTaskSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";

export default function TaskLivePage() {
  const params = useParams();
  const id = params.id as string;
  const qc = useQueryClient();
  const { data: task, refetch } = useTask(id);
  const [stream, setStream] = useState("");
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  useTaskSocket(id, {
    onToken: ({ stepId, token }) => {
      setActiveStepId(stepId);
      setStream((s) => s + token);
    },
    onStepComplete: () => {
      setStream("");
      void refetch();
    },
    onComplete: () => {
      void refetch();
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      void refetch();
    },
  });

  useEffect(() => {
    setStream("");
  }, [activeStepId]);

  const steps = task?.steps ?? [];
  const complete = task?.status === "completed";

  return (
    <>
      <Topbar title={task?.title ?? "Task"} />
      <main className="p-4 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {task ? (
            <Badge
              variant={
                task.status === "completed"
                  ? "success"
                  : task.status === "failed"
                    ? "error"
                    : "default"
              }
            >
              {task.status}
            </Badge>
          ) : null}
          <span className="font-mono text-xs text-white/50">
            {task ? new Date(task.createdAt).toLocaleString() : ""}
          </span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-[40%]">
            <h2 className="mb-3 font-sans text-sm font-semibold text-white/80">
              Pipeline
            </h2>
            <PipelineTracker
              steps={steps.map((s: (typeof steps)[number]) => ({
                id: s.id,
                stepNumber: s.stepNumber,
                status: s.status,
                tokensUsed: s.tokensUsed,
                startedAt: s.startedAt,
                completedAt: s.completedAt,
                agent: s.agent,
              }))}
              activeStepId={activeStepId}
            />
          </div>
          <div className="flex-1 lg:w-[60%]">
            <OutputPanel
              streaming={stream}
              steps={steps.map((s: (typeof steps)[number]) => ({
                id: s.id,
                stepNumber: s.stepNumber,
                output: s.output,
              }))}
              finalOutput={task?.finalOutput ?? null}
              taskComplete={complete}
            />
          </div>
        </div>
      </main>
    </>
  );
}
