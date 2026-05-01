import type { AgentName } from "@nexus/shared";
import {
  ClipboardList,
  CircuitBoard,
  Handshake,
  ListChecks,
  PenTool,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const AGENT_ORDER: AgentName[] = [
  "product",
  "design",
  "engineering",
  "qa",
  "marketing",
  "sales",
];

export const AGENT_META: Record<
  AgentName,
  { label: string; dept: string; icon: LucideIcon }
> = {
  product: { label: "PRD Agent", dept: "Product", icon: ClipboardList },
  design: { label: "Design Agent", dept: "Design", icon: PenTool },
  engineering: { label: "Engineering Agent", dept: "Engineering", icon: CircuitBoard },
  qa: { label: "QA Agent", dept: "QA", icon: ListChecks },
  marketing: { label: "Marketing Agent", dept: "Marketing", icon: Sparkles },
  sales: { label: "Sales Agent", dept: "Sales", icon: Handshake },
};
