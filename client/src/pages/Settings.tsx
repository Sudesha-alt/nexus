import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TopBar } from "../components/layout/TopBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";
import { fetchSettings, updateSettings } from "../lib/api";

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [keySet, setKeySet] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSet, setWebhookSet] = useState(false);
  const [linearApiKey, setLinearApiKey] = useState("");
  const [linearTeamId, setLinearTeamId] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [figmaFileKey, setFigmaFileKey] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [hubspotToken, setHubspotToken] = useState("");
  const [nativeFlags, setNativeFlags] = useState({
    linear: false,
    figma: false,
    github: false,
    hubspot: false,
  });

  async function load() {
    setLoading(true);
    try {
      const s = await fetchSettings();
      setRequireApproval(s.requireApproval);
      setNotifications(s.notificationsEnabled);
      setKeySet(s.anthropicApiKeySet);
      setWebhookSet(s.agentWebhookUrlSet);
      setNativeFlags(s.nativeIntegrations);
      setLinearTeamId(s.nativeIntegrationHints.linearTeamId);
      setFigmaFileKey(s.nativeIntegrationHints.figmaFileKey);
      setGithubRepo(s.nativeIntegrationHints.githubRepo);
    } catch {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    try {
      const s = await updateSettings({
        requireApproval,
        notificationsEnabled: notifications,
        anthropicApiKey: apiKey || undefined,
        agentWebhookUrl: webhookUrl || undefined,
        linearApiKey: linearApiKey || undefined,
        linearTeamId,
        figmaAccessToken: figmaToken || undefined,
        figmaFileKey,
        githubToken: githubToken || undefined,
        githubRepo,
        hubspotAccessToken: hubspotToken || undefined,
      });
      setKeySet(s.anthropicApiKeySet);
      setWebhookSet(s.agentWebhookUrlSet);
      setNativeFlags(s.nativeIntegrations);
      setLinearTeamId(s.nativeIntegrationHints.linearTeamId);
      setFigmaFileKey(s.nativeIntegrationHints.figmaFileKey);
      setGithubRepo(s.nativeIntegrationHints.githubRepo);
      setApiKey("");
      setWebhookUrl("");
      setLinearApiKey("");
      setFigmaToken("");
      setGithubToken("");
      setHubspotToken("");
      toast.success("Settings saved");
    } catch {
      toast.error("Save failed");
    }
  }

  function exportConfig() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            requireApproval,
            notificationsEnabled: notifications,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-workspace-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importConfig(f: File | undefined) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result)) as {
          requireApproval?: boolean;
          notificationsEnabled?: boolean;
        };
        if (typeof raw.requireApproval === "boolean") {
          setRequireApproval(raw.requireApproval);
        }
        if (typeof raw.notificationsEnabled === "boolean") {
          setNotifications(raw.notificationsEnabled);
        }
        toast.success("Imported — click Save to apply");
      } catch {
        toast.error("Invalid file");
      }
    };
    reader.readAsText(f);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-nexus-muted">
        <Spinner />
        Loading settings…
      </div>
    );
  }

  return (
    <div>
      <TopBar />
      <h1 className="mb-6 font-display text-2xl text-nexus-text">Settings</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <h2 className="font-display text-lg text-nexus-text">API keys</h2>
          <p className="mt-1 font-mono text-[11px] text-nexus-muted">
            Anthropic key is stored locally in SQLite. Environment variable{" "}
            <code className="text-nexus-cyan">ANTHROPIC_API_KEY</code> is used if unset.
          </p>
          <p className="mt-2 font-mono text-[10px] text-nexus-success">
            {keySet ? "API key configured in workspace." : "Using env var if available."}
          </p>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-…"
            className="mt-3 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
          />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg text-nexus-text">
            Native integrations (vendor APIs)
          </h2>
          <p className="mt-1 font-mono text-[11px] text-nexus-muted">
            Secrets stay in SQLite (or env:{" "}
            <code className="text-nexus-cyan">LINEAR_*</code>,{" "}
            <code className="text-nexus-cyan">FIGMA_*</code>,{" "}
            <code className="text-nexus-cyan">GITHUB_*</code>,{" "}
            <code className="text-nexus-cyan">HUBSPOT_ACCESS_TOKEN</code>). After each
            agent completes, NEXUS syncs when the stage profile matches: Product →
            Linear + AI, Design → Figma AI, Engineering → GitHub Copilot, QA → GitHub
            Issues, Marketing → HubSpot Breeze, Sales → HubSpot CRM (tasks).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-cyan">
                Linear (product)
              </div>
              <p className="mt-1 font-mono text-[10px] text-nexus-success">
                {nativeFlags.linear ? "Ready" : "Needs API key + team ID"}
              </p>
              <input
                type="password"
                autoComplete="off"
                value={linearApiKey}
                onChange={(e) => setLinearApiKey(e.target.value)}
                placeholder="Linear API key (new value only)"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
              <input
                type="text"
                value={linearTeamId}
                onChange={(e) => setLinearTeamId(e.target.value)}
                placeholder="Team UUID"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-cyan">
                Figma (design)
              </div>
              <p className="mt-1 font-mono text-[10px] text-nexus-success">
                {nativeFlags.figma ? "Ready" : "Needs PAT + file key"}
              </p>
              <input
                type="password"
                autoComplete="off"
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                placeholder="Personal access token"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
              <input
                type="text"
                value={figmaFileKey}
                onChange={(e) => setFigmaFileKey(e.target.value)}
                placeholder="File key (from figma.com/file/…)"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-cyan">
                GitHub (engineering + QA)
              </div>
              <p className="mt-1 font-mono text-[10px] text-nexus-success">
                {nativeFlags.github ? "Ready" : "Needs token + owner/repo"}
              </p>
              <input
                type="password"
                autoComplete="off"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="Fine-grained or classic PAT"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="owner/repo"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-cyan">
                HubSpot (marketing + sales)
              </div>
              <p className="mt-1 font-mono text-[10px] text-nexus-success">
                {nativeFlags.hubspot ? "Ready" : "Needs private app token"}
              </p>
              <input
                type="password"
                autoComplete="off"
                value={hubspotToken}
                onChange={(e) => setHubspotToken(e.target.value)}
                placeholder="Private app access token (crm.objects.notes/tasks)"
                className="mt-2 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-nexus-text">
            Agent webhook (LangGraph / n8n / Make)
          </h2>
          <p className="mt-1 font-mono text-[11px] text-nexus-muted">
            POST URL invoked after each agent completes. Payload:{" "}
            <code className="text-nexus-cyan">agent:complete</code> with{" "}
            <code className="text-nexus-cyan">workflowId</code>,{" "}
            <code className="text-nexus-cyan">integrationProviderId</code>,{" "}
            <code className="text-nexus-cyan">outputPreview</code>,{" "}
            <code className="text-nexus-cyan">tokensUsed</code>.
          </p>
          <p className="mt-2 font-mono text-[10px] text-nexus-success">
            {webhookSet ? "Webhook URL saved." : "Optional — leave empty to disable."}
          </p>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n-instance/webhook/nexus-agent"
            className="mt-3 w-full rounded-lg border border-[rgba(0,212,255,0.2)] bg-nexus-bg px-3 py-2 font-mono text-sm text-nexus-text"
          />
        </Card>

        <Card>
          <h2 className="font-display text-lg text-nexus-text">Orchestration</h2>
          <label className="mt-3 flex cursor-pointer items-center gap-2 font-mono text-xs text-nexus-text">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="accent-nexus-cyan"
            />
            Require manual approval between agents
          </label>
          <label className="mt-3 flex cursor-pointer items-center gap-2 font-mono text-xs text-nexus-text">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="accent-nexus-cyan"
            />
            Toast notifications
          </label>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-nexus-text">Team (mock)</h2>
          <ul className="mt-3 space-y-2 font-mono text-xs text-nexus-muted">
            <li>Alex Rivera — CEO</li>
            <li>Jordan Lee — Chief of Staff</li>
            <li>Sam Patel — Ops</li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-nexus-text">Workspace config</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={exportConfig}>
              Export JSON
            </Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgba(0,212,255,0.2)] px-4 py-2 font-mono text-sm text-nexus-text hover:border-nexus-cyan/40">
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => importConfig(e.target.files?.[0])}
              />
            </label>
          </div>
        </Card>
      </motion.div>

      <div className="mt-8">
        <Button type="button" onClick={() => void save()}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
