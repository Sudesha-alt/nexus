"use client";

import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";

export function AgentChainBuilder({
  agents,
  selfId,
  value,
  onChange,
}: {
  agents: { id: string; name: string }[];
  selfId?: string;
  value: string | null;
  onChange: (nextId: string | null) => void;
}) {
  const options = useMemo(
    () => agents.filter((a) => a.id !== selfId),
    [agents, selfId]
  );

  const nextName = value
    ? (agents.find((a) => a.id === value)?.name ?? "…")
    : null;

  return (
    <div className="space-y-3">
      <Label>Hand off to next agent</Label>
      <select
        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-white"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : e.target.value)
        }
      >
        <option value="">None (terminal)</option>
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-white/60">
        <span className="rounded-md bg-white/5 px-2 py-1">This agent</span>
        <ArrowRight className="h-3 w-3" />
        <span className="rounded-md bg-accent/20 px-2 py-1 text-accent">
          {nextName ?? "Terminal"}
        </span>
      </div>
    </div>
  );
}
