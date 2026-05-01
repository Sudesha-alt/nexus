import type { AgentName } from "@nexus/shared";
import { useId } from "react";
import { AGENT_META } from "../../lib/agents";
import { ISO_DEPT_FILL } from "../../data/isometricFloor";
import { OFFICE_SUITE } from "../../data/officeTheme";

/** Suite key plan — matches isometric workspace (ink + flat fills) */
export function SuitePlanDiagram({ dept }: { dept: AgentName }) {
  const id = useId().replace(/:/g, "");
  const hatchId = `suite-hatch-${id}`;
  const meta = AGENT_META[dept];
  const suite = OFFICE_SUITE[dept].suite.replace("Suite ", "");
  const zoneA = ISO_DEPT_FILL[dept];

  return (
    <div className="iso-card overflow-hidden">
      <svg
        className="block w-full bg-slate-50/80"
        viewBox="0 0 440 300"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <pattern id={hatchId} width={10} height={10} patternUnits="userSpaceOnUse">
            <path d="M0 10 L10 0" stroke="rgba(15,23,42,0.07)" strokeWidth={1} />
          </pattern>
        </defs>

        <rect x={20} y={20} width={400} height={260} fill="#fafafa" stroke="#0f172a" strokeWidth={2} rx={2} />

        <rect
          x={20}
          y={20}
          width={400}
          height={40}
          fill={`url(#${hatchId})`}
          stroke="#0f172a"
          strokeWidth={1.5}
        />
        <text
          x={280}
          y={46}
          textAnchor="middle"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: "0.24em",
            fill: "#475569",
            fontWeight: 600,
          }}
        >
          WORKFLOW SPINE
        </text>

        <rect x={20} y={60} width={270} height={220} fill={zoneA} fillOpacity={0.85} stroke="#0f172a" strokeWidth={1.5} />
        <text
          x={36}
          y={88}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            fill: "#0f172a",
          }}
        >
          ZONE A — OUTPUT
        </text>
        <text
          x={36}
          y={108}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 8,
            letterSpacing: "0.1em",
            fill: "#64748b",
          }}
        >
          ARTIFACTS / REVIEW
        </text>

        <rect x={290} y={60} width={130} height={220} fill="#e2e8f0" fillOpacity={0.9} stroke="#0f172a" strokeWidth={1.5} />
        <text
          x={304}
          y={88}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.12em",
            fill: "#0f172a",
          }}
        >
          ZONE B
        </text>
        <text
          x={304}
          y={106}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 8,
            letterSpacing: "0.08em",
            fill: "#64748b",
          }}
        >
          SERVICE CORE
        </text>
        <text x={304} y={124} style={{ fontFamily: "ui-monospace, monospace", fontSize: 7, fill: "#94a3b8" }}>
          Integrations
        </text>

        <line x1={20} y1={258} x2={420} y2={258} stroke="#64748b" strokeWidth={1} strokeDasharray="5 4" opacity={0.6} />
        <text
          x={220}
          y={282}
          textAnchor="middle"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 8,
            letterSpacing: "0.16em",
            fill: "#475569",
            fontWeight: 600,
          }}
        >
          SUITE {suite} · {meta.dept.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
