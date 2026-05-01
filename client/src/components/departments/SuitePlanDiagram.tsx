import type { AgentName } from "@nexus/shared";
import { useId } from "react";
import { AGENT_META } from "../../lib/agents";
import { ISO_DEPT_FILL, roomFootprintPath } from "../../data/isometricFloor";
/** Suite key plan — zone geometry matches floor language (chamfers, L-zone, rounded core). */
export function SuitePlanDiagram({ dept }: { dept: AgentName }) {
  const id = useId().replace(/:/g, "");
  const hatchId = `suite-hatch-${id}`;
  const meta = AGENT_META[dept];
  const zoneA = ISO_DEPT_FILL[dept];

  const outer = roomFootprintPath("chamfer", 16, 16, 408, 268);
  const spine = roomFootprintPath("trapezoid", 18, 18, 404, 42);
  /** L-shaped output bay with open corner toward the spine. */
  const zoneAPath =
    "M 20 60 L 290 60 L 290 186 L 234 186 L 234 278 L 20 278 Z";
  const zoneBPath = roomFootprintPath("superround", 292, 62, 126, 216);

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

        <path d={outer} fill="#fafafa" stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />

        <path
          d={spine}
          fill={`url(#${hatchId})`}
          stroke="#0f172a"
          strokeWidth={1.5}
          strokeLinejoin="round"
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

        <path
          d={zoneAPath}
          fill={zoneA}
          fillOpacity={0.85}
          stroke="#0f172a"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path
          d={roomFootprintPath("hex", 48, 118, 52, 44)}
          fill="rgba(255,255,255,0.35)"
          stroke="#0f172a"
          strokeWidth={1}
          strokeLinejoin="round"
          opacity={0.9}
        />
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

        <path
          d={zoneBPath}
          fill="#e2e8f0"
          fillOpacity={0.92}
          stroke="#0f172a"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <ellipse cx={355} cy={118} rx={14} ry={22} fill="rgba(255,255,255,0.5)" stroke="#0f172a" strokeWidth={1} />
        <ellipse cx={355} cy={210} rx={14} ry={26} fill="rgba(255,255,255,0.45)" stroke="#0f172a" strokeWidth={1} />
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

        <path
          d="M 20 258 L 420 258"
          stroke="#64748b"
          strokeWidth={1}
          strokeDasharray="5 4"
          opacity={0.6}
          strokeLinecap="round"
        />
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
          SUITE PLAN · {meta.dept.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
