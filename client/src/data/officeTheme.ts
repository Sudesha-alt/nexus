import type { AgentName } from "@nexus/shared";

export type OfficeSuiteMeta = {
  suite: string;
};

export const OFFICE_SUITE: Record<AgentName, OfficeSuiteMeta> = {
  product: { suite: "Suite Product" },
  design: { suite: "Suite Design" },
  engineering: { suite: "Suite Engineering" },
  qa: { suite: "Suite QA" },
  marketing: { suite: "Suite Marketing" },
  sales: { suite: "Suite Sales" },
};
