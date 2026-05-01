import { motion } from "framer-motion";
import { NavLink as RNavLink } from "react-router-dom";

export function NavLinkItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <RNavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative block rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider transition ${
          isActive
            ? "text-nexus-cyan"
            : "text-nexus-muted hover:text-nexus-text"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 -z-10 rounded-lg border border-nexus-cyan/25 bg-white shadow-glowSoft"
            />
          ) : null}
          {label}
        </>
      )}
    </RNavLink>
  );
}
