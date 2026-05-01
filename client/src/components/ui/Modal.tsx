import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  onClose,
  children,
  surface = "glass",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  surface?: "glass" | "iso";
}): ReactElement {
  const iso = surface === "iso";
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${iso ? "bg-slate-900/75" : "bg-black/70"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            className={
              iso
                ? "max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-md border-2 border-[#0f172a] bg-white shadow-[8px_10px_0_#0f172a]"
                : "glass-panel max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[rgba(0,212,255,0.2)] shadow-glow"
            }
          >
            <div
              className={
                iso
                  ? "flex items-center justify-between border-b-2 border-[#0f172a] bg-[#0f172a] px-4 py-3"
                  : "flex items-center justify-between border-b border-[rgba(0,212,255,0.12)] px-4 py-3"
              }
            >
              <h2
                id="modal-title"
                className={
                  iso
                    ? "pr-4 font-mono text-sm font-bold uppercase tracking-wide text-sky-200"
                    : "font-display text-lg text-nexus-text"
                }
              >
                {title}
              </h2>
              <Button
                type="button"
                variant="ghost"
                className={iso ? "!border-white/20 !text-sky-100 hover:!bg-white/10" : "!p-2"}
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[calc(85vh-56px)] overflow-y-auto p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
