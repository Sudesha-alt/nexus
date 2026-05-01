import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

export function TopBar() {
  return (
    <header className="mb-6 flex flex-col gap-2 border-b border-black/10 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Cpu className="h-6 w-6 text-nexus-cyan" aria-hidden />
          <h1 className="font-display text-2xl tracking-[0.12em] text-nexus-text md:text-3xl">
            NEXUS
          </h1>
        </motion.div>
        <p className="mt-1 max-w-xl font-sans text-sm text-nexus-muted">
          Orchestrate intelligent agents at scale
        </p>
      </div>
      <div className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-nexus-muted">
        AI Workspace Orchestration
      </div>
    </header>
  );
}
