import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { WorkflowMetrics } from "@nexus/shared";
import { Activity, Clock, Gauge, Orbit } from "lucide-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, value, {
      duration: 0.85,
      ease: "easeOut",
      onUpdate: setV,
    });
    return () => c.stop();
  }, [value]);
  return (
    <span>
      {Math.round(v)}
      {suffix}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  children,
  delay,
}: {
  icon: typeof Activity;
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel flex min-w-[140px] flex-1 items-center gap-3 rounded-xl border border-[rgba(0,212,255,0.12)] p-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-cyan/10 text-nexus-cyan">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-nexus-muted">
          {label}
        </div>
        <div className="font-display text-lg text-nexus-text">{children}</div>
      </div>
    </motion.div>
  );
}

export function MetricsBar({ metrics }: { metrics: WorkflowMetrics | null }) {
  if (!metrics) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-xl bg-nexus-surface/60"
          />
        ))}
      </div>
    );
  }

  const avgMin =
    metrics.avgCompletionMs !== null
      ? Math.round(metrics.avgCompletionMs / 60000)
      : null;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={Orbit} label="Workflows" delay={0}>
        <AnimatedNumber value={metrics.totalWorkflows} />
      </StatCard>
      <StatCard icon={Activity} label="Active agents" delay={0.08}>
        <AnimatedNumber value={metrics.activeAgents} />
      </StatCard>
      <StatCard icon={Clock} label="Avg time (min)" delay={0.16}>
        {avgMin !== null ? <AnimatedNumber value={avgMin} /> : "—"}
      </StatCard>
      <StatCard icon={Gauge} label="Success rate" delay={0.24}>
        {metrics.successRatePercent !== null ? (
          <AnimatedNumber value={metrics.successRatePercent} suffix="%" />
        ) : (
          "—"
        )}
      </StatCard>
    </div>
  );
}
