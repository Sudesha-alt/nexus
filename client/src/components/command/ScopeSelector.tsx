import { motion } from "framer-motion";
import type { WorkflowScope } from "@nexus/shared";

const options: { id: WorkflowScope; label: string }[] = [
  { id: "product", label: "Product" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "all", label: "All Depts" },
];

export function ScopeSelector({
  value,
  onChange,
}: {
  value: WorkflowScope;
  onChange: (s: WorkflowScope) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Workflow scope">
      {options.map((o, i) => {
        const on = value === o.id;
        return (
          <motion.button
            key={o.id}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(o.id)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-cyan ${
              on
                ? "border-nexus-cyan/50 bg-nexus-cyan/15 text-nexus-cyan shadow-glowSoft"
                : "border-[rgba(0,212,255,0.15)] text-nexus-muted hover:border-nexus-cyan/30 hover:text-nexus-text"
            }`}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
