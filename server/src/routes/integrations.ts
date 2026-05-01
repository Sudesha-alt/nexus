import { Router } from "express";
import type {
  AgentName,
  IntegrationProviderDTO,
  OrchestrationConnectorDTO,
} from "@nexus/shared";
import {
  DEFAULT_PROVIDER_BY_AGENT,
  INTEGRATION_PROVIDERS,
  ORCHESTRATION_CONNECTORS,
  providersForAgent,
} from "../integrations/registry";

const router = Router();

function toDto(p: (typeof INTEGRATION_PROVIDERS)[number]): IntegrationProviderDTO {
  return {
    id: p.id,
    agent: p.agent,
    name: p.name,
    vendor: p.vendor,
    documentationUrl: p.documentationUrl,
    mode: p.mode,
    hasNativeApi: p.hasNativeApi,
  };
}

router.get("/providers", (_req, res) => {
  const agents: AgentName[] = [
    "product",
    "design",
    "engineering",
    "qa",
    "marketing",
    "sales",
  ];
  const byAgent: Record<string, IntegrationProviderDTO[]> = {};
  for (const a of agents) {
    byAgent[a] = providersForAgent(a).map(toDto);
  }
  const orchestration: OrchestrationConnectorDTO[] = ORCHESTRATION_CONNECTORS.map(
    (c) => ({
      id: c.id,
      name: c.name,
      documentationUrl: c.documentationUrl,
      note: c.note,
    })
  );
  res.json({
    byAgent,
    orchestration,
    defaultProviderIds: DEFAULT_PROVIDER_BY_AGENT as Record<string, string>,
  });
});

export default router;
