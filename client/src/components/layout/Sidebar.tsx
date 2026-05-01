import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLinkItem } from "./NavLink";

const links = [
  { to: "/", label: "Command" },
  { to: "/history", label: "History" },
  { to: "/knowledge", label: "Knowledge" },
  { to: "/integrations", label: "Integrations" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white/90 text-nexus-cyan md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-black/10 bg-white/45 py-6 pl-4 pr-2 backdrop-blur-md md:flex">
        <div className="mb-8 px-2 font-display text-xl tracking-widest text-nexus-cyan">
          NEXUS
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLinkItem key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="flex h-full w-72 flex-col border-r border-black/10 bg-white/90 p-4 shadow-glow"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg text-nexus-cyan">NEXUS</span>
                <button
                  type="button"
                  className="rounded-lg border border-black/10 p-2 text-nexus-text"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLinkItem
                    key={l.to}
                    to={l.to}
                    label={l.label}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
