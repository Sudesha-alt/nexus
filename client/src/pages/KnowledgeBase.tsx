import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { clearKnowledgeDomain, fetchKnowledge } from "../lib/api";

const DOMAIN_LABELS: Record<string, string> = {
  "Product Context": "Product Context",
  "Design Decisions": "Design Decisions",
  "Engineering Patterns": "Engineering Patterns",
  "GTM History": "GTM History",
};

export function KnowledgeBase() {
  const [data, setData] = useState<
    Record<
      string,
      { id: string; value: string; workflow_id: string; created_at: string }[]
    >
  >({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetchKnowledge();
      setData(res.byDomain);
    } catch {
      toast.error("Could not load knowledge");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const domains = Object.keys(DOMAIN_LABELS);

  return (
    <div>
      <TopBar />
      <h1 className="mb-2 font-display text-2xl text-nexus-text">Knowledge base</h1>
      <p className="mb-6 max-w-2xl font-sans text-sm text-nexus-muted">
        Consolidated memory from agent outputs. Each card maps to a strategic domain.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-nexus-muted">
          <Spinner />
          Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {domains.map((domain, i) => {
            const rows = data[domain] ?? [];
            const expanded = open[domain] ?? false;
            return (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg text-nexus-cyan">
                        {DOMAIN_LABELS[domain]}
                      </h2>
                      <p className="mt-1 font-mono text-[10px] text-nexus-muted">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      className="!py-1 !text-[10px]"
                      onClick={() => {
                        void clearKnowledgeDomain(domain)
                          .then(() => {
                            toast.success("Domain cleared");
                            void load();
                          })
                          .catch(() => toast.error("Clear failed"));
                      }}
                    >
                      Clear memory
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="mt-3 font-mono text-[11px] text-nexus-cyan hover:underline"
                    onClick={() =>
                      setOpen((o) => ({ ...o, [domain]: !expanded }))
                    }
                  >
                    {expanded ? "Collapse" : "Expand contents"}
                  </button>
                  {expanded ? (
                    <div className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-[rgba(0,212,255,0.12)] bg-nexus-bg p-3">
                      {rows.length === 0 ? (
                        <p className="font-mono text-xs text-nexus-muted">Empty.</p>
                      ) : (
                        rows.map((r) => (
                          <div
                            key={r.id}
                            className="border-b border-[rgba(0,212,255,0.08)] pb-3 last:border-0"
                          >
                            <div className="font-mono text-[10px] text-nexus-muted">
                              {new Date(r.created_at).toLocaleString()} ·{" "}
                              {r.workflow_id.slice(0, 8)}…
                            </div>
                            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] text-nexus-text">
                              {r.value}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
