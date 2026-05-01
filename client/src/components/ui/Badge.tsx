import type { ReactNode } from "react";

type Tone = "idle" | "processing" | "complete" | "error" | "skipped" | "pending";

const tones: Record<Tone, string> = {
  idle: "bg-nexus-muted/20 text-nexus-muted border-nexus-muted/30",
  processing:
    "bg-nexus-warning/15 text-nexus-warning border-nexus-warning/40 animate-pulse",
  complete: "bg-nexus-success/15 text-nexus-success border-nexus-success/40",
  error: "bg-nexus-danger/15 text-nexus-danger border-nexus-danger/40",
  skipped: "bg-nexus-violet/10 text-nexus-violet border-nexus-violet/30",
  pending: "bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/30",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}): React.ReactElement {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
