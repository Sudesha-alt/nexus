import { FLOOR_BAY_SLUGS, type FloorBaySlug } from "@/lib/floorLayout";

export type DepartmentArtifact = {
  id: string;
  status: "pending" | "done" | "failed";
  timestamp: string;
  summary: string;
  fullContent: string;
};

export type IntegrationToggle = {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
};

export const INTEGRATION_TOGGLES: IntegrationToggle[] = [
  {
    id: "slack",
    label: "Slack summaries",
    description: "Post milestone summaries to a channel (demo toggle only).",
    defaultOn: true,
  },
  {
    id: "linear",
    label: "Linear export",
    description: "Mirror approved artifacts as draft issues (demo).",
    defaultOn: false,
  },
  {
    id: "notion",
    label: "Notion snapshot",
    description: "Append a page block when artifacts are approved (demo).",
    defaultOn: true,
  },
];

function art(
  id: string,
  status: DepartmentArtifact["status"],
  timestamp: string,
  summary: string,
  body: string
): DepartmentArtifact {
  return { id, status, timestamp, summary, fullContent: body };
}

/** Editorial taglines for suite hero — extended for all AgentOS departments. */
export const DEPARTMENT_TAGLINES: Record<string, string> = {
  product:
    "Scope, priorities, and acceptance — the briefing desk for every mission that leaves the floor.",
  hr: "People programs, talent rhythm, and org health — where hiring and culture meet operations.",
  engineering:
    "Build plans, interfaces, and guardrails — implementation truth with traceability back to the PRD.",
  qa: "Verification, risk, and release readiness — structured checks before customer-facing handoff.",
  marketing: "Positioning, narrative, and launch surfaces — how the story lands in market.",
  sales: "Outreach assets, talk tracks, and deal desk collateral — revenue-facing outputs in one place.",
  finance: "Forecast packs, variance stories, and board-ready views — fiscal clarity for decisions.",
  legal:
    "Contract posture, risk flags, and playbooks — commercial language that keeps velocity safe.",
  "customer-success":
    "Onboarding paths, health signals, and expansion plays — customer outcomes in one command view.",
};

export const MOCK_ARTIFACTS_BY_DEPT: Partial<Record<string, DepartmentArtifact[]>> = {
  product: [
    art(
      "prd-1",
      "done",
      "2h ago",
      "PRD v0.4 — onboarding checklist",
      "# PRD fragment\n\n## Goal\nReduce time-to-first-value for new workspaces.\n\n## Must-have\n- Invite flow\n- Default templates\n"
    ),
    art(
      "prd-2",
      "pending",
      "Just now",
      "Open question: enterprise SSO scope",
      "We need a decision on IdP coverage for the pilot. Options: Okta only vs Okta + Azure AD.\n"
    ),
  ],
  hr: [
    art(
      "hr-1",
      "done",
      "Yesterday",
      "Pipeline brief — engineering reqs",
      "## Focus\n- Senior backend\n- Remote-friendly\n- Comp band L5–L6\n"
    ),
    art(
      "hr-2",
      "pending",
      "1h ago",
      "Policy draft — PTO carryover",
      "Legal review pending; target publish next sprint.\n"
    ),
  ],
  engineering: [
    art(
      "eng-1",
      "done",
      "4h ago",
      "API sketch — agent workspace manifest",
      "## GET /api/agents/:id/context\nReturns manifest paths and sync files for the engineering desk.\n"
    ),
    art(
      "eng-2",
      "failed",
      "1h ago",
      "Spike — streaming artifact updates",
      "Prototype hit backpressure on large markdown payloads; needs chunked flush or debounce.\n"
    ),
  ],
  qa: [
    art(
      "qa-1",
      "done",
      "3d ago",
      "Test matrix — department suite smoke",
      "## Cases\n- Routing /departments and /departments/:slug\n- Floor map task badges\n"
    ),
    art(
      "qa-2",
      "pending",
      "10m ago",
      "Exploratory — task badge cap at 9+",
      "Verify badge shows 9+ when more than nine open tasks (localStorage).\n"
    ),
  ],
  marketing: [
    art(
      "mkt-1",
      "done",
      "1d ago",
      "One-pager — AgentOS story",
      "## Headline\nOrchestrate agents like departments on a floor.\n\n## CTA\nOpen the floor map.\n"
    ),
  ],
  sales: [
    art(
      "sales-1",
      "pending",
      "30m ago",
      "Talk track — integrations toggles",
      "Position local toggles as demo session controls; enterprise connects via registry.\n"
    ),
    art(
      "sales-2",
      "done",
      "5h ago",
      "Outbound snippet — pilot qualification",
      "Three questions: team size, IdP, and required connectors.\n"
    ),
  ],
  finance: [
    art(
      "fin-1",
      "pending",
      "45m ago",
      "QBR pack — burn vs plan",
      "Variance drivers: infra +0.8pp, hiring +1.2pp. Narrative for board slide 4.\n"
    ),
  ],
  legal: [
    art(
      "leg-1",
      "done",
      "6h ago",
      "MSA redline — liability cap",
      "Aligned to 12-month cap at fees paid; carve-outs for IP + confidentiality.\n"
    ),
  ],
  "customer-success": [
    art(
      "cs-1",
      "pending",
      "25m ago",
      "QBR outline — renewal at risk",
      "Health score yellow; expansion paused until adoption milestone hit.\n"
    ),
  ],
};

export function defaultTaglineForSlug(slug: string, apiDescription?: string): string {
  if (DEPARTMENT_TAGLINES[slug]) return DEPARTMENT_TAGLINES[slug];
  if (apiDescription?.trim()) return apiDescription;
  return "Department workspace — agents, tasks, and outputs in one suite.";
}

export function isFloorBaySlug(slug: string): slug is FloorBaySlug {
  return (FLOOR_BAY_SLUGS as readonly string[]).includes(slug);
}
