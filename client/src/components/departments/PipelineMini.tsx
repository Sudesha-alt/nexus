import type { AgentName } from "@nexus/shared";
import { motion } from "framer-motion";
import { AGENT_META, AGENT_ORDER } from "../../lib/agents";

export function PipelineMini({
  current,
  variant = "default",
}: {
  current: AgentName;
  variant?: "default" | "arch" | "iso";
}) {
  const idx = AGENT_ORDER.indexOf(current);
  const step = idx + 1;
  const total = AGENT_ORDER.length;
  const arch = variant === "arch";
  const iso = variant === "iso";

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between font-mono text-[11px] ${arch || iso ? "" : "text-nexus-muted"} ${iso ? "text-slate-500" : ""} ${arch ? "text-[var(--arch-ink-mute)]" : ""}`}
      >
        <span>
          {iso ? "Handoff order · " : arch ? "Sequence ref. · " : "Pipeline position · "}
          <strong
            className={
              iso ? "text-slate-900" : arch ? "text-[var(--arch-ink)]" : "text-nexus-text"
            }
          >
            {step}/{total}: {AGENT_META[current].dept}
          </strong>
        </span>
      </div>
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="list"
        aria-label="Workflow pipeline"
      >
        {AGENT_ORDER.map((agent, i) => {
          const meta = AGENT_META[agent];
          const isCurrent = agent === current;
          const isPast = i < idx;
          return (
            <motion.div
              key={agent}
              role="listitem"
              layout
              className="flex items-center gap-1.5"
              initial={false}
              animate={isCurrent ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
            >
              {i > 0 ? (
                <span
                  className={`mx-0.5 text-[10px] ${
                    iso
                      ? isPast || isCurrent
                        ? "text-sky-600/70"
                        : "text-slate-300"
                      : arch
                        ? isPast || isCurrent
                          ? "text-teal-800/55"
                          : "text-[var(--arch-ink-mute)]/40"
                        : isPast || isCurrent
                          ? "text-nexus-cyan/60"
                          : "text-nexus-muted/40"
                  }`}
                  aria-hidden
                >
                  →
                </span>
              ) : null}
              <span
                className={
                  iso
                    ? `rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                        isCurrent
                          ? "border-sky-600 bg-sky-500/15 text-sky-900 shadow-[inset_0_0_0_1px_rgba(2,132,199,0.35)]"
                          : isPast
                            ? "border-slate-300 bg-white text-slate-600"
                            : "border-slate-200 bg-slate-50/80 text-slate-400"
                      }`
                    : arch
                      ? `rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                          isCurrent
                            ? "border-teal-800 bg-teal-800/10 text-teal-900 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.35)]"
                            : isPast
                              ? "border-[var(--arch-wall)]/25 bg-white/60 text-[var(--arch-ink-mute)]"
                              : "border-[var(--arch-wall)]/15 bg-white/40 text-[var(--arch-ink-mute)]"
                        }`
                      : `rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                          isCurrent
                            ? "border-nexus-cyan bg-nexus-cyan/10 text-nexus-cyan shadow-glowSoft"
                            : isPast
                              ? "border-nexus-success/35 bg-nexus-success/5 text-nexus-success"
                              : "border-black/10 bg-white/50 text-nexus-muted"
                        }`
                }
              >
                {meta.dept}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
