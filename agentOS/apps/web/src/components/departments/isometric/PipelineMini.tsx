"use client";

import { motion } from "framer-motion";
import { FLOOR_BAY_SLUGS } from "@/lib/floorLayout";

export function PipelineMini({
  currentSlug,
  labels,
}: {
  currentSlug: string;
  labels: Record<string, string>;
}) {
  const order: string[] = [...FLOOR_BAY_SLUGS];
  const idx = order.indexOf(currentSlug);
  const inSpine = idx >= 0;
  const step = inSpine ? idx + 1 : order.length;
  const total = order.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
        <span>
          Handoff order ·{" "}
          <strong className="text-slate-900">
            {inSpine ? `${step}/${total}: ${labels[currentSlug] ?? currentSlug}` : `${labels[currentSlug] ?? currentSlug} · support suite`}
          </strong>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5" role="list" aria-label="Workflow pipeline">
        {order.map((slug, i) => {
          const label = labels[slug] ?? slug;
          const isCurrent = slug === currentSlug;
          const isPast = inSpine && i < idx;
          return (
            <motion.div
              key={slug}
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
                    isPast || isCurrent ? "text-sky-600/70" : "text-slate-300"
                  }`}
                  aria-hidden
                >
                  →
                </span>
              ) : null}
              <span
                className={`rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  isCurrent
                    ? "border-sky-600 bg-sky-500/15 text-sky-900 shadow-[inset_0_0_0_1px_rgba(2,132,199,0.35)]"
                    : isPast
                      ? "border-slate-300 bg-white text-slate-600"
                      : "border-slate-200 bg-slate-50/80 text-slate-400"
                }`}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
      {!inSpine ? (
        <p className="font-mono text-[10px] text-slate-500">
          This suite is off the six-bay floor (product, HR, engineering, QA, marketing, sales) — typical for finance,
          legal, and customer success.
        </p>
      ) : null}
    </div>
  );
}
