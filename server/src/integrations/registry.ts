import type { AgentName } from "@nexus/shared";

/** How NEXUS connects today: Claude mirrors vendor methodology; native vendor APIs are rare. */
export type IntegrationMode = "nexus_claude_augmented" | "docs_reference_only";

export interface IntegrationProviderDefinition {
  id: string;
  agent: AgentName;
  name: string;
  vendor: string;
  documentationUrl: string;
  mode: IntegrationMode;
  /** When mode is nexus_claude_augmented, appended to the base system prompt. */
  systemAugment: string;
  /** True if a public programmatic API exists for headless runs (most PM/design tools use MCP or in-app only). */
  hasNativeApi: boolean;
}

/**
 * Curated from public positioning & docs hubs. NEXUS does not call vendor APIs unless hasNativeApi and keys exist.
 * Documentation URLs are official or primary product pages for your teams to follow.
 */
export const INTEGRATION_PROVIDERS: IntegrationProviderDefinition[] = [
  // —— Product ——
  {
    id: "chatprd",
    agent: "product",
    name: "ChatPRD",
    vendor: "ChatPRD",
    documentationUrl: "https://www.chatprd.ai/docs",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Emulate ChatPRD-style PM documentation: turn rough intent into a tight, gap-aware PRD. Explicitly call out missing assumptions, edge cases, and open questions. Prefer scannable Markdown with clear acceptance criteria. Note: ChatPRD exposes MCP for IDEs (see their MCP docs), not a general REST API — this run mirrors that output style in NEXUS.`,
  },
  {
    id: "remy_mindstudio",
    agent: "product",
    name: "Remy (MindStudio)",
    vendor: "MindStudio",
    documentationUrl: "https://www.mindstudio.ai/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Emulate a MindStudio-style product agent: synthesize themes from disparate signals (feedback, risks, roadmap constraints). Stress prioritization, stakeholder-ready summaries, and fast concept-to-spec flow.`,
  },
  {
    id: "linear_ai",
    agent: "product",
    name: "Linear + AI",
    vendor: "Linear",
    documentationUrl: "https://linear.app/docs",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `Structure output so it maps cleanly to issue trackers: initiatives, milestones, crisp issues with labels, and dependencies. Reference Linear-style hierarchy (Project → Cycle → Issue) where helpful.`,
  },
  {
    id: "notion_ai",
    agent: "product",
    name: "Notion AI / living PRD",
    vendor: "Notion",
    documentationUrl: "https://www.notion.so/help/guides/category/ai",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Format for a living workspace: toggles, callouts, stakeholder summary blocks, and inline “decision log” snippets suitable for Notion or Confluence.`,
  },
  {
    id: "productboard_ai",
    agent: "product",
    name: "Productboard AI",
    vendor: "Productboard",
    documentationUrl: "https://www.productboard.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Emphasize customer-signal-to-priority: link problems to outcomes, score impact/effort, and align features to strategic objectives.`,
  },
  // —— Design ——
  {
    id: "figma_ai",
    agent: "design",
    name: "Figma AI (Make)",
    vendor: "Figma",
    documentationUrl: "https://help.figma.com/hc/en-us",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `Emulate Figma-forward design specs: frames, components, variants, auto-layout notes, and handoff-ready annotations. Mention design-system alignment and dev-mode considerations. (Figma REST API covers files, not generative “Make” — mirror the UX intent in text + ASCII.)`,
  },
  {
    id: "google_stitch",
    agent: "design",
    name: "Google Stitch (ex-Galileo)",
    vendor: "Google",
    documentationUrl: "https://stitch.withgoogle.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Bias toward prompt-to-UI flows: structured screen inventory, Tailwind-friendly layout hints, and HTML-oriented component boundaries where useful.`,
  },
  {
    id: "uizard",
    agent: "design",
    name: "Uizard",
    vendor: "Uizard",
    documentationUrl: "https://uizard.io/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Favor rapid wireframe thinking: low-fi blocks, iterative revision notes, and chat-friendly “change requests” the way Uizard’s prompt UX works.`,
  },
  {
    id: "ux_pilot",
    agent: "design",
    name: "UX Pilot",
    vendor: "UX Pilot",
    documentationUrl: "https://uxpilot.ai/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Stress user journeys and flow diagrams in text, early IA, and Figma-plugin-style handoff lists before hi-fi polish.`,
  },
  {
    id: "relume_ai",
    agent: "design",
    name: "Relume AI",
    vendor: "Relume",
    documentationUrl: "https://www.relume.io/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Lead with sitemap and section-level wireframes (especially marketing / landing flows) before component detail.`,
  },
  {
    id: "v0_vercel",
    agent: "design",
    name: "v0 (Vercel)",
    vendor: "Vercel",
    documentationUrl: "https://v0.dev/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Optimize for React/Next.js shadcn-style component splits, server/client boundaries, and copy-pasteable UI primitives.`,
  },
  // —— Engineering ——
  {
    id: "claude_code",
    agent: "engineering",
    name: "Claude Code",
    vendor: "Anthropic",
    documentationUrl: "https://docs.anthropic.com/en/docs/claude-code",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Use Claude Code-like rigor: multi-file reasoning, explicit file paths in examples, incremental migration notes, and strong test hooks. Prefer clear module boundaries and security notes.`,
  },
  {
    id: "cursor",
    agent: "engineering",
    name: "Cursor",
    vendor: "Cursor",
    documentationUrl: "https://docs.cursor.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Structure plans for Composer-style edits: repo-wide refactors as numbered steps, search/replace friendly snippets, and @-symbol file references in prose.`,
  },
  {
    id: "devin",
    agent: "engineering",
    name: "Devin",
    vendor: "Cognition",
    documentationUrl: "https://devin.ai/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Frame work as an autonomous engineer: environment assumptions, browser/automation touchpoints, PR-sized deliverables, and explicit “done” criteria.`,
  },
  {
    id: "copilot",
    agent: "engineering",
    name: "GitHub Copilot",
    vendor: "GitHub",
    documentationUrl: "https://docs.github.com/en/copilot",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `GitHub-centric: issues → branches → PR outline; Copilot-friendly comments; Actions hooks where relevant.`,
  },
  {
    id: "windsurf",
    agent: "engineering",
    name: "Windsurf (Cascade)",
    vendor: "Codeium / Google",
    documentationUrl: "https://codeium.com/windsurf",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Cascade-style agentic flow: plan then act, with explicit checkpoints and rollback notes.`,
  },
  {
    id: "cline",
    agent: "engineering",
    name: "Cline",
    vendor: "Cline",
    documentationUrl: "https://github.com/cline/cline",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Separate Plan vs Act in the write-up; highlight MCP integrations and cost-transparent API usage patterns.`,
  },
  // —— QA ——
  {
    id: "github_issues",
    agent: "qa",
    name: "GitHub Issues",
    vendor: "GitHub",
    documentationUrl: "https://docs.github.com/en/rest/issues",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `GitHub-centric QA deliverables: findings as numbered issues, severity, repro steps, and trace links. When native sync is configured, NEXUS opens a GitHub issue with this stage output.`,
  },
  {
    id: "qawolf",
    agent: "qa",
    name: "QA Wolf",
    vendor: "QA Wolf",
    documentationUrl: "https://docs.qawolf.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Emulate agentic QA Wolf style: natural-language goals → Playwright/Appium-grade steps, maintenance notes, and root-cause-oriented failure analysis.`,
  },
  {
    id: "mabl",
    agent: "qa",
    name: "Mabl",
    vendor: "Mabl",
    documentationUrl: "https://help.mabl.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Self-healing, low-flake framing; API + web + mobile coverage matrices; regression suites as first-class.`,
  },
  {
    id: "momentic",
    agent: "qa",
    name: "Momentic",
    vendor: "Momentic",
    documentationUrl: "https://momentic.ai/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Record-and-validate flows with ML-friendly assertions; call out non-deterministic / LLM-output testing.`,
  },
  {
    id: "applitools",
    agent: "qa",
    name: "Applitools",
    vendor: "Applitools",
    documentationUrl: "https://applitools.com/docs/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Visual regression emphasis: viewport matrix, perceptual diff narrative, accessibility-adjacent visual checks.`,
  },
  {
    id: "testmu_ai",
    agent: "qa",
    name: "TestMu AI (LambdaTest)",
    vendor: "LambdaTest",
    documentationUrl: "https://www.lambdatest.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Agentic QE platform framing: plan → author → execute → analyze across web/mobile scale.`,
  },
  {
    id: "virtuoso_qa",
    agent: "qa",
    name: "Virtuoso QA",
    vendor: "Virtuoso",
    documentationUrl: "https://docs.virtuoso.qa/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Plain-language test logic, resilient selectors, and exec-summary failure explanations.`,
  },
  // —— Marketing ——
  {
    id: "jasper",
    agent: "marketing",
    name: "Jasper AI",
    vendor: "Jasper",
    documentationUrl: "https://www.jasper.ai/help",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Jasper-style GTM workspace: channel-specific variants, brand-voice placeholders, and reusable content atoms for downstream automation.`,
  },
  {
    id: "hubspot_breeze",
    agent: "marketing",
    name: "HubSpot Breeze AI",
    vendor: "HubSpot",
    documentationUrl: "https://knowledge.hubspot.com/ai-tools",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `CRM-aware campaigns: lifecycle stages, sequences, social + email + chat alignment; object-centric copy (contacts, deals).`,
  },
  {
    id: "gumloop",
    agent: "marketing",
    name: "Gumloop",
    vendor: "Gumloop",
    documentationUrl: "https://www.gumloop.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Visual workflow thinking: triggers, data pulls, branching, and always-on monitors described as pipeline steps.`,
  },
  {
    id: "perplexity_research",
    agent: "marketing",
    name: "Perplexity / research agents",
    vendor: "Various",
    documentationUrl: "https://www.perplexity.ai/hub/blog/introducing-perplexity-api",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Cite-style competitive intel and trend synthesis sections (with “verify externally” disclaimers); source-forward research outline.`,
  },
  {
    id: "surfer_seo",
    agent: "marketing",
    name: "Surfer SEO AI",
    vendor: "Surfer",
    documentationUrl: "https://surferseo.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `SEO content briefs: keyword clusters, intent, headings, internal link prompts, and score-oriented structure.`,
  },
  {
    id: "hootsuite_buffer",
    agent: "marketing",
    name: "Hootsuite / Buffer AI",
    vendor: "Hootsuite / Buffer",
    documentationUrl: "https://help.hootsuite.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Calendar-ready social packs with platform constraints (char limits, hashtag policy placeholders).`,
  },
  // —— Sales ——
  {
    id: "hubspot_crm",
    agent: "sales",
    name: "HubSpot CRM (tasks)",
    vendor: "HubSpot",
    documentationUrl: "https://developers.hubspot.com/docs/api/crm/tasks",
    mode: "nexus_claude_augmented",
    hasNativeApi: true,
    systemAugment: `Enterprise CRM-native: opportunities, forecasting commentary, coaching prompts, account plans. When native sync is configured, NEXUS creates a HubSpot task from this stage output (same HubSpot token as marketing).`,
  },
  {
    id: "eleven_x",
    agent: "sales",
    name: "11x.ai (Alice / Julian)",
    vendor: "11x",
    documentationUrl: "https://www.11x.ai/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Autonomous SDR + voice-agent framing: 24/7 sequences, multilingual touchpoints, strict compliance/ethics notes, and handoff to human AE.`,
  },
  {
    id: "reply_io",
    agent: "sales",
    name: "Reply.io",
    vendor: "Reply",
    documentationUrl: "https://help.reply.io/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Multichannel outbound: email + LI + calls, deliverability guardrails, CRM field mapping hints.`,
  },
  {
    id: "salesforce_agentforce",
    agent: "sales",
    name: "Salesforce Agentforce",
    vendor: "Salesforce",
    documentationUrl: "https://www.salesforce.com/agentforce/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Enterprise CRM-native: opportunities, forecasting commentary, coaching prompts, account plans.`,
  },
  {
    id: "conversica",
    agent: "sales",
    name: "Conversica",
    vendor: "Conversica",
    documentationUrl: "https://www.conversica.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Conversational revenue assistant: polite persistence, intent scoring, meeting-booking flows.`,
  },
  {
    id: "relevance_ai_sales",
    agent: "sales",
    name: "Relevance AI",
    vendor: "Relevance AI",
    documentationUrl: "https://relevanceai.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Multi-agent sales workforce: prospecting vs follow-up vs call-prep agents with handoff contracts.`,
  },
  {
    id: "highspot_ai",
    agent: "sales",
    name: "Highspot AI",
    vendor: "Highspot",
    documentationUrl: "https://www.highspot.com/",
    mode: "nexus_claude_augmented",
    hasNativeApi: false,
    systemAugment: `Enablement-heavy: battlecards, role-play scripts, just-in-time coaching snippets.`,
  },
];

