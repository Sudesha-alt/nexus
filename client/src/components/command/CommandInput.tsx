import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Build a real-time collaborative whiteboard feature for our SaaS",
  "Launch a referral program with tiered rewards for our B2B product",
  "Add AI-powered search with semantic understanding to our app",
  "Create an in-app onboarding tour for new enterprise customers",
  "Build a mobile-first checkout flow redesign with one-click purchase",
];

export function CommandInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-nexus-muted">
        <Sparkles className="h-4 w-4 text-nexus-violet" aria-hidden />
        NEXUS Command Input
      </label>
      <motion.textarea
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
        rows={5}
        placeholder="What would you like to build or launch?"
        className="shimmer-textarea w-full resize-y rounded-xl border border-[rgba(0,212,255,0.2)] bg-nexus-bg/80 p-4 font-sans text-sm text-nexus-text placeholder:text-nexus-muted/60 focus:border-nexus-cyan/50 focus:outline-none focus:ring-1 focus:ring-nexus-cyan/40 disabled:opacity-50"
      />
      <p className="font-mono text-[10px] text-nexus-muted">
        Ctrl+Enter to execute · Natural language instructions route to all agents
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            className="max-w-full rounded-full border border-[rgba(0,212,255,0.12)] bg-nexus-surface/40 px-3 py-1 text-left font-mono text-[10px] text-nexus-muted transition hover:border-nexus-cyan/30 hover:text-nexus-text disabled:opacity-50"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {s.length > 48 ? `${s.slice(0, 48)}…` : s}
          </button>
        ))}
      </div>
    </div>
  );
}
