import { motion } from "framer-motion";
import type { ReactElement, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-nexus-cyan to-emerald-400 text-white font-mono font-semibold shadow-glow hover:shadow-glowSoft border border-nexus-cyan/30",
  ghost:
    "bg-white/60 text-nexus-text border border-black/10 hover:border-nexus-cyan/50 font-mono",
  danger:
    "bg-nexus-danger/15 text-nexus-danger border border-nexus-danger/40 font-mono hover:bg-nexus-danger/20",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}): ReactElement {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-cyan disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
