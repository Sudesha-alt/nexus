"use client";

import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StepRow = {
  id: string;
  stepNumber: number;
  status: string;
  tokensUsed: number | null;
  startedAt: string | null;
  completedAt: string | null;
  agent: { name: string; role: string };
};

export function PipelineTracker({
  steps,
  activeStepId,
}: {
  steps: StepRow[];
  activeStepId: string | null;
}) {
  return (
    <div className="space-y-3">
      {steps.map((s) => {
        const running = s.status === "running" || s.id === activeStepId;
        const done = s.status === "completed";
        const failed = s.status === "failed";
        return (
          <motion.div
            key={s.id}
            layout
            className={cn(
              "rounded-xl border border-border bg-surface p-3",
              running && "border-accent shadow-[0_0_0_1px_rgba(99,102,241,0.4)]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{s.agent.name}</p>
                <p className="text-xs text-white/50">{s.agent.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {running ? (
                  <motion.span
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </motion.span>
                ) : null}
                {done ? <Check className="h-4 w-4 text-success" /> : null}
                {failed ? <Badge variant="error">failed</Badge> : null}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono text-white/40">
              <span>#{s.stepNumber}</span>
              {s.tokensUsed != null ? <span>{s.tokensUsed} tok</span> : null}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
