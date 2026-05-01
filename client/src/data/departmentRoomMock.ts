import type { AgentName } from "@nexus/shared";
import { AGENT_ORDER } from "../lib/agents";

export type DepartmentArtifact = {
  id: string;
  status: "pending" | "done" | "failed";
  timestamp: string;
  summary: string;
  fullContent: string;
};

export const DEPARTMENT_TAGLINES: Record<AgentName, string> = {
  product:
    "Scope, priorities, and acceptance — the briefing desk for every mission that leaves the floor.",
  design:
    "Experience patterns, visual language, and flows — where concepts become something you can click.",
  engineering:
    "Build plans, interfaces, and guardrails — implementation truth with traceability back to the PRD.",
  qa:
    "Verification, risk, and release readiness — structured checks before customer-facing handoff.",
  marketing:
    "Positioning, narrative, and launch surfaces — how the story lands in market.",
  sales:
    "Outreach assets, talk tracks, and deal desk collateral — revenue-facing outputs in one place.",
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

export function isAgentName(id: string): id is AgentName {
  return (AGENT_ORDER as readonly string[]).includes(id);
}

function art(
  id: string,
  status: DepartmentArtifact["status"],
  timestamp: string,
  summary: string,
  body: string
): DepartmentArtifact {
  return { id, status, timestamp, summary, fullContent: body };
}

export const MOCK_ARTIFACTS_BY_DEPT: Record<AgentName, DepartmentArtifact[]> = {
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
  design: [
    art(
      "ux-1",
      "done",
      "Yesterday",
      "Wire — department floor navigation",
      "## Navigation\n- Floor map as primary entry\n- Suite deep-link per department\n"
    ),
    art(
      "ux-2",
      "pending",
      "20m ago",
      "Visual spec — artifact cards",
      "States: default, hover, selected, error banner. Corner radius matches Command Center tokens.\n"
    ),
  ],
  engineering: [
    art(
      "eng-1",
      "done",
      "4h ago",
      "API sketch — workflow workspace manifest",
      "## GET /workflows/:id/workspace\nReturns manifest paths and sync files for the engineering desk.\n"
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
      "## Cases\n- Routing /departments and /departments/:id\n- Empty state ?empty=1\n"
    ),
    art(
      "qa-2",
      "pending",
      "10m ago",
      "Exploratory — task badge cap at 9+",
      "Verify badge shows 9+ when more than nine open tasks (localStorage demo).\n"
    ),
  ],
  marketing: [
    art(
      "mkt-1",
      "done",
      "1d ago",
      "One-pager — Command Center story",
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
};
