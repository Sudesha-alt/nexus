import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Card({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}): React.ReactElement {
  return (
    <motion.div
      layout
      className={`glass-panel rounded-2xl p-4 transition-shadow ${
        active ? "shadow-glow border-nexus-cyan/40" : "border-black/10"
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
