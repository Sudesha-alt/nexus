import type { AgentName } from "@nexus/shared";
import { motion } from "framer-motion";
import { AGENT_META } from "../../lib/agents";
import {
  corridorRibbonPath,
  ISO_CORRIDOR,
  ISO_DEPT_FILL,
  ISO_ROOM_PLAN,
  planCenter,
  planRectToTopDownSvg,
  ROOM_FOOTPRINT,
  roomFootprintPath,
  TOPDOWN_VIEW_H,
  TOPDOWN_VIEW_W,
} from "../../data/isometricFloor";
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
  const outline = roomFootprintPath(ROOM_FOOTPRINT[agent], r.x, r.y, r.width, r.height);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.04 * i, duration: 0.25 }}
    >
      <path d={outline} fill={ISO_DEPT_FILL[agent]} stroke="#0f172a" strokeWidth={2} strokeLinejoin="round" />
      {(() => {
        const tcx = r.x + r.width / 2;
        const tcy = r.y + r.height / 2;
        return (
          <path
            d={outline}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeLinejoin="round"
            transform={`translate(${tcx} ${tcy}) scale(0.96) translate(${-tcx} ${-tcy})`}
          />
        );
      })()}
      <text
        x={cx}
        y={cy - 18}
        textAnchor="middle"
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          fontWeight: 800,
          fill: "#0f172a",
          letterSpacing: "0.04em",
        }}
      >
        {meta.dept}
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
      <path
        d={outline}
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

  const hubGradId = "hub-floor-grad";
  const hubRugId = "hub-rug-pattern";
  const hubWoodId = "hub-wood-fine";

  return (
    <div className="iso-floor-stage w-full overflow-hidden">
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
          <radialGradient id={hubGradId} cx="45%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#e8d5c4" />
            <stop offset="55%" stopColor="#cfa882" />
            <stop offset="100%" stopColor="#a67c52" />
          </radialGradient>
          <pattern id={hubRugId} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={8} height={8} fill="rgba(120,53,15,0.12)" />
            <path d="M0 4 H8 M4 0 V8" stroke="rgba(69,26,3,0.15)" strokeWidth={0.6} />
          </pattern>
          <pattern id={hubWoodId} width={6} height={100} patternUnits="userSpaceOnUse">
            <path d="M0 0 V100" stroke="rgba(41,24,12,0.14)" strokeWidth={0.8} />
            <path d="M3 0 V100" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={TOPDOWN_VIEW_W} height={TOPDOWN_VIEW_H} fill="#f1f5f9" />
        <rect x={slab.x} y={slab.y} width={slab.width} height={slab.height} fill="url(#td-grid)" opacity={0.5} />

        {ROW_TOP.map((agent, i) => (
          <RoomCell
            key={agent}
            agent={agent}
            i={i}
            onRoom={onRoom}
            openTasks={openTaskCountFor(agent, tasksByDept)}
          />
        ))}

        <path
          d={corridorRibbonPath(corr.x, corr.y, corr.width, corr.height)}
          fill="#94a3b8"
          fillOpacity={0.55}
          stroke="#0f172a"
          strokeWidth={2}
          strokeDasharray="7 5"
          strokeLinejoin="round"
        />
        <g pointerEvents="none" aria-hidden>
          <path
            d={roomFootprintPath("superround", hx - 54, hy - 32, 108, 64)}
            fill={`url(#${hubGradId})`}
            stroke="#3f2e22"
            strokeWidth={2}
            strokeLinejoin="round"
            opacity={0.98}
          />
          <ellipse
            cx={hx}
            cy={hy + 2}
            rx={44}
            ry={26}
            fill={`url(#${hubRugId})`}
            stroke="#78350f"
            strokeWidth={1.2}
            strokeOpacity={0.45}
          />
          <ellipse cx={hx} cy={hy} rx={36} ry={18} fill={`url(#${hubWoodId})`} opacity={0.35} />
          <ellipse cx={hx} cy={hy - 2} rx={28} ry={12} fill="#5c3d2e" stroke="#29180c" strokeWidth={1.4} />
          <ellipse cx={hx - 18} cy={hy + 2} rx={5} ry={7} fill="#422006" stroke="#0f172a" strokeWidth={0.9} />
          <ellipse cx={hx + 18} cy={hy + 2} rx={5} ry={7} fill="#422006" stroke="#0f172a" strokeWidth={0.9} />
          <ellipse cx={hx} cy={hy - 14} rx={5} ry={7} fill="#422006" stroke="#0f172a" strokeWidth={0.9} />
          <ellipse cx={hx} cy={hy + 14} rx={5} ry={7} fill="#422006" stroke="#0f172a" strokeWidth={0.9} />
          <rect x={hx - 42} y={hy + 22} width={22} height={10} rx={2} fill="#78716c" stroke="#0f172a" strokeWidth={1} />
          <rect x={hx + 20} y={hy + 22} width={22} height={10} rx={2} fill="#78716c" stroke="#0f172a" strokeWidth={1} />
          <rect x={hx - 8} y={hy - 38} width={16} height={12} rx={2} fill="#365314" stroke="#0f172a" strokeWidth={0.9} />
          <circle cx={hx} cy={hy - 42} r={5} fill="#4d7c0f" stroke="#0f172a" strokeWidth={0.85} />
          <path
            d={`M ${hx - 6} ${hy - 48} Q ${hx} ${hy - 54} ${hx + 6} ${hy - 48}`}
            fill="none"
            stroke="#166534"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          <circle cx={hx - 50} cy={hy - 18} r={3.5} fill="#fbbf24" stroke="#0f172a" strokeWidth={0.7} opacity={0.85} />
          <line x1={hx - 50} y1={hy - 18} x2={hx - 50} y2={hy - 28} stroke="#44403c" strokeWidth={1.2} strokeLinecap="round" />
        </g>
        <text
          x={hx}
          y={hy + 48}
          textAnchor="middle"
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            fill: "#292524",
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
