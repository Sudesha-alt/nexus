import type { AgentName } from "@nexus/shared";
import { motion } from "framer-motion";
import { AGENT_META } from "../../lib/agents";
import {
  ISO_CORRIDOR,
  ISO_DEPT_FILL,
  ISO_ROOM_PLAN,
  planCenter,
  planRectToTopDownSvg,
  TOPDOWN_VIEW_H,
  TOPDOWN_VIEW_W,
} from "../../data/isometricFloor";
import { OFFICE_SUITE } from "../../data/officeTheme";
import type { DeptTask } from "../../stores/departmentTaskStore";
import { openTaskCountFor } from "../../stores/departmentTaskStore";

const ROW_TOP: AgentName[] = ["product", "design", "engineering"];
const ROW_BOT: AgentName[] = ["qa", "marketing", "sales"];

function TopDeskHint({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g pointerEvents="none" opacity={0.9}>
      <rect x={cx - 36} y={cy - 10} width={72} height={22} rx={2} fill="white" stroke="#0f172a" strokeWidth={1.2} />
      <rect x={cx - 4} y={cy - 22} width={8} height={14} rx={1} fill="#334155" stroke="#0f172a" strokeWidth={0.8} />
      <circle cx={cx - 22} cy={cy + 18} r={5} fill="#15803d" stroke="#0f172a" strokeWidth={0.9} />
    </g>
  );
}

function RoomCell({
  agent,
  i,
  onRoom,
  openTasks,
}: {
  agent: AgentName;
  i: number;
  onRoom: (a: AgentName) => void;
  openTasks: number;
}) {
  const r = planRectToTopDownSvg(ISO_ROOM_PLAN[agent]);
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;
  const meta = AGENT_META[agent];
  const suite = OFFICE_SUITE[agent].suite.replace("Suite ", "");

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.04 * i, duration: 0.25 }}
    >
      <rect
        x={r.x}
        y={r.y}
        width={r.width}
        height={r.height}
        rx={3}
        fill={ISO_DEPT_FILL[agent]}
        stroke="#0f172a"
        strokeWidth={2}
      />
      <rect
        x={r.x + 4}
        y={r.y + 4}
        width={r.width - 8}
        height={r.height - 8}
        rx={2}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <text
        x={cx}
        y={r.y + 22}
        textAnchor="middle"
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 14,
          fontWeight: 800,
          fill: "#0f172a",
          letterSpacing: "0.06em",
        }}
      >
        {suite}
      </text>
      <text
        x={cx}
        y={r.y + 38}
        textAnchor="middle"
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.18em",
          fill: "#475569",
        }}
      >
        {meta.dept.toUpperCase()}
      </text>
      <TopDeskHint cx={cx} cy={cy + 12} />
      {openTasks > 0 ? (
        <g pointerEvents="none">
          <circle
            cx={r.x + r.width - 16}
            cy={r.y + r.height - 18}
            r={12}
            fill="#0f172a"
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={r.x + r.width - 16}
            y={r.y + r.height - 14}
            textAnchor="middle"
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10,
              fontWeight: 800,
              fill: "white",
            }}
          >
            {openTasks > 9 ? "9+" : openTasks}
          </text>
        </g>
      ) : null}
      <rect
        x={r.x}
        y={r.y}
        width={r.width}
        height={r.height}
        rx={3}
        fill="transparent"
        className="cursor-pointer outline-none hover:fill-white/25 focus:fill-sky-200/30"
        role="button"
        tabIndex={0}
        aria-label={`Open ${meta.dept}${openTasks ? `, ${openTasks} open tasks` : ""}`}
        onClick={() => onRoom(agent)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onRoom(agent);
          }
        }}
      />
    </motion.g>
  );
}

export function TopDownFloorPlan({
  onRoom,
  tasksByDept,
}: {
  onRoom: (a: AgentName) => void;
  tasksByDept: Partial<Record<AgentName, DeptTask[]>>;
}) {
  const slab = planRectToTopDownSvg({ x0: 40, y0: 28, x1: 796, y1: 472 });
  const corr = planRectToTopDownSvg(ISO_CORRIDOR);
  const hub = planCenter(ISO_CORRIDOR);
  const hx = hub.x;
  const hy = hub.y;

  return (
    <div className="iso-floor-stage w-full overflow-hidden rounded-xl border-2 border-[#0f172a] bg-slate-100 shadow-[6px_8px_0_rgba(15,23,42,0.16)]">
      <svg
        viewBox={`0 0 ${TOPDOWN_VIEW_W} ${TOPDOWN_VIEW_H}`}
        className="block h-auto w-full max-h-[min(70vh,520px)]"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Top-down floor plan of department bays"
      >
        <defs>
          <pattern id="td-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth={0.6} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={TOPDOWN_VIEW_W} height={TOPDOWN_VIEW_H} fill="#f1f5f9" />
        <rect x={slab.x} y={slab.y} width={slab.width} height={slab.height} fill="url(#td-grid)" opacity={0.5} />
        <rect
          x={slab.x}
          y={slab.y}
          width={slab.width}
          height={slab.height}
          fill="none"
          stroke="#0f172a"
          strokeWidth={2.5}
          rx={4}
        />

        {ROW_TOP.map((agent, i) => (
          <RoomCell
            key={agent}
            agent={agent}
            i={i}
            onRoom={onRoom}
            openTasks={openTaskCountFor(agent, tasksByDept)}
          />
        ))}

        <rect
          x={corr.x}
          y={corr.y}
          width={corr.width}
          height={corr.height}
          fill="#94a3b8"
          fillOpacity={0.55}
          stroke="#0f172a"
          strokeWidth={2}
          strokeDasharray="8 6"
          rx={2}
        />
        <ellipse cx={hx} cy={hy} rx={46} ry={22} fill="#e2e8f0" stroke="#0f172a" strokeWidth={1.5} />
        <rect x={hx - 38} y={hy - 10} width={76} height={20} rx={4} fill="#b45309" stroke="#0f172a" strokeWidth={1.2} />
        <text
          x={hx}
          y={hy + 34}
          textAnchor="middle"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            fill: "#1e293b",
          }}
        >
          HUB
        </text>

        {ROW_BOT.map((agent, i) => (
          <RoomCell
            key={agent}
            agent={agent}
            i={i + 3}
            onRoom={onRoom}
            openTasks={openTaskCountFor(agent, tasksByDept)}
          />
        ))}

        <text
          x={12}
          y={TOPDOWN_VIEW_H - 10}
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 7,
            letterSpacing: "0.12em",
            fill: "#64748b",
          }}
        >
          TOP VIEW · NOT TO SCALE · OPEN TASKS BADGE PER BAY
        </text>
      </svg>
    </div>
  );
}
