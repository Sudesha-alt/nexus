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

export const ISO_CORRIDOR: PlanRect = { x0: 55, y0: 188, x1: 751, y1: 248 };

/** Six on-floor bays (middle top slot is HR in AgentOS — was “Design” in the Nexus client). */
export const ISO_ROOM_PLAN: Record<string, PlanRect> = {
  product: { x0: 55, y0: 40, x1: 275, y1: 175 },
  hr: { x0: 293, y0: 40, x1: 513, y1: 175 },
  engineering: { x0: 531, y0: 40, x1: 751, y1: 175 },
  qa: { x0: 55, y0: 260, x1: 275, y1: 395 },
  marketing: { x0: 293, y0: 260, x1: 513, y1: 395 },
  sales: { x0: 531, y0: 260, x1: 751, y1: 395 },
};

export type RoomFootprintKind =
  | "chamfer"
  | "capsule"
  | "hex"
  | "octagon"
  | "superround"
  | "trapezoid";

export const ROOM_FOOTPRINT: Record<string, RoomFootprintKind> = {
  product: "chamfer",
  hr: "chamfer",
  engineering: "chamfer",
  qa: "chamfer",
  marketing: "chamfer",
  sales: "chamfer",
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function roomFootprintPath(
  kind: RoomFootprintKind,
  x: number,
  y: number,
  w: number,
  h: number
): string {
  const cCh = clamp(Math.min(w, h) * 0.14, 6, 16);
  const cOc = clamp(Math.min(w, h) * 0.2, 8, 22);
  const rxRound = clamp(Math.min(w, h) * 0.24, 10, 28);

  switch (kind) {
    case "chamfer":
      return [
        `M ${x + cCh} ${y}`,
        `L ${x + w - cCh} ${y}`,
        `L ${x + w} ${y + cCh}`,
        `L ${x + w} ${y + h - cCh}`,
        `L ${x + w - cCh} ${y + h}`,
        `L ${x + cCh} ${y + h}`,
        `L ${x} ${y + h - cCh}`,
        `L ${x} ${y + cCh}`,
        "Z",
      ].join(" ");

    case "capsule": {
      const r = Math.min(w, h) / 2 - 0.5;
      const rr = clamp(r * 0.92, 4, Math.min(w, h) / 2 - 1);
      return [
        `M ${x + rr} ${y}`,
        `L ${x + w - rr} ${y}`,
        `A ${rr} ${rr} 0 0 1 ${x + w} ${y + rr}`,
        `L ${x + w} ${y + h - rr}`,
        `A ${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}`,
        `L ${x + rr} ${y + h}`,
        `A ${rr} ${rr} 0 0 1 ${x} ${y + h - rr}`,
        `L ${x} ${y + rr}`,
        `A ${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
        "Z",
      ].join(" ");
    }

    case "hex": {
      const insetX = w * 0.11;
      const midY = y + h / 2;
      return [
        `M ${x + insetX} ${y}`,
        `L ${x + w - insetX} ${y}`,
        `L ${x + w} ${midY}`,
        `L ${x + w - insetX} ${y + h}`,
        `L ${x + insetX} ${y + h}`,
        `L ${x} ${midY}`,
        "Z",
      ].join(" ");
    }

    case "octagon":
      return [
        `M ${x + cOc} ${y}`,
        `L ${x + w - cOc} ${y}`,
        `L ${x + w} ${y + cOc}`,
        `L ${x + w} ${y + h - cOc}`,
        `L ${x + w - cOc} ${y + h}`,
        `L ${x + cOc} ${y + h}`,
        `L ${x} ${y + h - cOc}`,
        `L ${x} ${y + cOc}`,
        "Z",
      ].join(" ");

    case "superround": {
      const rx = clamp(rxRound, 6, Math.min(w, h) / 2 - 1);
      return [
        `M ${x + rx} ${y}`,
        `L ${x + w - rx} ${y}`,
        `A ${rx} ${rx} 0 0 1 ${x + w} ${y + rx}`,
        `L ${x + w} ${y + h - rx}`,
        `A ${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}`,
        `L ${x + rx} ${y + h}`,
        `A ${rx} ${rx} 0 0 1 ${x} ${y + h - rx}`,
        `L ${x} ${y + rx}`,
        `A ${rx} ${rx} 0 0 1 ${x + rx} ${y}`,
        "Z",
      ].join(" ");
    }

    case "trapezoid": {
      const skew = w * 0.07;
      return [
        `M ${x + skew} ${y}`,
        `L ${x + w - skew * 0.4} ${y}`,
        `L ${x + w} ${y + h}`,
        `L ${x} ${y + h}`,
        "Z",
      ].join(" ");
    }

    default:
      return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
}

export function corridorRibbonPath(x: number, y: number, w: number, h: number): string {
  const dent = clamp(h * 0.32, 6, 16);
  const flare = clamp(w * 0.018, 4, 14);
  return [
    `M ${x + flare} ${y}`,
    `L ${x + w - flare} ${y}`,
    `L ${x + w} ${y + dent}`,
    `L ${x + w} ${y + h - dent}`,
    `L ${x + w - flare} ${y + h}`,
    `L ${x + flare} ${y + h}`,
    `L ${x} ${y + h - dent}`,
    `L ${x} ${y + dent}`,
    "Z",
  ].join(" ");
}