export const DEFAULT_PROVIDER_BY_AGENT: Record<AgentName, string> = {
  product: "chatprd",
  design: "figma_ai",
  engineering: "claude_code",
  qa: "qawolf",
  marketing: "jasper",
  sales: "eleven_x",
};

/** Meta orchestration tools (use with webhooks / future LangGraph). */
export const ORCHESTRATION_CONNECTORS = [
  {
    id: "langgraph",
    name: "LangChain / LangGraph",
    documentationUrl: "https://langchain-ai.github.io/langgraph/",
    note: "Graph-native agent state; pair with NEXUS webhooks to feed graph nodes.",
  },
  {
    id: "crewai",
    name: "CrewAI",
    documentationUrl: "https://docs.crewai.com/",
    note: "Role-based crews; map each NEXUS segment output to a crew task via webhook.",
  },
  {
    id: "relevance_orchestration",
    name: "Relevance AI (orchestration)",
    documentationUrl: "https://relevanceai.com/",
    note: "No-code multi-agent builders for enterprise routing.",
  },
  {
    id: "n8n_make",
    name: "n8n / Make",
    documentationUrl: "https://docs.n8n.io/",
    note: "Point NEXUS “Agent webhook URL” at a workflow to fan out to 700+ apps.",
  },
] as const;

