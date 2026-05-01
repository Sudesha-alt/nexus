import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEPT_HEX: Record<string, string> = {
  engineering: "#3B82F6",
  product: "#8B5CF6",
  qa: "#F59E0B",
  sales: "#10B981",
  marketing: "#EC4899",
  hr: "#F97316",
  finance: "#14B8A6",
};

export function departmentAccent(slug: string): string {
  return DEPT_HEX[slug] ?? "#6366F1";
}
