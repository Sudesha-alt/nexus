import { motion } from "framer-motion";
import type { AgentName, AgentRunStatus } from "@nexus/shared";
import { AGENT_ORDER } from "../../lib/agents";

/** Snake path through 3x2 grid: (0,0)-(1,0)-(2,0)-(0,1)-(1,1)-(2,1) */
const POINTS: [number, number][] = [
  [16, 22],
  [50, 22],
  [84, 22],
  [16, 78],
  [50, 78],
  [84, 78],
];

function dLine(a: [number, number], b: [number, number]): string {
  return `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`;
}

function statusRank(s: AgentRunStatus): number {
  switch (s) {
    case "complete":
    case "skipped":
      return 3;
    case "processing":
      return 2;
    case "error":
      return 2;
    default:
      return 1;
  }
}

export function AgentConnector({
  statuses,
}: {
  statuses: Record<AgentName, AgentRunStatus>;
}) {
  const segments: string[] = [];
  for (let i = 0; i < POINTS.length - 1; i++) {
    segments.push(dLine(POINTS[i]!, POINTS[i + 1]!));
  }

  const activeIndex = AGENT_ORDER.findIndex(
    (a) => statuses[a] === "processing"
  );

  return (
    <div className="pointer-events-none relative mt-4 hidden h-28 w-full md:block">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full overflow-visible"
        aria-hidden
      >
        {segments.map((d, i) => {
          const from = AGENT_ORDER[i]!;
          const to = AGENT_ORDER[i + 1]!;
          const flow =
            statusRank(statuses[from]) >= 2 || statusRank(statuses[to]) >= 2;
          const hot = activeIndex === i || activeIndex === i + 1;
          return (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="rgba(0, 212, 255, 0.18)"
              strokeWidth={0.9}
              strokeDasharray="3 3"
              animate={{
                strokeDashoffset: flow ? [0, -12] : 0,
                stroke: hot
                  ? "rgba(0, 212, 255, 0.55)"
                  : "rgba(0, 212, 255, 0.18)",
              }}
              transition={{
                strokeDashoffset: {
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "linear",
                },
                stroke: { duration: 0.35 },
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
