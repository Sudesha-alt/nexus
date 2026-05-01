import { departmentAccent } from "@/lib/utils";

/** Top row of the floor map (left → right). */
export const FLOOR_ROW_TOP = ["product", "hr", "engineering"] as const;

/** Bottom row of the floor map. */
export const FLOOR_ROW_BOTTOM = ["qa", "marketing", "sales"] as const;

export const FLOOR_BAY_SLUGS = [...FLOOR_ROW_TOP, ...FLOOR_ROW_BOTTOM] as const;

export type FloorBaySlug = (typeof FLOOR_BAY_SLUGS)[number];

export const FLOOR_BAY_SET = new Set<string>(FLOOR_BAY_SLUGS);

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Soft fill for SVG bays (matches Nexus client language). */
export function departmentFill(slug: string, alpha = 0.22): string {
  const rgb = hexToRgb(departmentAccent(slug));
  if (!rgb) return `rgba(99, 102, 241, ${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

export function departmentStroke(slug: string): string {
  return departmentAccent(slug);
}
