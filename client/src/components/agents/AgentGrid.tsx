import { motion } from "framer-motion";
import type { AgentName, AgentRunRow, AgentRunStatus } from "@nexus/shared";
import { AGENT_ORDER } from "../../lib/agents";
import { AgentCard } from "./AgentCard";

function statusFor(
  agent: AgentName,
  runs: AgentRunRow[] | undefined
): AgentRunStatus {
  const r = runs?.find((x) => x.agent_name === agent);
  return r?.status ?? "idle";
}

function outputFor(
  agent: AgentName,
  runs: AgentRunRow[] | undefined
): string | null | undefined {
  return runs?.find((x) => x.agent_name === agent)?.output;
}

export function AgentGrid({
  runs,
  workflowId,
  onRetry,
}: {
  runs?: AgentRunRow[];
  workflowId?: string;
  onRetry?: (a: AgentName) => void;
}) {
  return (
    <motion.div
      className="relative"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENT_ORDER.map((agent) => (
          <motion.div
            key={agent}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <AgentCard
              agent={agent}
              status={statusFor(agent, runs)}
              output={outputFor(agent, runs)}
              workflowId={workflowId}
              onRetry={onRetry}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
