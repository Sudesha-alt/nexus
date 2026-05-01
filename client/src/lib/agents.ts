import type { AgentName } from "@nexus/shared";
import {
  Brush,
  Code2,
  Megaphone,
  Rocket,
  ShieldCheck,
  Target,
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
  product: { label: "PRD Agent", dept: "Product", icon: Target },
  design: { label: "Design Agent", dept: "Design", icon: Brush },
  engineering: { label: "Engineering Agent", dept: "Engineering", icon: Code2 },
  qa: { label: "QA Agent", dept: "QA", icon: ShieldCheck },
  marketing: { label: "Marketing Agent", dept: "Marketing", icon: Megaphone },
  sales: { label: "Sales Agent", dept: "Sales", icon: Rocket },
};
