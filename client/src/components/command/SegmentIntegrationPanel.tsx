import { motion } from "framer-motion";
import type {
  AgentName,
  IntegrationProfile,
  IntegrationProviderDTO,
} from "@nexus/shared";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchIntegrationCatalog } from "../../lib/api";
import { AGENT_META, AGENT_ORDER } from "../../lib/agents";
import { Spinner } from "../ui/Spinner";

export function SegmentIntegrationPanel({
  value,
  onChange,
}: {
  value: IntegrationProfile;
  onChange: (next: IntegrationProfile) => void;
}) {
  const [byAgent, setByAgent] = useState<
    Record<string, IntegrationProviderDTO[]> | null
  >(null);
  const [defaults, setDefaults] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchIntegrationCatalog()
      .then((d) => {
        if (!cancelled) {
          setByAgent(d.byAgent);
          setDefaults(d.defaultProviderIds);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setProvider(agent: AgentName, providerId: string) {
    onChange({ ...value, [agent]: providerId });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-nexus-muted">
        <Spinner />
        <span className="font-mono text-xs">Loading integration catalog…</span>
      </div>
    );
  }

  if (!byAgent || !defaults) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-sm text-nexus-text">
          Segment integrations
        </h3>
        <p className="mt-1 font-mono text-[10px] leading-relaxed text-nexus-muted">
          Each stage uses Claude with the methodology of the tool you pick. Profiles
          marked <span className="text-nexus-cyan">· API</span> can also push output to
          that vendor after the run when credentials are saved under Settings → Native
          integrations. Other profiles are prompt-only unless you use the agent webhook.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {AGENT_ORDER.map((agent, i) => {
          const options = byAgent[agent] ?? [];
          const current =
            value[agent] ?? (defaults[agent] as string | undefined) ?? "";
          const selected = options.find((o) => o.id === current);
          return (
            <motion.div
              key={agent}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-[rgba(0,212,255,0.12)] bg-nexus-bg/40 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-nexus-cyan">
                  {AGENT_META[agent].dept}
                </span>
                {selected ? (
                  <a
                    href={selected.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-nexus-violet hover:underline"
                  >
                    Docs <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
              <label className="sr-only" htmlFor={`prov-${agent}`}>
                Provider for {agent}
              </label>
              <select
                id={`prov-${agent}`}
                value={current}
                onChange={(e) => setProvider(agent, e.target.value)}
                className="w-full rounded-md border border-[rgba(0,212,255,0.2)] bg-nexus-surface px-2 py-2 font-mono text-[11px] text-nexus-text"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                    {o.hasNativeApi ? " · API" : ""}
                  </option>
                ))}
              </select>
              {selected ? (
                <p className="mt-2 font-mono text-[10px] text-nexus-muted">
                  {selected.vendor} · {selected.mode.replace(/_/g, " ")}
                </p>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
