import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function ExecuteButton({
  running,
  onClick,
  disabled,
}: {
  running: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled || running}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-xl border border-nexus-cyan/40 bg-gradient-to-r from-nexus-cyan/90 to-nexus-violet/90 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-nexus-bg shadow-glow transition disabled:opacity-50 md:w-auto md:min-w-[200px]"
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        <Play className="h-4 w-4" />
        {running ? "Running…" : "Execute"}
      </span>
      <motion.span
        className="pointer-events-none absolute inset-0 bg-white/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
}
