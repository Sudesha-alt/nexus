import { motion } from "framer-motion";
import { Check, Plug } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

type Integration = {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: string;
  summary?: string;
};

const INITIAL: Integration[] = [
  { id: "github", name: "GitHub", connected: true, lastSync: "2h ago", summary: "12 repos indexed" },
  { id: "figma", name: "Figma", connected: false },
  { id: "slack", name: "Slack", connected: true, lastSync: "10m ago", summary: "#nexus-alerts" },
  { id: "linear", name: "Linear", connected: false },
  { id: "notion", name: "Notion", connected: true, lastSync: "1d ago", summary: "PRD templates" },
  { id: "gads", name: "Google Ads", connected: false },
  { id: "meta", name: "Meta Ads", connected: false },
  { id: "linkedin", name: "LinkedIn", connected: false },
  { id: "vercel", name: "Vercel", connected: true, lastSync: "3h ago", summary: "3 projects" },
  { id: "hubspot", name: "HubSpot", connected: false },
];

export function Integrations() {
  const [items, setItems] = useState(INITIAL);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              connected: !x.connected,
              lastSync: !x.connected ? "just now" : undefined,
              summary: !x.connected ? "Mock connection" : undefined,
            }
          : x
      )
    );
    toast.success("Integration updated (mock)");
  }

  return (
    <div>
      <TopBar />
      <h1 className="mb-2 font-display text-2xl text-nexus-text">Integrations</h1>
      <p className="mb-6 max-w-2xl font-sans text-sm text-nexus-muted">
        Connect external systems. OAuth flows are mocked — this UI demonstrates connection
        states only.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card active={it.connected}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-bg/80">
                    <Plug className="h-5 w-5 text-nexus-violet" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-nexus-text">{it.name}</div>
                    <div className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
                      {it.connected ? (
                        <>
                          <Check className="h-3 w-3 text-nexus-success" />
                          Connected
                        </>
                      ) : (
                        "Disconnected"
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={it.connected ? "ghost" : "primary"}
                  className="!py-1 !text-[10px]"
                  onClick={() => toggle(it.id)}
                >
                  {it.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              {it.connected ? (
                <p className="mt-3 font-mono text-[10px] text-nexus-muted">
                  Last sync: {it.lastSync}
                  {it.summary ? ` · ${it.summary}` : ""}
                </p>
              ) : null}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
