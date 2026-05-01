import type { AgentName } from "@nexus/shared";

/** Plan-space rectangle (same units as the orchestration slab). */
export type PlanRect = { x0: number; y0: number; x1: number; y1: number };

const PLAN: PlanRect = { x0: 40, y0: 28, x1: 796, y1: 472 };

const PAD = 10;
const INNER_W = 800;
const INNER_H = 480;

export const TOPDOWN_VIEW_W = INNER_W + PAD * 2;
export const TOPDOWN_VIEW_H = INNER_H + PAD * 2;

function planToSvg(x: number, y: number): { x: number; y: number } {
  return {
    x: PAD + ((x - PLAN.x0) / (PLAN.x1 - PLAN.x0)) * INNER_W,
    y: PAD + ((y - PLAN.y0) / (PLAN.y1 - PLAN.y0)) * INNER_H,
  };
}

export function planRectToTopDownSvg(r: PlanRect): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const p0 = planToSvg(r.x0, r.y0);
  const p1 = planToSvg(r.x1, r.y1);
  return {
    x: p0.x,
    y: p0.y,
    width: Math.max(0, p1.x - p0.x),
    height: Math.max(0, p1.y - p0.y),
  };
}

export function planCenter(r: PlanRect): { x: number; y: number } {
  const cx = (r.x0 + r.x1) / 2;
  const cy = (r.y0 + r.y1) / 2;
  return planToSvg(cx, cy);
}

/** Horizontal circulation band between the two department rows. */
export const ISO_CORRIDOR: PlanRect = { x0: 55, y0: 188, x1: 751, y1: 248 };

export const ISO_ROOM_PLAN: Record<AgentName, PlanRect> = {
  product: { x0: 55, y0: 40, x1: 275, y1: 175 },
  design: { x0: 293, y0: 40, x1: 513, y1: 175 },
  engineering: { x0: 531, y0: 40, x1: 751, y1: 175 },
  qa: { x0: 55, y0: 260, x1: 275, y1: 395 },
  marketing: { x0: 293, y0: 260, x1: 513, y1: 395 },
  sales: { x0: 531, y0: 260, x1: 751, y1: 395 },
};

export const ISO_DEPT_COLOR: Record<AgentName, string> = {
  product: "#0d9488",
  design: "#7c3aed",
  engineering: "#2563eb",
  qa: "#ca8a04",
  marketing: "#db2777",
  sales: "#ea580c",
};

export const ISO_DEPT_FILL: Record<AgentName, string> = {
  product: "rgba(13,148,136,0.22)",
  design: "rgba(124,58,237,0.2)",
  engineering: "rgba(37,99,235,0.2)",
  qa: "rgba(202,138,4,0.22)",
  marketing: "rgba(219,39,119,0.18)",
  sales: "rgba(234,88,12,0.2)",
};