export function providersForAgent(agent: AgentName): IntegrationProviderDefinition[] {
  return INTEGRATION_PROVIDERS.filter((p) => p.agent === agent);
}

export function getProvider(
  agent: AgentName,
  providerId: string
): IntegrationProviderDefinition | undefined {
  return INTEGRATION_PROVIDERS.find((p) => p.agent === agent && p.id === providerId);
}

export function mergeIntegrationProfile(
  raw: Partial<Record<AgentName, string>> | null | undefined
): Record<AgentName, string> {
  const agents: AgentName[] = [
    "product",
    "design",
    "engineering",
    "qa",
    "marketing",
    "sales",
  ];
  const out = {} as Record<AgentName, string>;
  for (const a of agents) {
    const pick = raw?.[a];
    const def = pick && getProvider(a, pick) ? pick : DEFAULT_PROVIDER_BY_AGENT[a];
    out[a] = def;
  }
  return out;
}

export function augmentSystemPrompt(
  baseSystem: string,
  agent: AgentName,
  providerId: string
): string {
  const p = getProvider(agent, providerId);
  if (!p || p.mode !== "nexus_claude_augmented") return baseSystem;
  const nativeLine = p.hasNativeApi
    ? `This profile supports **native sync**: after the run, NEXUS can push a summary to ${p.vendor} when the matching credentials are saved in Settings.`
    : `NEXUS runs this stage via Claude using the methodology below (no live ${p.vendor} API call unless you add one externally).`;
  return `${baseSystem}

---

## Integration profile: ${p.name} (${p.vendor})
Documentation: ${p.documentationUrl}
${nativeLine}

${p.systemAugment}`;
}
