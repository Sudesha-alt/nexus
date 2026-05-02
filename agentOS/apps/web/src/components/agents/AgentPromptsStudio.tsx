"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AgentListRow } from "@/hooks/useAgents";

export function AgentPromptsStudio({ agents }: { agents: AgentListRow[] | undefined }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const departments = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of agents ?? []) m.set(a.departmentId, a.department.name);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [agents]);

  const filtered = useMemo(() => {
    let list = agents ?? [];
    if (deptFilter) list = list.filter((a) => a.departmentId === deptFilter);
    if (deferredSearch) {
      list = list.filter((a) => {
        const hay = `${a.name} ${a.role} ${a.department.name} ${a.systemPrompt}`.toLowerCase();
        return hay.includes(deferredSearch);
      });
    }
    return list;
  }, [agents, deptFilter, deferredSearch]);

  const selected = useMemo(
    () => filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      setDraft("");
      return;
    }
    if (selectedId && filtered.some((a) => a.id === selectedId)) {
      const cur = filtered.find((a) => a.id === selectedId)!;
      setDraft(cur.systemPrompt);
      return;
    }
    const first = filtered[0];
    setSelectedId(first.id);
    setDraft(first.systemPrompt);
  }, [filtered, selectedId]);

  const save = useMutation({
    mutationFn: async ({ id, systemPrompt }: { id: string; systemPrompt: string }) => {
      const { data } = await api.put(`/api/agents/${id}`, { systemPrompt });
      return data as AgentListRow;
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["agents"] });
      void qc.invalidateQueries({ queryKey: ["agent", vars.id] });
      setBanner({ kind: "ok", text: "System prompt saved." });
      window.setTimeout(() => setBanner(null), 3500);
    },
    onError: () => {
      setBanner({ kind: "err", text: "Could not save. Check your session and try again." });
    },
  });

  const dirty =
    selected != null && draft !== selected.systemPrompt;

  if (!agents?.length) {
    return (
      <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-sm text-white/50">
        <FileText className="mx-auto mb-3 h-10 w-10 text-white/25" />
        <p>No agents yet. Create one to edit system prompts.</p>
        <Button type="button" className="mt-4" asChild>
          <Link href="/agents/new">New agent</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-4 lg:flex-row">
      <aside className="flex w-full flex-col gap-3 lg:w-80 lg:shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input
            className="pl-9"
            placeholder="Search name, role, department, prompt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter agents"
          />
        </div>
        <div>
          <Label className="text-xs text-white/45">Department</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All departments</option>
            {departments.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <p className="font-mono text-[10px] text-white/40">
          {filtered.length} agent{filtered.length === 1 ? "" : "s"}
          {deferredSearch || deptFilter ? " (filtered)" : ""}
        </p>
        <ul className="max-h-[55vh] space-y-1 overflow-y-auto pr-1 lg:max-h-[calc(100vh-14rem)]">
          {filtered.map((a) => {
            const active = selected?.id === a.id;
            const preview = a.systemPrompt.replace(/\s+/g, " ").trim().slice(0, 72);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(a.id);
                    setDraft(a.systemPrompt);
                    setBanner(null);
                  }}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition",
                    active
                      ? "border-accent bg-accent/10 shadow-glowSoft"
                      : "border-border bg-surface/60 hover:border-white/20"
                  )}
                >
                  <p className="font-medium text-white">{a.name}</p>
                  <p className="mt-0.5 text-xs text-accent">{a.role}</p>
                  <p className="mt-1 font-mono text-[10px] text-white/40">{a.department.name}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/45">{preview || "—"}</p>
                  <p className="mt-1 font-mono text-[10px] text-white/35">{a.systemPrompt.length} chars</p>
                </button>
              </li>
            );
          })}
        </ul>
        {filtered.length === 0 ? (
          <p className="text-sm text-white/45">No agents match this filter.</p>
        ) : null}
      </aside>

      <section className="min-w-0 flex-1 space-y-4">
        {selected ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="font-sans text-xl font-semibold text-white">{selected.name}</h2>
                <p className="text-sm text-accent">{selected.role}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="muted">{selected.department.name}</Badge>
                  {selected.skill ? (
                    <Badge variant="default" className="font-mono text-[10px]">
                      Skill: {selected.skill.title}
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/agents/${selected.id}`}>Agent detail</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!dirty || save.isPending}
                  onClick={() => save.mutate({ id: selected.id, systemPrompt: draft })}
                >
                  {save.isPending ? "Saving…" : "Save prompt"}
                </Button>
              </div>
            </div>

            {banner ? (
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  banner.kind === "ok"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                    : "border border-red-500/30 bg-red-500/10 text-red-100"
                )}
              >
                {banner.text}
              </div>
            ) : null}

            <div>
              <Label className="text-white/70">System prompt</Label>
              <Textarea
                className="mt-2 min-h-[min(60vh,520px)] font-mono text-xs leading-relaxed"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
              />
              <p className="mt-2 font-mono text-[10px] text-white/40">
                {draft.length} characters
                {dirty ? " · unsaved changes" : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!dirty}
                onClick={() => setDraft(selected.systemPrompt)}
              >
                Revert to saved
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/50">Select an agent from the list.</p>
        )}
      </section>
    </div>
  );
}
